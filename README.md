# Crypto Notifier

Momentum radar for spot crypto markets. It polls several hundred liquid pairs on a
fixed interval, keeps a rolling window of snapshots, and compares the newest price
against the oldest one in that window. When a coin moves past your threshold the
card lights up and an alarm fires.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Cloudflare Workers (static assets + the price proxy)

This is the original app, rebuilt. Same layout, same styles, same logic — the
navbar toggles, the heat-tinted cards, the counts strip, the 20s tick and the
five-snapshot window all behave as they did. What changed is underneath: CRA
became Vite, `index.css` became Tailwind theme tokens (including the original's
own 600/800/900/950/1100/2000px breakpoints), and gh-pages became Cloudflare.

## Price feed

The original's CryptoCompare `pricemulti` endpoint is no longer free.
`/api/prices` is a Worker route that walks a chain of keyless public exchange
tickers:

1. Binance — `/api/v3/ticker/24hr`
2. Bybit — `/v5/market/tickers?category=spot`
3. MEXC — `/api/v3/ticker/24hr` (same schema as Binance)
4. OKX — `/api/v5/market/tickers?instType=SPOT`

The first source that answers sets the coin list; if it comes back thin the next
exchange is merged in to top it up. Priority is fixed, so a coin keeps quoting
from the same book tick to tick rather than flipping between exchanges and
inventing a move out of the spread.

The client reshapes the response back into the `{ SYMBOL: { USD } }` form the
app was written against, and filters it to `SELECTED_CURRENCIES` — the 290 names
the original watched, merged from its five request lists and de-duplicated.

| Param | Default | Purpose |
| --- | --- | --- |
| `minVolume` | `10000` | Minimum 24h turnover in USD |
| `source` | — | Pin one exchange to check a fallback |

### Binance is blocked from Cloudflare

**Binance answers 403 to Cloudflare Workers** — it blocks datacenter egress, on
`api.binance.com` and the `data-api.binance.vision` mirror alike. Locally it
works fine, so this only appears once deployed, and it costs coverage of the
original coin list:

| Running from | Feed | Of the 290 |
| --- | --- | --- |
| Anywhere Binance accepts | `binance`, ~670 coins | **263** |
| Cloudflare's edge | `bybit+mexc+okx`, ~340 coins | **137** |

The rest were Binance-only listings or have since been delisted. Put an egress
Binance accepts in front of this and the full list comes back with no code
change.

## How the signal works

Constants live in `src/constants.ts`:

| Constant | Value | Meaning |
| --- | --- | --- |
| `POLL_MS` | 20s | Tick interval |
| `CALCULATE_AFTER` | 5 | Snapshots kept, so an 80s lookback |
| `THRESHOLD_FOR_COUNT` | 1.004 | Bumps a coin's counter, turns its card red |
| `COUNTS_RESET_MS` | 15 min | How often every counter returns to zero |
| `DEFAULT_ALERT_AT` | 1.05 | Starting value of the navbar's alert field |

`result` is the newest price over the oldest in the window. Cards tint yellow
above 1.000, blue above 1.002 and red above 1.004; the alert field is a ratio,
so 1.05 fires on a 5% move. Favorites persist in `localStorage`.

## Develop

```bash
npm install
npm run cf:dev     # worker + built assets on http://127.0.0.1:8787
```

`npm run dev` runs Vite alone with HMR; it proxies `/api` to `127.0.0.1:8787`, so
run `npm run cf:dev` alongside it for live prices.

## Deploy

```bash
npm run deploy     # vite build + wrangler deploy
```

First deploy needs `npx wrangler login`. Configuration lives in `wrangler.jsonc`.
