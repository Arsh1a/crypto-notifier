import { memo } from "react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import type { CoinRow, Settings } from "../types";
import { formatPercent, formatPrice, formatVolume } from "../lib/format";
import { HEAT_BACKGROUND, HEAT_IS_TINTED, heatOf } from "../lib/heat";
import { Sparkline } from "./Sparkline";

interface Props {
  row: CoinRow;
  settings: Settings;
  /** Real price history from the exchange, oldest first. Falls back to the live window. */
  series?: number[];
  onToggleFavorite: (symbol: string) => void;
}

function CoinCardImpl({ row, settings, series, onToggleFavorite }: Props) {
  const { symbol, price, volume, change, history, count, favorite, alerting } = row;

  const heat = heatOf(change, settings);
  const tinted = HEAT_IS_TINTED[heat];
  const from = history.length > 1 ? history[0] : null;
  const up = (change ?? 0) >= 0;

  // The last candle is the one still open, so swapping in the live price keeps
  // the right-hand edge of the chart moving between history refreshes.
  const chart = series && series.length > 1 ? [...series.slice(0, -1), price] : history;

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-[10px] p-5 shadow-lg shadow-black/25 ring-1 transition-[background,box-shadow] duration-300 inset-ring inset-ring-white/8 ${
        tinted ? "ring-black/25" : "ring-white/5"
      } ${alerting ? "animate-[alert-pulse_1.4s_ease-out_infinite]" : ""}`}
      style={{ backgroundImage: HEAT_BACKGROUND[heat] }}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="truncate text-2xl font-semibold tracking-tight" title={symbol}>
          {symbol}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {count > 0 && (
            <span
              className="tnum rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-paper/80"
              title={`Crossed ${settings.countPercent}% ${count} time${count === 1 ? "" : "s"} this period`}
            >
              {count}×
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleFavorite(symbol)}
            aria-pressed={favorite}
            aria-label={favorite ? `Unfavorite ${symbol}` : `Favorite ${symbol}`}
            title="Favorite"
            className={`-m-1 cursor-pointer p-1 text-2xl leading-none transition-opacity hover:opacity-50 ${
              favorite ? "text-heart" : "text-paper/40"
            }`}
          >
            {favorite ? <IoMdHeart /> : <IoMdHeartEmpty />}
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span
          className={`tnum text-3xl leading-none font-semibold ${
            tinted ? "text-paper" : up ? "text-up" : "text-down"
          }`}
        >
          {formatPercent(change)}
        </span>
        <Sparkline values={chart} up={up} tinted={tinted} />
      </div>

      <div className="tnum flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className="text-paper/45">
          {from !== null && (
            <>
              ${formatPrice(from)} <span aria-hidden="true">→</span>{" "}
            </>
          )}
          <span className="text-paper/80">${formatPrice(price)}</span>
        </span>
        <span className="text-xs text-paper/35" title="24h turnover">
          {formatVolume(volume)} vol
        </span>
      </div>
    </div>
  );
}

export const CoinCard = memo(CoinCardImpl);
