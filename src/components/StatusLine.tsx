import type { FeedStatus } from "../hooks/usePriceFeed";
import { formatClock } from "../lib/format";

interface Props {
  status: FeedStatus;
  source: string;
  tracked: number;
  movers: number;
  alertPercent: number;
  resetIn: number;
  age: number | null;
}

const DOT: Record<FeedStatus, string> = {
  loading: "bg-paper/40",
  live: "bg-up",
  stale: "bg-yellow-400",
  error: "bg-down",
};

export function StatusLine({
  status,
  source,
  tracked,
  movers,
  alertPercent,
  resetIn,
  age,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-paper/45">
      <span className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${DOT[status]} ${status === "live" ? "animate-pulse" : ""}`} />
        {status === "loading" ? "connecting" : status === "error" ? "feed down" : source || "live"}
        {age !== null && status !== "loading" && <span className="tnum text-paper/30">{age}s ago</span>}
      </span>

      <span className="tnum">
        <b className="font-semibold text-paper/80">{tracked || "—"}</b> coins
      </span>

      <span className="tnum">
        <b className={`font-semibold ${movers ? "text-up" : "text-paper/80"}`}>{movers}</b> over{" "}
        {alertPercent}%
      </span>

      <span className="tnum">
        counters reset in <b className="font-semibold text-paper/80">{formatClock(resetIn)}</b>
      </span>
    </div>
  );
}
