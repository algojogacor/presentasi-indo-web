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
    <div className="w-[32vw]">
      <div className="mb-3 flex items-center gap-2.5">
        <LiveDot />
        <span className="font-code text-[10px] tracking-[0.2em] text-mute">
          {live ? "LIVE" : "FINAL"} ·{" "}
          <span key={total} className="count-flash">
            {total}
          </span>{" "}
          RESPONDEN
        </span>
        {live && devices > 0 && (
          <span className="font-code text-[9px] tracking-[0.25em] text-paper/60">
            · {devices} PERANGKAT
          </span>
        )}
        {synced && live && (
          <span className="font-code text-[9px] tracking-[0.25em] text-ember/80">
            · SYNC
          </span>
        )}
        {fallback && (
          <span className="font-code text-[9px] tracking-[0.2em] text-ember">
            FALLBACK MANUAL
          </span>
        )}
      </div>

      {live && total === 0 && !fallback && (
        <p className="mb-3 font-code text-[10px] tracking-[0.22em] text-mute/70 animate-pulse">
          MENUNGGU SUARA PERTAMA…
        </p>
      )}

      {question.options.map((o) => {
        const isWinner = revealed && winners.includes(o.key);
        const isCorrect = revealed && o.correct;
        return (
          <div key={o.key} className="mb-[0.9vh] flex items-center gap-3">
            <span
              className={`w-4 font-code text-[10px] ${
                isWinner && !isCorrect ? "text-paper/75" : "text-mute"
              }`}
            >
              {o.key}
            </span>
            <div className="h-[10px] flex-1 bg-white/6">
              <div
                className={`pollbar h-full ${
                  isWinner
                    ? "pollbar-winner"
                    : isCorrect
                      ? "pollbar-correct"
                      : "bg-ember/45"
                }`}
                style={{ width: `${pct(o.key)}%` }}
                data-testid={`pollbar-${o.key}`}
              />
            </div>
            <span
              className={`w-[4.5vw] text-right font-code text-[10px] ${
                isWinner ? "text-paper/85" : "text-paper/70"
              }`}
            >
              {counts[o.key] ?? 0} · {pct(o.key)}%
            </span>
          </div>
        );
      })}

      <PollingSparkline spark={spark} live={live} fallback={fallback} />

      <p className="mt-[0.8vh] font-code text-[9px] tracking-[0.22em] text-mute/60">
        {revealed && total > 0 ? "[P] PAPAN SKOR · " : ""}
        [F] FALLBACK · [R] RESET · [E] EKSPOR CSV
      </p>
    </div>
  );
}
