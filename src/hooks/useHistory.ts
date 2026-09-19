import { useEffect, useMemo, useRef, useState } from "react";

/** A 1m candle only changes once a minute, so cached series stay good for a while. */
const TTL_MS = 45_000;
/** A miss is usually a timeout rather than a missing pair, so retry it sooner. */
const MISS_TTL_MS = 10_000;
/** Matches the Worker's own cap — one Binance kline request per symbol. */
const BATCH = 40;
const DEBOUNCE_MS = 350;

interface Entry {
  at: number;
  ttl: number;
  series: number[];
}

/**
 * Fetches real price history for the symbols currently on screen, so a card can
 * draw a full chart instead of the handful of points the app has collected
 * itself. Results are cached per symbol; a symbol with no USDT pair caches empty
 * so it is not asked for again until the entry expires.
 */
export function useHistory(
  symbols: string[],
  pairs: Record<string, string> = {},
  interval = "1m",
  limit = 48,
) {
  const cache = useRef(new Map<string, Entry>());
  const inflight = useRef(new Set<string>());
  // Read at request time so a late-arriving pair map does not restart the effect.
  const pairsRef = useRef(pairs);
  pairsRef.current = pairs;
  const [version, setVersion] = useState(0);

  // Only the set matters, not the order — otherwise every re-sort refetches.
  const wanted = useMemo(() => [...new Set(symbols)].sort(), [symbols]);
  const key = wanted.join(",");

  useEffect(() => {
    const now = Date.now();
    const missing = wanted
      .filter((symbol) => {
        const hit = cache.current.get(symbol);
        return (!hit || now - hit.at > hit.ttl) && !inflight.current.has(symbol);
      })
      .slice(0, BATCH);

    if (!missing.length) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      for (const symbol of missing) inflight.current.add(symbol);
      try {
        const params = new URLSearchParams({
          symbols: missing.join(","),
          interval,
          limit: String(limit),
        });
        const overrides = missing
          .filter((symbol) => pairsRef.current[symbol])
          .map((symbol) => `${symbol}:${pairsRef.current[symbol]}`);
        if (overrides.length) params.set("pairs", overrides.join(","));

        const res = await fetch(`/api/history?${params}`);
        if (!res.ok) throw new Error(`history returned ${res.status}`);
        const body = (await res.json()) as { series?: Record<string, number[]> };
        const at = Date.now();
        for (const symbol of missing) {
          const points = body.series?.[symbol] ?? [];
          cache.current.set(symbol, {
            at,
            ttl: points.length ? TTL_MS : MISS_TTL_MS,
            series: points,
          });
        }
        if (!cancelled) setVersion((v) => v + 1);
      } catch {
        // Leave the cache untouched; the next render retries these symbols.
      } finally {
        for (const symbol of missing) inflight.current.delete(symbol);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, wanted, interval, limit]);

  return useMemo(() => {
    const out: Record<string, number[]> = {};
    for (const symbol of wanted) {
      const hit = cache.current.get(symbol);
      if (hit?.series.length) out[symbol] = hit.series;
    }
    return out;
    // `version` is what tells us the cache changed under us.
  }, [key, wanted, version]);
}
