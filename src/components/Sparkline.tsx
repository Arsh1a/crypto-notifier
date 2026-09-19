import { memo } from "react";

interface Props {
  values: number[];
  up: boolean;
  /** On a tinted card green/red would fight the fill, so draw in the card's ink. */
  tinted?: boolean;
}

/**
 * Tiny inline chart of the current window. Flat or single-sample series render
 * as a centred line rather than dividing by a zero range.
 */
function SparklineImpl({ values, up, tinted = false }: Props) {
  const width = 118;
  const height = 34;
  const stroke = tinted
    ? "rgba(253,254,255,0.85)"
    : up
      ? "var(--color-up)"
      : "var(--color-down)";

  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true" className="opacity-25">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - 3 - ((v - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineImpl);
