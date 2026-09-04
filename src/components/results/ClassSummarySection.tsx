import { QUESTIONS } from "@/lib/questions";
import type { ResultsMap, TimelineMap } from "@/types/polling";
import { sparkPoints, fmtSpan } from "./helpers";

interface ClassSummarySectionProps {
  results: ResultsMap;
  timelines: TimelineMap;
}

export default function ClassSummarySection({
  results,
  timelines,
}: ClassSummarySectionProps) {
  const t1 = results[1]?.total ?? 0;
  const t2 = results[2]?.total ?? 0;
  const retStr =
    t1 > 0 && t2 > 0
      ? ` · RETENSI ${Math.round((Math.min(t1, t2) / Math.max(t1, t2)) * 100)}%`
      : "";

  return (
    <section className="mb-8" aria-label="Ringkasan kelas">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-code text-[10px] tracking-[0.35em] text-ember">
          RINGKASAN KELAS
        </p>
        <p className="font-code text-[9px] tracking-[0.2em] text-mute/70">
          {`Q1 ${t1} SUARA · Q2 ${t2} SUARA${retStr}`}
        </p>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {QUESTIONS.map((q) => {
          const r = results[q.id];
          const total = r?.total ?? 0;
          const correctKey = q.options.find((o) => o.correct)?.key;
          const correctCount =
            r?.options.find((o) => o.key === correctKey)?.count ?? 0;
          const correctPct =
            total > 0 ? Math.round((correctCount / total) * 100) : 0;
          const maxCount =
            r && total > 0 ? Math.max(0, ...r.options.map((o) => o.count)) : 0;
          const winners =
            maxCount > 0
              ? q.options.filter(
                  (o) => (r?.options.find((x) => x.key === o.key)?.count ?? 0) === maxCount,
                )
              : [];
          const tl = timelines[q.id];
          const pts = tl && tl.points.length > 0 ? sparkPoints(tl, 200, 30) : null;
          return (
            <div
              key={q.id}
              className="agg-card border border-edge bg-surface/60 p-5"
              aria-label={`Ringkasan pertanyaan ${q.id}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-code text-[9px] tracking-[0.25em] text-ember">
                  {`PERTANYAAN 0${q.id}`}
                </span>
                <span className="font-code text-[9px] tracking-[0.15em] text-mute/70">
                  {`${total} SUARA`}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-4">
                <span className="font-display text-4xl leading-none text-ember">
                  {total > 0 ? `${correctPct}%` : "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-code text-[8.5px] tracking-[0.22em] text-mute">
                    KETEPATAN KELAS
                  </p>
                  <p className="truncate font-body text-sm text-paper/75">
                    {total === 0
                      ? "Belum ada suara"
                      : winners.length > 1
                        ? `SERI — ${winners.map((w) => w.key).join(" / ")}`
                        : winners[0]
                          ? `${winners[0].key} — ${winners[0].label}`
                          : "Belum ada suara"}
                  </p>
                </div>
              </div>
              {pts && tl && (
                <div className="mt-4 border-t border-edge pt-3">
                  <svg
                    viewBox="0 0 200 30"
                    className="h-[30px] w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polyline
                      points={pts}
                      fill="none"
                      stroke="#E8A020"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="spark-curve"
                    />
                  </svg>
                  <p className="mt-1 font-code text-[8.5px] tracking-[0.2em] text-mute/70">
                    {`TEMPO — ${tl.total} SUARA DALAM ${fmtSpan(tl.span)}`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
