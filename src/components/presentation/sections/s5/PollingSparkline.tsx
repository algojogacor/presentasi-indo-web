import type { TimelinePayload } from "@/types/polling";

interface PollingSparklineProps {
  spark: TimelinePayload | null;
  live: boolean;
  fallback: boolean;
}

export default function PollingSparkline({
  spark,
  live,
  fallback,
}: PollingSparklineProps) {
  if (!live || fallback || !spark || spark.points.length === 0) {
    return null;
  }

  const span = Math.max(1, spark.span);
  const tot = Math.max(1, spark.total);
  const xy: [number, number][] = [
    { t: 0, c: 0 },
    ...spark.points,
  ].map((p) => [
    Math.min(320, (p.t / span) * 320),
    40 - Math.min(38, (p.c / tot) * 36) - 2,
  ]);
  const sparkLine = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  const sparkLast = { x: lx, y: ly };
  const sparkArea = `M0,40 ${xy
    .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")} L${lx.toFixed(1)},40 Z`;
  const sparkSpanLabel = `${Math.floor(span / 60)}:${String(
    Math.round(span % 60),
  ).padStart(2, "0")}`;

  return (
    <div className="mt-[1.1vh]" data-testid="poll-spark">
      <svg
        viewBox="0 0 320 40"
        className="h-[40px] w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={sparkArea} fill="rgba(232,160,32,0.10)" />
        <polyline
          points={sparkLine}
          fill="none"
          stroke="#E8A020"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="spark-curve"
        />
        <circle cx={sparkLast.x} cy={sparkLast.y} r="2.5" fill="#E8A020" />
      </svg>
      <p className="mt-1 font-code text-[9px] tracking-[0.22em] text-mute/70">
        {`TEMPO SUARA · ${spark.total} DALAM ${sparkSpanLabel}`}
      </p>
    </div>
  );
}
