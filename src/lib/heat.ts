import type { Settings } from "../types";

export type Heat = "none" | "warm" | "hot" | "blazing";

/**
 * The original app tinted each card by how hard the coin was moving —
 * yellow, then blue, then red. Those cutoffs were hardcoded at 1.002 / 1.004;
 * here they scale off the configured count threshold so the tiers still mean
 * something when you change it.
 */
export function heatOf(change: number | null, settings: Settings): Heat {
  if (change === null || change <= 0) return "none";
  if (change >= settings.alertPercent / 100) return "blazing";
  const count = settings.countPercent / 100;
  if (change >= count) return "hot";
  if (change >= count / 2) return "warm";
  return "none";
}

/**
 * Hue carries the meaning; lightness is held constant.
 *
 * The original palette mixed an acid yellow with a near-black navy — white text
 * scored 2.2:1 on one and 15.6:1 on the other, which is why the grid never
 * settled. Every tier here is solved to the same luminance: white text at
 * 7.6:1, and just under 2x separation from the plain card.
 */
const TIERS: Record<Heat, [string, string]> = {
  none: ["var(--color-card)", "var(--color-card-hi)"],
  warm: ["#6b4f05", "#836006"],
  hot: ["#3146bc", "#3c56e5"],
  blazing: ["#a12020", "#c42727"],
};

/** The 7deg two-stop gradient the original gave every panel. */
export const HEAT_BACKGROUND: Record<Heat, string> = Object.fromEntries(
  Object.entries(TIERS).map(([heat, [from, to]]) => [
    heat,
    `linear-gradient(7deg, ${from} 66%, ${to} 100%)`,
  ]),
) as Record<Heat, string>;

/** On a tinted card the fill is already the signal, so the number stays neutral. */
export const HEAT_IS_TINTED: Record<Heat, boolean> = {
  none: false,
  warm: true,
  hot: true,
  blazing: true,
};
