import { useEffect, useState } from "react";

export const useRisingCryptos = (exchangeRates: any) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [cryptosWithRise, setCryptosWithRise] = useState<string[]>([]);
  const [nextCheckIn, setNextCheckIn] = useState<number | null>(null);
  const [lastSnapshotTime, setLastSnapshotTime] = useState<number | null>(null);

  console.log(snapshots);
  console.log("cryptosWithRise", cryptosWithRise);

  // Take first snapshot
  useEffect(() => {
    if (!lastSnapshotTime && exchangeRates.length > 0) {
      const latest = exchangeRates[exchangeRates.length - 1];
      setSnapshots([latest]);
      const now = Date.now();
      setLastSnapshotTime(now);
    }
  }, [exchangeRates, lastSnapshotTime]);

  // Countdown timer + auto snapshot every 15 min
  useEffect(() => {
    if (!lastSnapshotTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const nextSnapshotAt = lastSnapshotTime + 15 * 60 * 1000;
      const diff = nextSnapshotAt - now;

      if (diff <= 0) {
        // Time to snapshot
        if (exchangeRates.length > 0) {
          const latest = exchangeRates[exchangeRates.length - 1];
          setSnapshots((prev) => [...prev.slice(-1), latest]); // keep last 2
          setLastSnapshotTime(now); // reset timer
        }
      } else {
        setNextCheckIn(Math.floor(diff / 1000)); // in seconds
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSnapshotTime, exchangeRates]);

  // Compare snapshots
  useEffect(() => {
    if (snapshots.length === 2) {
      const [oldSnapshot, newSnapshot] = snapshots;

      const rising = Object.keys(newSnapshot).filter((currency) => {
        const oldPrice = oldSnapshot?.[currency]?.USD;
        const newPrice = newSnapshot?.[currency]?.USD;
        return (
          oldPrice && newPrice && (newPrice - oldPrice) / oldPrice >= 0.004
        );
      });

      setCryptosWithRise(rising);
    }
  }, [snapshots]);

  return { cryptosWithRise, nextCheckIn };
};
