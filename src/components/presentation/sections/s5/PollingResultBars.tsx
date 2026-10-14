import { LiveDot } from "../../atoms";
import type { PollQuestion } from "@/lib/questions";
import type { Counts, TimelinePayload } from "@/types/polling";
import PollingSparkline from "./PollingSparkline";

interface PollingResultBarsProps {
  question: PollQuestion;
  counts: Counts;
  total: number;
  revealed: boolean;
  winners: string[];
  live: boolean;
  devices: number;
  synced: boolean;
  fallback: boolean;
  spark: TimelinePayload | null;
}

export default function PollingResultBars({
  question,
  counts,
  total,
  revealed,
  winners,
  live,
  devices,
  synced,
  fallback,
  spark,
}: PollingResultBarsProps) {
  const pct = (key: string) => {
    const c = counts[key] ?? 0;
    return total > 0 ? Math.round((c / total) * 100) : 0;
  };

  return (
    <div className="w-[36vw]">
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <LiveDot />
        <span className="font-code text-xs sm:text-sm tracking-[0.2em] text-mute/90 font-medium">
          {live ? "LIVE" : "FINAL"} ·{" "}
          <span key={total} className="count-flash text-ember font-bold">
            {total}
          </span>{" "}
          RESPONDEN
        </span>
        {live && devices > 0 && (
          <span className="font-code text-xs tracking-[0.2em] text-paper/70 font-medium">
            · {devices} PERANGKAT
          </span>
        )}
        {synced && live && (
          <span className="font-code text-xs tracking-[0.2em] text-ember font-medium">
            · SYNC
          </span>
        )}
        {fallback && (
          <span className="font-code text-xs tracking-[0.2em] text-ember font-medium">
            FALLBACK MANUAL
          </span>
        )}
      </div>

      {live && total === 0 && !fallback && (
        <p className="mb-3.5 font-code text-xs sm:text-sm tracking-[0.22em] text-mute/80 animate-pulse">
          MENUNGGU SUARA PERTAMA…
        </p>
      )}

      {question.options.map((o) => {
        const isWinner = revealed && winners.includes(o.key);
        const isCorrect = revealed && o.correct;
        return (
          <div key={o.key} className="mb-[1.1vh] flex items-center gap-3">
            <span
              className={`w-5 font-code text-xs sm:text-sm font-bold ${
                isWinner && !isCorrect ? "text-paper" : isCorrect ? "text-ember" : "text-mute"
              }`}
            >
              {o.key}
            </span>
            <div className="h-[14px] flex-1 bg-white/10 rounded-sm overflow-hidden">
              <div
                className={`pollbar h-full ${
                  isWinner
                    ? "pollbar-winner"
                    : isCorrect
                      ? "pollbar-correct"
                      : "bg-ember/50"
                }`}
                style={{ width: `${pct(o.key)}%` }}
                data-testid={`pollbar-${o.key}`}
              />
            </div>
            <span
              className={`w-[6vw] text-right font-code text-xs sm:text-sm font-semibold ${
                isWinner ? "text-paper" : "text-paper/80"
              }`}
            >
              {counts[o.key] ?? 0} · {pct(o.key)}%
            </span>
          </div>
        );
      })}

      <PollingSparkline spark={spark} live={live} fallback={fallback} />
    </div>
  );
}
