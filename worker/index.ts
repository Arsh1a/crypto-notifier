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
  url: string;
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
    url: "https://api.binance.com/api/v3/ticker/24hr",
    parse: (body, add) => {
      for (const t of body as Array<Record<string, string>>) {
        add(t.symbol, Number(t.lastPrice), Number(t.quoteVolume));
      }
    },
  },
  {
    id: "bybit",
    url: "https://api.bybit.com/v5/market/tickers?category=spot",
    parse: (body, add) => {
      for (const t of body?.result?.list ?? []) {
        add(t.symbol, Number(t.lastPrice), Number(t.turnover24h));
      }
    },
  },
  {
    id: "okx",
    url: "https://www.okx.com/api/v5/market/tickers?instType=SPOT",
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
      const url =
        `https://api.binance.com/api/v3/ticker?symbols=${encodeURIComponent(symbols)}` +
        `&windowSize=${encodeURIComponent(windowSize)}`;
      const res = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "crypto-notifier" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return [] as Array<[string, number]>;

      const body = (await res.json()) as Array<{ symbol: string; openPrice: string }>;
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

/** Closing prices for one pair, oldest first. Resolves empty if the pair is unknown. */
async function loadSeries(pair: string, interval: string, limit: number): Promise<number[]> {
  const url =
    `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(pair)}` +
    `&interval=${encodeURIComponent(interval)}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "crypto-notifier" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) return [];

  const body = (await res.json()) as unknown;
  if (!Array.isArray(body)) return [];
  // A kline is [openTime, open, high, low, close, ...]; index 4 is the close.
  return body.map((row: any) => Number(row[4])).filter((n) => Number.isFinite(n) && n > 0);
}

async function loadPrices(
  minVolume: number,
  only?: string | null,
): Promise<{ payload: FeedPayload; pairs: Map<string, string> }> {
  const errors: string[] = [];
  // `?source=bybit` pins one exchange, which is how you check a fallback still parses.
  const chain = only ? SOURCES.filter((s) => s.id === only) : SOURCES;

  for (const source of chain) {
    try {
      const res = await fetch(source.url, {
        headers: { accept: "application/json", "user-agent": "crypto-notifier" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) {
        errors.push(`${source.id}:${res.status}`);
        continue;
      }

      const tickers = new Map<string, Ticker & { rank: number }>();
      source.parse(await res.json(), collector(tickers));

      const prices: Record<string, number> = {};
      const volumes: Record<string, number> = {};
      const pairs = new Map<string, string>();
      for (const [base, t] of tickers) {
        if (t.volume < minVolume) continue;
        prices[base] = t.price;
        volumes[base] = Math.round(t.volume);
        pairs.set(base, t.pair);
      }

      const oddPairs: Record<string, string> = {};
      for (const [base, pair] of pairs) {
        if (pair !== `${base}USDT`) oddPairs[base] = pair;
      }

      const count = Object.keys(prices).length;
      // A handful of symbols means a degraded or partial response; try the next source.
      if (count < 50) {
        errors.push(`${source.id}:thin(${count})`);
        continue;
      }
      return {
        payload: { source: source.id, ts: Date.now(), count, prices, volumes, pairs: oddPairs },
        pairs,
      };
    } catch (err) {
      errors.push(`${source.id}:${err instanceof Error ? err.name : "error"}`);
    }
  }

  throw new Error(`all sources failed (${errors.join(", ")})`);
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
        if (baselineWindow && payload.source === "binance") {
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
