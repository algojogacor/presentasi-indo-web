import type { PollQuestion } from "@/lib/questions";
import type { Counts } from "@/types/polling";

interface ScoreboardOverlayProps {
  qid: number;
  question: PollQuestion;
  counts: Counts;
  total: number;
  maxCount: number;
  correctPct: number;
  correctCount: number;
  verdict: string | null;
}

export default function ScoreboardOverlay({
  qid,
  question,
  counts,
  total,
  maxCount,
  correctPct,
  correctCount,
  verdict,
}: ScoreboardOverlayProps) {
  const pct = (key: string) => {
    const c = counts[key] ?? 0;
    return total > 0 ? Math.round((c / total) * 100) : 0;
  };

  return (
    <div
      className="fade-slide-in absolute inset-0 flex flex-col px-[8vw] pt-[12vh] pb-[8vh]"
      data-testid="scoreboard"
      aria-label={`Papan skor pertanyaan ${qid}`}
    >
      <div className="flex items-baseline gap-4">
        <span className="font-code text-[10px] tracking-[0.3em] text-ember">
          {`PERTANYAAN 0${qid}`}
        </span>
        <span className="font-code text-[10px] tracking-[0.2em] text-mute">
          PAPAN SKOR · FINAL
        </span>
      </div>
      <h2 className="mt-3 max-w-[62vw] font-display text-[2.5vw] leading-[1.15] text-paper">
        {question.prompt}
      </h2>

      <div className="mt-[3vh] max-w-[58vw] border-t border-edge">
        {[...question.options]
          .sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0))
          .map((o, i) => {
            const c = counts[o.key] ?? 0;
            const rel = maxCount > 0 ? (c / maxCount) * 100 : 0;
            const isFirst = i === 0;
            return (
              <div
                key={o.key}
                className="score-row flex items-center gap-[1.4vw] border-b border-edge py-[1.35vh]"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span
                  className={`w-[3.6vw] shrink-0 text-right font-display leading-none ${
                    isFirst ? "text-[3vw] text-ember" : "text-[2.1vw] text-paper/30"
                  }`}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <span
                      className={`min-w-0 truncate font-body text-[1.25vw] ${
                        o.correct
                          ? "text-paper"
                          : isFirst
                            ? "text-paper/85"
                            : "text-paper/55"
                      }`}
                    >
                      <span className="mr-2 font-code text-[11px] text-ember">
                        {o.key}
                      </span>
                      {o.label}
                    </span>
                    <span
                      className={`shrink-0 font-code text-[10px] tracking-[0.18em] ${
                        o.correct || isFirst ? "text-ember" : "text-paper/55"
                      }`}
                    >
                      {`${c} SUARA · ${pct(o.key)}%${
                        o.correct ? " · KUNCI" : isFirst ? " · MAYORITAS" : ""
                      }`}
                    </span>
                  </div>
                  <div className="mt-[0.6vh] h-[12px] max-w-[42vw] bg-white/6">
                    <div
                      className={`score-bar h-full ${
                        isFirst
                          ? "score-bar-first"
                          : o.correct
                            ? "pollbar-correct"
                            : "bg-ember/40"
                      }`}
                      style={{ width: `${rel}%` }}
                      data-testid={`scorebar-${o.key}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="reveal-stat mt-[2.6vh] flex items-baseline gap-[1.4vw]">
        <span
          className="font-display text-[4vw] leading-none text-ember"
          aria-label={`${correctPct} persen kelas menjawab benar`}
        >
          {correctPct}%
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-code text-[10px] tracking-[0.25em] text-mute">
            {`KETEPATAN KELAS · ${correctCount}/${total} SUARA`}
          </span>
          <span className="font-display italic text-[1.25vw] leading-snug text-paper/80">
            {verdict}
          </span>
        </div>
      </div>

      <p className="mt-auto font-code text-[10px] tracking-[0.4em] text-mute">
        [P] KEMBALI KE PEMBAHASAN · [SPACE] LANJUT
      </p>
    </div>
  );
}
