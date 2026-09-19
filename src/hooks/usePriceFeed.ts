import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CoinRow, FeedPayload, Settings, Snapshot } from "../types";
import { notify, playAlert } from "../lib/alerts";

export type FeedStatus = "loading" | "live" | "stale" | "error";

/**
 * Polls `/api/prices`, keeps the last `windowSize` snapshots, and derives each
 * coin's move across that window. Everything downstream (alerts, counters,
 * sparklines) is a read of the same ring buffer, so one fetch drives the app.
 */
export function usePriceFeed(settings: Settings, favorites: Set<string>) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  /** Prices from one lookback ago, fetched once so percentages work immediately. */
  const [baseline, setBaseline] = useState<Record<string, number> | null>(null);
  /** Bases that are not USDT-quoted, passed along when asking for history. */
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [resetAt, setResetAt] = useState(() => Date.now() + settings.resetMinutes * 60_000);
  const [alerting, setAlerting] = useState<Set<string>>(() => new Set());

  const cooldowns = useRef(new Map<string, number>());
  const processedTs = useRef(0);
  const failures = useRef(0);
  // Read inside the tick handler so changing a threshold never restarts the poll loop.
  const live = useRef({ settings, favorites });
  live.current = { settings, favorites };

  const wantBaseline = useRef(true);

  const { pollSeconds, windowSize, resetMinutes, minVolume } = settings;
  const lookback = (windowSize - 1) * pollSeconds;

  const fetchPrices = useCallback(async (signal?: AbortSignal) => {
    const s = live.current.settings;
    const params = new URLSearchParams({ minVolume: String(s.minVolume) });
    if (wantBaseline.current) {
      // Binance only serves whole-minute windows, so this is the nearest one.
      const minutes = Math.min(59, Math.max(1, Math.round(((s.windowSize - 1) * s.pollSeconds) / 60)));
      params.set("baseline", `${minutes}m`);
    }

    try {
      const res = await fetch(`/api/prices?${params}`, { signal, cache: "no-store" });
      if (!res.ok) throw new Error(`feed returned ${res.status}`);
      const payload = (await res.json()) as FeedPayload;
      if (!payload?.prices || !payload.count) throw new Error("empty feed response");

      failures.current = 0;
      setSource(payload.source);
      setVolumes(payload.volumes ?? {});
      setPairs(payload.pairs ?? {});

      if (payload.opens) {
        wantBaseline.current = false;
        setBaseline(payload.opens);
        // Let this tick be scored again now that there is something to compare to.
        processedTs.current = 0;
      }
      setError(null);
      setStatus("live");
      setSnapshots((prev) => {
        // The edge caches for 5s, so a fast poll can be handed the same snapshot
        // twice; re-adding it would weight one sample double in the window.
        if (prev.length && prev[prev.length - 1].ts === payload.ts) return prev;
        const next = [...prev, { ts: payload.ts, prices: payload.prices }];
        const max = live.current.settings.windowSize;
        return next.length > max ? next.slice(next.length - max) : next;
      });
    } catch (err) {
      if (signal?.aborted) return;
      failures.current += 1;
      setError(err instanceof Error ? err.message : "feed unavailable");
      // One blip shouldn't blank the board — only go red once it's clearly down.
      setStatus(failures.current >= 3 ? "error" : "stale");
    }
  }, []);

  // Poll loop. Restarts only when the interval itself changes.
  useEffect(() => {
    const controller = new AbortController();
    void fetchPrices(controller.signal);
    const id = setInterval(() => void fetchPrices(controller.signal), pollSeconds * 1000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [fetchPrices, pollSeconds, minVolume, windowSize]);

  useEffect(() => {
    wantBaseline.current = true;
  }, [lookback, minVolume]);

  // Drop the oldest samples immediately when the window is shortened.
  useEffect(() => {
    setSnapshots((prev) => (prev.length > windowSize ? prev.slice(prev.length - windowSize) : prev));
  }, [windowSize]);

  const windowFull = windowSize >= 2 && snapshots.length >= windowSize;

  /**
   * symbol -> fractional move over the lookback. Measured against the app's own
   * oldest snapshot once the window has filled, and against the exchange's
   * rolling-window open until then.
   */
  const changes = useMemo(() => {
    const latest = snapshots.at(-1);
    if (!latest) return null;
    const first = windowFull ? snapshots[0].prices : baseline;
    if (!first) return null;

    const last = latest.prices;
    const out: Record<string, number> = {};
    for (const symbol in last) {
      const from = first[symbol];
      // Coins listed mid-window have no baseline yet, so they sit out this round.
      if (from > 0) out[symbol] = last[symbol] / from - 1;
    }
    return out;
  }, [snapshots, windowFull, baseline]);

  // One pass per tick: bump counters, then decide who deserves an alarm.
  useEffect(() => {
    const latest = snapshots.at(-1);
    if (!changes || !latest || latest.ts === processedTs.current) return;
    processedTs.current = latest.ts;

    const { settings: s, favorites: favs } = live.current;
    const countMin = s.countPercent / 100;
    const alertMin = s.alertPercent / 100;

    setCounts((prev) => {
      const next = { ...prev };
      for (const symbol in changes) {
        if (changes[symbol] >= countMin) next[symbol] = (next[symbol] ?? 0) + 1;
      }
      return next;
    });

    const scope = s.alertFavoritesOnly ? (sym: string) => favs.has(sym) : () => true;
    const hits = Object.keys(changes)
      .filter((sym) => changes[sym] >= alertMin && scope(sym))
      .sort((a, b) => changes[b] - changes[a]);

    setAlerting(new Set(hits));
    if (!hits.length) return;

    // Re-alerting on the same coin every tick is noise; hold it for a couple of rounds.
    const cooldownMs = Math.max(60_000, pollSeconds * 2_000);
    const now = Date.now();
    const fresh = hits.filter((sym) => now - (cooldowns.current.get(sym) ?? 0) > cooldownMs);
    if (!fresh.length) return;
    for (const sym of fresh) cooldowns.current.set(sym, now);

    if (s.sound) playAlert();
    if (s.notifications) notify(fresh, s.alertPercent);
  }, [snapshots, changes, pollSeconds]);

  const resetCounts = useCallback(() => {
    setCounts({});
    setResetAt(Date.now() + live.current.settings.resetMinutes * 60_000);
  }, []);

  // Periodic counter wipe, so the numbers describe "recently" and not "since load".
  useEffect(() => {
    const ms = resetMinutes * 60_000;
    setResetAt(Date.now() + ms);
    const id = setInterval(() => {
      setCounts({});
      setResetAt(Date.now() + ms);
    }, ms);
    return () => clearInterval(id);
  }, [resetMinutes]);

  const rows = useMemo<CoinRow[]>(() => {
    const latest = snapshots.at(-1);
    if (!latest) return [];
    return Object.keys(latest.prices).map((symbol) => ({
      symbol,
      price: latest.prices[symbol],
      volume: volumes[symbol] ?? 0,
      change: changes?.[symbol] ?? null,
      history: snapshots.map((s) => s.prices[symbol]).filter((n) => Number.isFinite(n) && n > 0),
      count: counts[symbol] ?? 0,
      favorite: favorites.has(symbol),
      alerting: alerting.has(symbol),
    }));
  }, [snapshots, changes, counts, favorites, alerting, volumes]);

  return {
    rows,
    source,
    status,
    error,
    resetAt,
    resetCounts,
    lastUpdate: snapshots.at(-1)?.ts ?? 0,
    /** Ticks collected so far vs. the number needed before moves are real. */
    warmup: { have: snapshots.length, need: windowSize },
    /** True while percentages come from the exchange rather than our own window. */
    usingBaseline: !windowFull && baseline !== null,
    pairs,
  };
}
