import { useEffect, useState } from "react";
import { POLL_MS, SELECTED_CURRENCIES } from "../constants";

/** `{ BTC: { USD: 81825.99 }, ... }` — the shape the original worked in. */
export type Rates = Record<string, { USD: number }>;

/**
 * Polls the price feed on the original's 20s tick.
 *
 * The old CryptoCompare `pricemulti` calls are gone, so this hits the Worker
 * instead and reshapes its flat map back into the `{ SYMBOL: { USD } }` form
 * the rest of the app expects. The response is filtered to the coins the
 * original watched, so the board is the same set of names.
 */
export function useApiRequest() {
  const [data, setData] = useState<Rates | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // The curated list already scopes the board, so only genuinely dead
        // books need filtering out here.
        const res = await fetch("/api/prices?minVolume=1000", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`feed returned ${res.status}`);

        const body = (await res.json()) as { prices?: Record<string, number> };
        if (!body.prices) throw new Error("empty feed response");

        const rates: Rates = {};
        for (const symbol in body.prices) {
          if (SELECTED_CURRENCIES.has(symbol)) rates[symbol] = { USD: body.prices[symbol] };
        }

        setError(null);
        setIsLoaded(true);
        setData(rates);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "feed unavailable");
      }
    };

    void fetchData();
    const interval = setInterval(() => void fetchData(), POLL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return { data, error, isLoaded };
}
