export interface FeedPayload {
  source: string;
  ts: number;
  count: number;
  prices: Record<string, number>;
  volumes: Record<string, number>;
  /** Price as of `baselineWindow` ago, so percentages work on the very first render. */
  opens?: Record<string, number>;
  baselineWindow?: string;
  /** Only the bases whose exchange pair is not `<base>USDT`. */
  pairs?: Record<string, string>;
}

export interface Snapshot {
  ts: number;
  prices: Record<string, number>;
}

export interface CoinRow {
  symbol: string;
  price: number;
  /** Fractional move across the whole window (0.05 = +5%). Null until the window fills. */
  change: number | null;
  /** Oldest -> newest prices, used for the sparkline. */
  history: number[];
  /** 24h turnover in USD. */
  volume: number;
  /** Times this coin crossed the count threshold since the last reset. */
  count: number;
  favorite: boolean;
  alerting: boolean;
}

export type SortMode = "change" | "count" | "volume" | "price" | "symbol";

export interface Settings {
  /** Seconds between price fetches. */
  pollSeconds: number;
  /** Snapshots compared head-to-tail. Lookback = (windowSize - 1) * pollSeconds. */
  windowSize: number;
  /** Percent move over the window that triggers sound / notification. */
  alertPercent: number;
  /** Percent move over the window that bumps a coin's counter. */
  countPercent: number;
  /** Minutes before every counter goes back to zero. */
  resetMinutes: number;
  /** Ignore coins turning over less than this in 24h — thin books fake pumps. */
  minVolume: number;
  /** Only sound the alarm for starred coins. */
  alertFavoritesOnly: boolean;
  sound: boolean;
  notifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  pollSeconds: 20,
  windowSize: 5,
  alertPercent: 5,
  countPercent: 0.4,
  resetMinutes: 15,
  minVolume: 250_000,
  alertFavoritesOnly: false,
  sound: false,
  notifications: false,
};
