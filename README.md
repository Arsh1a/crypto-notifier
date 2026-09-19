# Crypto Notifier

Momentum radar for spot crypto markets. It polls several hundred liquid pairs on a
fixed interval, keeps a rolling window of snapshots, and compares the newest price
against the oldest one in that window. When a coin moves past your threshold the
card lights up and an alarm fires.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Cloudflare Workers (static assets + the price proxy)

## Price feed

The old CryptoCompare endpoint is no longer free. `/api/prices` is a Worker route
that walks a chain of keyless public exchange tickers:

1. Binance — `/api/v3/ticker/24hr`
2. Bybit — `/v5/market/tickers?category=spot`
3. MEXC — `/api/v3/ticker/24hr` (same schema as Binance)
4. OKX — `/api/v5/market/tickers?instType=SPOT`

The first source that answers sets the coin list. If it comes back thin the next
exchange is merged in to top it up, stopping once there are enough coins.
Priority is fixed, so a coin keeps quoting from the same book tick to tick rather
than flipping between exchanges and inventing a move out of the spread.

### Binance is blocked from Cloudflare

**Binance answers 403 to Cloudflare Workers** — it blocks datacenter egress, on
`api.binance.com` and the `data-api.binance.vision` mirror alike. Locally it
works fine, so this only shows up once deployed.

Consequences in production:

- The feed lands on `bybit+mexc+okx` (~340 coins) rather than Binance (~520).
- The cold-start baseline is unavailable, because the rolling-window ticker is a
  Binance-only endpoint. The app falls back to collecting its own window and
  shows the warmup banner. The client stops asking after two attempts so it is
  not paying for the extra subrequests every poll.
- Charts still work: `/api/history` falls through Binance klines to Bybit's
  `/v5/market/kline` and then OKX's `/api/v5/market/candles`.

If you later front this with an egress that Binance accepts, everything above
switches back on by itself — no code change.

Pairs are normalised to a base symbol (USDT preferred, then USDC / FDUSD / TUSD),
stablecoins and leveraged tokens are dropped, and anything turning over less than
`minVolume` in 24h is filtered out — thin books otherwise produce fake pumps.

Query params:

| Param | Default | Purpose |
| --- | --- | --- |
| `minVolume` | `250000` | Minimum 24h turnover in USD |
| `baseline` | — | e.g. `1m`. Also return each coin's price that long ago |
| `source` | — | Pin one exchange (`binance`, `bybit`, `okx`) to check a fallback |

### Cold start

Normally the app has to collect its own window before it can show a percentage,
which means ~80s of blank cards. The client's first poll instead passes
`?baseline=1m`, and the Worker adds each coin's price from one lookback ago using
Binance's rolling-window ticker — the only keyless endpoint that answers for many
symbols at once. It is capped at 100 names per call and 414s on a long URL, so
the Worker chunks it. Percentages are live on the first render, and the app
switches to its own snapshots once the window fills.

A pair with no trades in the window reports an open of `0`; it did not move, so
its current price is used as the baseline.

### Charts — `/api/history`

Klines are one request per symbol, so this is not something you can ask for 500
coins at once. The client requests history only for the cards on screen (40 max,
matching the Worker's cap and the free plan's 50-subrequest budget), and the
Worker fetches those in parallel and returns closing prices.

| Param | Default | Purpose |
| --- | --- | --- |
| `symbols` | — | Comma-separated bases, e.g. `BTC,ETH,SOL` |
| `pairs` | — | Overrides for bases that are not USDT-quoted, e.g. `SNM:SNMBUSD` |
| `interval` | `1m` | `1m`–`1d` |
| `limit` | `60` | Candles to return, 2–200 |

Responses are cached 45s at the edge, and each card swaps the still-open final
candle for the live price so the right edge of the chart keeps moving between
refreshes. Symbols without history fall back to the app's own collected window.

## How the signal works

| Setting | Default | Meaning |
| --- | --- | --- |
| Refresh interval | 20s | How often prices are pulled |
| Window size | 5 ticks | Lookback is `(window - 1) x interval`, so 80s by default |
| Alert threshold | 5% | Move over the window that fires sound / notification |
| Count threshold | 0.4% | Smaller move that tints the card and bumps its counter |
| Counter reset | 15 min | How often every counter returns to zero |

Cards are tinted by how hard the coin is moving — yellow, then blue, then red —
and a coin that clears the alert threshold pulses. Repeat alerts for the same coin
are held back for a cooldown so a single pump doesn't ring every tick.

Favorites and settings persist in `localStorage`.

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
