import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "./components/Navbar";
import { StatusLine } from "./components/StatusLine";
import { SettingsPanel } from "./components/SettingsPanel";
import { CoinCard } from "./components/CoinCard";
import { Footer } from "./components/Footer";
import { usePriceFeed } from "./hooks/usePriceFeed";
import { useHistory } from "./hooks/useHistory";
import { useNow } from "./hooks/useNow";
import { primeAudio, requestNotificationPermission } from "./lib/alerts";
import { KEYS, load, save } from "./lib/storage";
import { DEFAULT_SETTINGS } from "./types";
import type { Settings, SortMode } from "./types";

/** How many cards get a real chart — one Binance request each, capped at the Worker. */
const CHART_LIMIT = 40;

const SORTS: { id: SortMode; label: string }[] = [
  { id: "change", label: "Biggest move" },
  { id: "count", label: "Most hits" },
  { id: "volume", label: "24h volume" },
  { id: "price", label: "Price" },
  { id: "symbol", label: "Name" },
];

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => load(KEYS.settings, DEFAULT_SETTINGS));
  const [favoriteList, setFavoriteList] = useState<string[]>(() => load<string[]>(KEYS.favorites, []));
  const [onlyMovers, setOnlyMovers] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState<SortMode>("change");
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const favorites = useMemo(() => new Set(favoriteList), [favoriteList]);
  const now = useNow();

  useEffect(() => save(KEYS.settings, settings), [settings]);
  useEffect(() => save(KEYS.favorites, favoriteList), [favoriteList]);

  const feed = usePriceFeed(settings, favorites);
  const {
    rows,
    status,
    source,
    error,
    resetAt,
    resetCounts,
    lastUpdate,
    warmup,
    usingBaseline,
    pairs,
  } = feed;

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavoriteList((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol].sort(),
    );
  }, []);

  // Audio needs a user gesture to unlock, so prime the element from this click.
  const toggleSound = useCallback(async () => {
    if (settings.sound) return patchSettings({ sound: false });
    await primeAudio();
    patchSettings({ sound: true });
  }, [settings.sound, patchSettings]);

  const toggleNotifications = useCallback(async () => {
    if (settings.notifications) return patchSettings({ notifications: false });
    patchSettings({ notifications: await requestNotificationPermission() });
  }, [settings.notifications, patchSettings]);

  const alertMin = settings.alertPercent / 100;
  const moverCount = useMemo(
    () => rows.reduce((n, r) => n + ((r.change ?? 0) >= alertMin ? 1 : 0), 0),
    [rows, alertMin],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toUpperCase();
    const filtered = rows.filter((r) => {
      if (onlyMovers && (r.change ?? 0) < alertMin) return false;
      if (onlyFavorites && !r.favorite) return false;
      if (needle && !r.symbol.includes(needle)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "count":
          return b.count - a.count || (b.change ?? -Infinity) - (a.change ?? -Infinity);
        case "volume":
          return b.volume - a.volume;
        case "price":
          return b.price - a.price;
        case "symbol":
          return a.symbol.localeCompare(b.symbol);
        default:
          // Coins still warming up have no move yet, so they sink to the bottom.
          return (b.change ?? -Infinity) - (a.change ?? -Infinity);
      }
    });
  }, [rows, onlyMovers, onlyFavorites, query, sort, alertMin]);

  // Charts are fetched per symbol, so only ask for what is actually on screen.
  const chartSymbols = useMemo(
    () => visible.slice(0, CHART_LIMIT).map((r) => r.symbol),
    [visible],
  );
  const series = useHistory(chartSymbols, pairs);

  // Glanceable from a background tab.
  useEffect(() => {
    document.title = moverCount ? `(${moverCount}) Crypto Notifier` : "Crypto Notifier";
  }, [moverCount]);

  // With an exchange baseline there is nothing to wait for; the banner is only
  // for the case where that call did not come back.
  const warming = warmup.have < warmup.need && !usingBaseline;
  const remaining = (warmup.need - warmup.have) * settings.pollSeconds;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">
      <Navbar
        sound={settings.sound}
        notifications={settings.notifications}
        onlyMovers={onlyMovers}
        onlyFavorites={onlyFavorites}
        alertPercent={settings.alertPercent}
        query={query}
        settingsOpen={settingsOpen}
        onToggleSound={() => void toggleSound()}
        onToggleNotifications={() => void toggleNotifications()}
        onToggleMovers={() => setOnlyMovers((v) => !v)}
        onToggleFavorites={() => setOnlyFavorites((v) => !v)}
        onAlertPercent={(alertPercent) => patchSettings({ alertPercent })}
        onQuery={setQuery}
        onToggleSettings={() => setSettingsOpen((v) => !v)}
      />

      {settingsOpen && (
        <SettingsPanel settings={settings} onChange={patchSettings} onResetCounts={resetCounts} />
      )}

      <StatusLine
        status={status}
        source={source}
        tracked={rows.length}
        movers={moverCount}
        alertPercent={settings.alertPercent}
        resetIn={(resetAt - now) / 1000}
        age={lastUpdate ? Math.max(0, Math.round((now - lastUpdate) / 1000)) : null}
      />

      {status === "error" && (
        <div className="mb-8 rounded-[10px] bg-down/15 px-5 py-4 text-sm text-down">
          Price feed unavailable — {error}. Retrying every {settings.pollSeconds}s.
        </div>
      )}

      {warming && status !== "error" && (
        <div className="dots-after mb-8 text-lg text-paper/45">
          Collecting baseline, {warmup.have}/{warmup.need} ticks — results in about {remaining}s
        </div>
      )}

      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="tnum text-sm text-paper/35">
          {visible.length} shown
        </span>
        <label className="flex items-center gap-2 text-sm text-paper/45">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Sort coins"
            className="card-sheen cursor-pointer rounded-[15px] px-3 py-2 text-sm text-paper outline-none focus:ring-1 focus:ring-brand/60"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id} className="bg-card">
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((row) => (
            <CoinCard
              key={row.symbol}
              row={row}
              settings={settings}
              series={series[row.symbol]}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-lg text-paper/40">
          {status === "loading"
            ? "Loading markets"
            : onlyMovers
              ? `Nothing is up ${settings.alertPercent}% right now.`
              : onlyFavorites
                ? "No favorites yet — tap the heart on any card."
                : "No coins match that search."}
        </p>
      )}

      <Footer />
    </div>
  );
}
