/**
 * Cloudflare Worker: serves the built SPA and proxies a free crypto price feed.
 *
 * The old CryptoCompare endpoint went paid, so `/api/prices` now walks a chain of
 * keyless public exchange tickers and returns the first one that answers. Proxying
 * through the Worker also sidesteps CORS and per-region exchange blocks, since the
 * request leaves from Cloudflare's edge instead of the browser.
 */

interface Ticker {
  price: number;
  /** 24h volume in the quote currency, i.e. roughly USD. */
  volume: number;
  /** The exchange pair this came from, e.g. BTCUSDT — needed to ask for history. */
  pair: string;
}

interface FeedPayload {
  source: string;
  ts: number;
  count: number;
  prices: Record<string, number>;
  volumes: Record<string, number>;
  /** Price as of `baselineWindow` ago. Only present when ?baseline= is asked for. */
  opens?: Record<string, number>;
  baselineWindow?: string;
  /** Only the bases whose pair is not `<base>USDT`, so /api/history can be exact. */
  pairs?: Record<string, string>;
}

interface Source {
  id: string;
  /** Tried in order; the first host that answers wins. */
  hosts: string[];
  path: string;
  parse: (body: any, collect: Collect) => void;
}

type Collect = (symbol: string, price: number, volume: number) => void;

/**
 * Quote currencies we accept, best first. A pair can match more than one entry
 * (BTCTUSD ends in both TUSD and USD), so the longest match wins the split and
 * this order decides which book we quote from.
 */
const QUOTES = ["USDT", "USDC", "FDUSD", "TUSD", "BUSD", "USD"];
const QUOTE_RANK = new Map(QUOTES.map((q, i) => [q, i]));
/** Stablecoins are the quote side, so a USDT/USDC pair is noise. */
const SKIP_BASES = new Set([
  "USDT", "USDC", "FDUSD", "BUSD", "TUSD", "DAI", "USD", "USDP", "USD1", "USDE",
  "PYUSD", "USDD", "EURI", "AEUR", "EUR", "GBP", "AUD", "TRY", "BRL", "JPY",
]);
/**
 * Leveraged tokens (BTC3L, ETH5S) move 3-5x and would dominate every alert.
 * Matching the digit is deliberate: a bare /UP$/ would also eat JUP.
 */
const SKIP_SUFFIX = /\d[LS]$/;
/** Below this much 24h turnover a "pump" is one order, not a move. */
const DEFAULT_MIN_VOLUME = 250_000;
/**
 * api.binance.com answers 403 to Cloudflare's edge — it blocks datacenter IPs —
 * so the public market-data mirror goes first and the main host is the fallback
 * for when this runs somewhere with a residential-looking address.
 */
const BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"];

/** GETs a Binance path, trying each host until one answers. */
async function binanceFetch(path: string): Promise<unknown | null> {
  for (const host of BINANCE_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, {
        headers: { accept: "application/json", "user-agent": "crypto-notifier" },
        signal: AbortSignal.timeout(9000),
      });
      if (res.ok) return await res.json();
    } catch {
      // Try the next host.
    }
  }
  return null;
}

/** Klines are one request per symbol, and a Worker gets 50 subrequests free. */
const MAX_HISTORY_SYMBOLS = 40;
const HISTORY_INTERVALS = new Set(["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d"]);

function collector(out: Map<string, Ticker & { rank: number }>): Collect {
  return (symbol, price, volume) => {
    if (!Number.isFinite(price) || price <= 0) return;

    // Longest matching quote, so TUSD beats USD on a pair like BTCTUSD.
    let quote = "";
    for (const q of QUOTES) {
      if (symbol.endsWith(q) && q.length > quote.length) quote = q;
    }
    if (!quote) return;

    const base = symbol.slice(0, symbol.length - quote.length);
    if (!base || SKIP_BASES.has(base) || SKIP_SUFFIX.test(base)) return;

    const rank = QUOTE_RANK.get(quote) ?? QUOTES.length;
    const existing = out.get(base);
    if (existing && existing.rank <= rank) return;
    out.set(base, { price, volume: Number.isFinite(volume) ? volume : 0, rank, pair: symbol });
  };
}

const SOURCES: Source[] = [
  {
    id: "binance",
    hosts: BINANCE_HOSTS,
    path: "/api/v3/ticker/24hr",
    parse: (body, add) => {
      for (const t of body as Array<Record<string, string>>) {
        add(t.symbol, Number(t.lastPrice), Number(t.quoteVolume));
      }
    },
  },
  {
    id: "bybit",
    hosts: ["https://api.bybit.com"],
    path: "/v5/market/tickers?category=spot",
    parse: (body, add) => {
      for (const t of body?.result?.list ?? []) {
        add(t.symbol, Number(t.lastPrice), Number(t.turnover24h));
      }
    },
  },
  {
    id: "mexc",
    hosts: ["https://api.mexc.com"],
    path: "/api/v3/ticker/24hr",
    // MEXC implements Binance's schema, so the same reader works.
    parse: (body, add) => {
      for (const t of body as Array<Record<string, string>>) {
        add(t.symbol, Number(t.lastPrice), Number(t.quoteVolume));
      }
    },
  },
  {
    id: "okx",
    hosts: ["https://www.okx.com"],
    path: "/api/v5/market/tickers?instType=SPOT",
    parse: (body, add) => {
      for (const t of body?.data ?? []) {
        add(String(t.instId).replace(/-/g, ""), Number(t.last), Number(t.volCcy24h));
      }
    },
  },
];

/** Binance caps a multi-symbol ticker at 100 names, and long URLs get a 414. */
const WINDOW_CHUNK = 100;

/**
 * Price as of `windowSize` ago for every pair, via Binance's rolling-window
 * ticker. It is the only keyless endpoint that answers for many symbols at once,
 * which is what lets the grid show a percentage on the very first render instead
 * of waiting for the app to collect its own window.
 */
async function loadBaseline(
  pairs: Map<string, string>,
  windowSize: string,
): Promise<Record<string, number>> {
  const entries = [...pairs.entries()];
  const chunks: Array<Array<[string, string]>> = [];
  for (let i = 0; i < entries.length; i += WINDOW_CHUNK) {
    chunks.push(entries.slice(i, i + WINDOW_CHUNK));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const symbols = JSON.stringify(chunk.map(([, pair]) => pair));
      const body = (await binanceFetch(
        `/api/v3/ticker?symbols=${encodeURIComponent(symbols)}` +
          `&windowSize=${encodeURIComponent(windowSize)}`,
      )) as Array<{ symbol: string; openPrice: string }> | null;
      if (!Array.isArray(body)) return [] as Array<[string, number]>;

      const byPair = new Map(chunk.map(([base, pair]) => [pair, base]));
      const out: Array<[string, number]> = [];
      for (const t of body) {
        const base = byPair.get(t.symbol);
        const open = Number(t.openPrice);
        if (base && Number.isFinite(open) && open > 0) out.push([base, open]);
      }
      return out;
    }),
  );

  return Object.fromEntries(results.flat());
}

/**
 * Closing prices for one pair, oldest first.
 *
 * Every exchange serves candles for one symbol at a time, so this runs once per
 * card on screen. Binance is tried first and the others cover the case where it
 * is blocked from wherever this Worker is running.
 */
const KLINE_INTERVALS: Record<string, { bybit: string; okx: string }> = {
  "1m": { bybit: "1", okx: "1m" },
  "3m": { bybit: "3", okx: "3m" },
  "5m": { bybit: "5", okx: "5m" },
  "15m": { bybit: "15", okx: "15m" },
  "30m": { bybit: "30", okx: "30m" },
  "1h": { bybit: "60", okx: "1H" },
  "4h": { bybit: "240", okx: "4H" },
  "1d": { bybit: "D", okx: "1D" },
};

/** BTCUSDT -> BTC-USDT, which is how OKX names an instrument. */
function toInstId(pair: string): string {
  const quote = QUOTES.find((q) => pair.endsWith(q) && pair.length > q.length);
  return quote ? `${pair.slice(0, pair.length - quote.length)}-${quote}` : pair;
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "crypto-notifier" },
      signal: AbortSignal.timeout(9000),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Pulls the close out of each row and drops anything unusable. */
function closes(rows: unknown, index: number, newestFirst: boolean): number[] {
  if (!Array.isArray(rows)) return [];
  const out = rows
    .map((row: any) => Number(row?.[index]))
    .filter((n) => Number.isFinite(n) && n > 0);
  return newestFirst ? out.reverse() : out;
}

async function loadSeries(pair: string, interval: string, limit: number): Promise<number[]> {
  const alt = KLINE_INTERVALS[interval];

  const binance = await binanceFetch(
    `/api/v3/klines?symbol=${encodeURIComponent(pair)}` +
      `&interval=${encodeURIComponent(interval)}&limit=${limit}`,
  );
  // A kline is [openTime, open, high, low, close, ...]; index 4 is the close.
  const fromBinance = closes(binance, 4, false);
  if (fromBinance.length > 1) return fromBinance;
  if (!alt) return [];

  const bybit = await getJson(
    `https://api.bybit.com/v5/market/kline?category=spot&symbol=${encodeURIComponent(pair)}` +
      `&interval=${alt.bybit}&limit=${limit}`,
  );
  // Bybit rows are [start, open, high, low, close, ...], newest first.
  const fromBybit = closes(bybit?.result?.list, 4, true);
  if (fromBybit.length > 1) return fromBybit;

  const okx = await getJson(
    `https://www.okx.com/api/v5/market/candles?instId=${encodeURIComponent(toInstId(pair))}` +
      `&bar=${alt.okx}&limit=${limit}`,
  );
  // OKX rows are [ts, o, h, l, c, ...], newest first.
  return closes(okx?.data, 4, true);
}

/**
 * Enough coins that topping up from a second exchange is not worth the parse.
 * Binance alone clears this; Bybit on its own does not.
 */
const TARGET_COINS = 350;

/**
 * Prices for every liquid pair.
 *
 * Sources are tried in order and the first that answers sets the baseline set of
 * coins. Binance is blocked from Cloudflare's edge (403 on every host), so in
 * production this usually lands on Bybit, which lists far fewer pairs — when the
 * winner comes back thin the next exchange is merged in to top it up. Priority is
 * fixed, so a given coin keeps quoting from the same book tick to tick rather
 * than flipping between exchanges and inventing a move out of the spread.
 */
async function loadPrices(
  minVolume: number,
  only?: string | null,
): Promise<{ payload: FeedPayload; pairs: Map<string, string> }> {
  const errors: string[] = [];
  const chain = only ? SOURCES.filter((s) => s.id === only) : SOURCES;

  const merged = new Map<string, Ticker & { rank: number }>();
  const contributors: string[] = [];

  for (const source of chain) {
    if (merged.size >= TARGET_COINS) break;

    try {
      let body: unknown = null;
      for (const host of source.hosts) {
        const res = await fetch(`${host}${source.path}`, {
          headers: { accept: "application/json", "user-agent": "crypto-notifier" },
          signal: AbortSignal.timeout(9000),
        });
        if (res.ok) {
          body = await res.json();
          break;
        }
        errors.push(`${new URL(host).hostname}:${res.status}`);
      }
      if (body === null) continue;

      const tickers = new Map<string, Ticker & { rank: number }>();
      source.parse(body, collector(tickers));

      let added = 0;
      for (const [base, ticker] of tickers) {
        if (ticker.volume < minVolume || merged.has(base)) continue;
        merged.set(base, ticker);
        added += 1;
      }
      if (added) contributors.push(source.id);
    } catch (err) {
      errors.push(`${source.id}:${err instanceof Error ? err.name : "error"}`);
    }
  }

  if (merged.size < 50) {
    throw new Error(`all sources failed (${errors.join(", ") || "no data"})`);
  }

  const prices: Record<string, number> = {};
  const volumes: Record<string, number> = {};
  const pairs = new Map<string, string>();
  const oddPairs: Record<string, string> = {};

  for (const [base, ticker] of merged) {
    prices[base] = ticker.price;
    volumes[base] = Math.round(ticker.volume);
    pairs.set(base, ticker.pair);
    if (ticker.pair !== `${base}USDT`) oddPairs[base] = ticker.pair;
  }

  return {
    payload: {
      source: contributors.join("+"),
      ts: Date.now(),
      count: merged.size,
      prices,
      volumes,
      pairs: oddPairs,
    },
    pairs,
  };
}

/** Binance accepts 1m-59m, 1h-23h, 1d-7d. Anything else is rejected outright. */
function normalizeWindow(raw: string | null): string | null {
  if (!raw) return null;
  return /^([1-9]|[1-5][0-9])m$|^([1-9]|1[0-9]|2[0-3])h$|^[1-7]d$/.test(raw) ? raw : null;
}

const JSON_HEADERS = { "access-control-allow-origin": "*" };

export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/prices") {
      // Note: Number(null) is 0, so an absent param must be checked before coercing.
      const raw = url.searchParams.get("minVolume");
      const requested = raw === null ? NaN : Number(raw);
      const minVolume = Number.isFinite(requested) && requested >= 0 ? requested : DEFAULT_MIN_VOLUME;
      const baselineWindow = normalizeWindow(url.searchParams.get("baseline"));

      try {
        const { payload, pairs } = await loadPrices(minVolume, url.searchParams.get("source"));

        // Only the client's first poll asks for this; it costs six extra subrequests.
        if (baselineWindow && payload.source.startsWith("binance")) {
          const opens = await loadBaseline(pairs, baselineWindow);
          // A pair with no trades in the window reports an open of 0. It did not
          // move, so its own current price is the honest baseline.
          for (const base in payload.prices) {
            if (!opens[base]) opens[base] = payload.prices[base];
          }
          payload.opens = opens;
          payload.baselineWindow = baselineWindow;
        }

        return Response.json(payload, {
          headers: {
            // Collapses bursts from multiple open tabs without going stale.
            "cache-control": `public, max-age=${baselineWindow ? 15 : 5}`,
            ...JSON_HEADERS,
          },
        });
      } catch (err) {
        return Response.json(
          { error: err instanceof Error ? err.message : "feed unavailable" },
          { status: 502, headers: { "cache-control": "no-store" } },
        );
      }
    }

    if (url.pathname === "/api/history") {
      const symbols = (url.searchParams.get("symbols") ?? "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        // One subrequest each, and a Worker gets 50 on the free plan.
        .slice(0, MAX_HISTORY_SYMBOLS);

      if (!symbols.length) {
        return Response.json({ error: "no symbols requested" }, { status: 400 });
      }

      // `pairs` carries the exceptions only: "F:FUSDC,U:UUSDC".
      const overrides = new Map(
        (url.searchParams.get("pairs") ?? "")
          .split(",")
          .map((entry) => entry.split(":"))
          .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[1]))
          .map(([base, pair]) => [base.trim().toUpperCase(), pair.trim().toUpperCase()]),
      );

      const interval = HISTORY_INTERVALS.has(url.searchParams.get("interval") ?? "")
        ? url.searchParams.get("interval")!
        : "1m";
      const askedLimit = Number(url.searchParams.get("limit"));
      const limit = Number.isFinite(askedLimit) ? Math.min(Math.max(askedLimit, 2), 200) : 60;

      const results = await Promise.all(
        symbols.map(async (base) => {
          try {
            // Most bases are USDT-quoted; the client sends the handful that are not.
            const pair = overrides.get(base) ?? `${base}USDT`;
            return [base, await loadSeries(pair, interval, limit)] as const;
          } catch {
            return [base, [] as number[]] as const;
          }
        }),
      );

      const series: Record<string, number[]> = {};
      for (const [base, points] of results) {
        if (points.length > 1) series[base] = points;
      }

      return Response.json(
        { interval, limit, series },
        {
          headers: {
            // A 1m candle only changes once a minute; this keeps repeat scrolls free.
            "cache-control": "public, max-age=45",
            ...JSON_HEADERS,
          },
        },
      );
    }

    return env.ASSETS.fetch(request);
  },
};
