/**
 * Cloudflare Worker: serves the built SPA and proxies a free crypto price feed.
 *
 * The app's original CryptoCompare `pricemulti` endpoint went paid, so this
 * walks a chain of keyless public exchange tickers instead. Going through the
 * Worker also removes CORS and per-region exchange blocks, since the request
 * leaves from Cloudflare's edge rather than the browser.
 */

interface Ticker {
  price: number;
  /** 24h volume in the quote currency, i.e. roughly USD. */
  volume: number;
}

interface FeedPayload {
  source: string;
  ts: number;
  count: number;
  prices: Record<string, number>;
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
const DEFAULT_MIN_VOLUME = 10_000;

/**
 * api.binance.com answers 403 to Cloudflare's edge — it blocks datacenter IPs —
 * so the public market-data mirror goes first and the main host is the fallback
 * for when this runs somewhere with a residential-looking address.
 */
const BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"];

/**
 * Enough coins that topping up from a second exchange is not worth the parse.
 * Binance alone clears this; Bybit on its own does not.
 */
const TARGET_COINS = 350;

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
    out.set(base, { price, volume: Number.isFinite(volume) ? volume : 0, rank });
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

/**
 * Prices for every liquid pair.
 *
 * Sources are tried in order and the first that answers sets the coin list. If
 * it comes back thin the next exchange is merged in to top it up. Priority is
 * fixed, so a given coin keeps quoting from the same book tick to tick rather
 * than flipping between exchanges and inventing a move out of the spread.
 */
async function loadPrices(minVolume: number, only?: string | null): Promise<FeedPayload> {
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
  for (const [base, ticker] of merged) prices[base] = ticker.price;

  return { source: contributors.join("+"), ts: Date.now(), count: merged.size, prices };
}

export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/prices") {
      // Note: Number(null) is 0, so an absent param must be checked before coercing.
      const raw = url.searchParams.get("minVolume");
      const requested = raw === null ? NaN : Number(raw);
      const minVolume = Number.isFinite(requested) && requested >= 0 ? requested : DEFAULT_MIN_VOLUME;

      try {
        const payload = await loadPrices(minVolume, url.searchParams.get("source"));
        return Response.json(payload, {
          headers: {
            // Collapses bursts from multiple open tabs without going stale.
            "cache-control": "public, max-age=5",
            "access-control-allow-origin": "*",
          },
        });
      } catch (err) {
        return Response.json(
          { error: err instanceof Error ? err.message : "feed unavailable" },
          { status: 502, headers: { "cache-control": "no-store" } },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
