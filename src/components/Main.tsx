import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import notificationSfx from "../sounds/notification.mp3";
import { useApiRequest, type Rates } from "../hooks/useApiRequest";
import { playSound } from "../lib/playSound";
import {
  CALCULATE_AFTER,
  COUNTS_RESET_MS,
  DEFAULT_ALERT_AT,
  THRESHOLD_FOR_COUNT,
} from "../constants";
import Navbar from "./Navbar";
import Cryptos from "./Cryptos";
import Footer from "./Footer";

function Main() {
  const [exchangeRates, setExchangeRates] = useState<Rates[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [soundActive, setSoundActive] = useState(false);
  const [alertAtMinimum, setAlertAtMinimum] = useState(DEFAULT_ALERT_AT);
  const [tempAlertAtMinimum, setTempAlertAtMinimum] = useState(String(DEFAULT_ALERT_AT));
  const [showDeals, setShowDeals] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const { data, error, isLoaded } = useApiRequest();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Keep the last CALCULATE_AFTER snapshots, oldest first.
  useEffect(() => {
    if (!data) return;
    setExchangeRates((prev) => {
      const next = [...prev, data];
      return next.length > CALCULATE_AFTER ? next.slice(next.length - CALCULATE_AFTER) : next;
    });
  }, [data]);

  // The coin list is fixed once the first response lands.
  useEffect(() => {
    const first = exchangeRates[0];
    if (first && currencies.length === 0) setCurrencies(Object.keys(first).sort());
  }, [exchangeRates, currencies.length]);

  const calculateResult = useMemo(() => {
    const full = exchangeRates.length === CALCULATE_AFTER;
    const oldest = exchangeRates[0];
    const newest = exchangeRates[exchangeRates.length - 1];

    return (currency: string): number | undefined => {
      if (!full) return undefined;
      const from = oldest?.[currency]?.USD;
      const to = newest?.[currency]?.USD;
      // A coin listed part-way through the window has nothing to compare to.
      if (!from || !to) return undefined;
      return to / from;
    };
  }, [exchangeRates]);

  /** Ratio per coin for the current window, recomputed once per tick. */
  const exchangeResults = useMemo(() => {
    const out: Record<string, number> = {};
    for (const currency of currencies) {
      const result = calculateResult(currency);
      if (result !== undefined) out[currency] = result;
    }
    return out;
  }, [currencies, calculateResult]);

  // Sound when anything on the board clears the alert ratio.
  useEffect(() => {
    if (!soundActive) return;
    const hit = Object.entries(exchangeResults).some(
      ([currency, value]) =>
        value >= alertAtMinimum && (!showFavorites || favorites.includes(currency)),
    );
    if (hit) playSound(audioRef);
  }, [exchangeResults, soundActive, alertAtMinimum, showFavorites, favorites]);

  // Count every tick a coin spends at or above the count threshold.
  useEffect(() => {
    if (Object.keys(exchangeResults).length === 0) return;
    setCounts((prev) => {
      const next = { ...prev };
      for (const currency in exchangeResults) {
        if (exchangeResults[currency] >= THRESHOLD_FOR_COUNT) {
          next[currency] = (next[currency] ?? 0) + 1;
        }
      }
      return next;
    });
  }, [exchangeResults]);

  useEffect(() => {
    const interval = setInterval(() => setCounts({}), COUNTS_RESET_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        /* ignore a corrupted entry */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = Number(tempAlertAtMinimum);
    if (Number.isFinite(next) && next > 0) setAlertAtMinimum(next);
    else setTempAlertAtMinimum(String(alertAtMinimum));
  };

  /** Which coins the grid shows, from the two toggles. */
  const visible = useMemo(() => {
    const deals = Object.keys(exchangeResults).filter(
      (currency) => exchangeResults[currency] >= alertAtMinimum,
    );
    if (showDeals && showFavorites) return deals.filter((c) => favorites.includes(c));
    if (showDeals) return deals;
    if (showFavorites) return favorites;
    return currencies;
  }, [showDeals, showFavorites, exchangeResults, alertAtMinimum, favorites, currencies]);

  const countEntries = Object.entries(counts).filter(([currency]) =>
    showFavorites ? favorites.includes(currency) : true,
  );

  if (error) return <div>Failed to load</div>;
  if (!isLoaded) return <div className="dots-after text-center">Loading</div>;

  return (
    <>
      <audio ref={audioRef}>
        <source src={notificationSfx} type="audio/mp3" />
      </audio>

      <Navbar
        {...{
          setSoundActive,
          soundActive,
          audioRef,
          handleSubmit,
          tempAlertAtMinimum,
          setTempAlertAtMinimum,
          setShowDeals,
          showDeals,
          setShowFavorites,
          showFavorites,
        }}
      />

      <div className="mb-4">
        <h3 className="text-[1.17em] font-medium">Crypto Counts (≥ {THRESHOLD_FOR_COUNT}):</h3>
        {countEntries.length === 0 && <p>No counts yet.</p>}
        <div className="flex flex-wrap gap-2.5">
          {countEntries.map(([currency, count]) => {
            const result = calculateResult(currency);
            const isHigh = result !== undefined && result >= THRESHOLD_FOR_COUNT;
            return (
              <div
                key={currency}
                className={`rounded-lg border px-1.5 py-1 transition-all duration-300 ${
                  isHigh ? "border-count-hot" : "border-count-idle"
                }`}
              >
                <span className={isHigh ? "text-count-hot" : undefined}>{currency}:</span> {count}
              </div>
            );
          })}
        </div>
      </div>

      <Cryptos
        {...{
          exchangeRates,
          calculateResult,
          favorites,
          setFavorites,
        }}
        data={visible}
      />

      <Footer />
    </>
  );
}

export default Main;
