import type { PollQuestion } from "@/lib/questions";
import type { ResultsPayload } from "@/lib/questions";

interface QuestionDetailCardProps {
  question: PollQuestion;
  result: ResultsPayload | undefined;
  loaded: boolean;
}

export default function QuestionDetailCard({
  question: q,
  result: r,
  loaded,
}: QuestionDetailCardProps) {
  const total = r?.total ?? 0;
  const correctKey = q.options.find((o) => o.correct)?.key;
  const maxCount =
    r && total > 0 ? Math.max(0, ...r.options.map((o) => o.count)) : 0;
  const correctCount =
    r?.options.find((o) => o.key === correctKey)?.count ?? 0;
  const correctPct =
    total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const verdict =
    total === 0
      ? null
      : correctPct >= 80
        ? "Hampir seluruh ruangan sudah sejalan dengan teorinya."
        : correctPct >= 50
          ? "Mayoritas di jalur — sisanya bagian menarik untuk dibedah."
          : correctPct > 0
            ? "Yang benar justru minoritas — mari lihat kenapa."
            : "Seluruh kelas terpesona jebakan — momen bedah paling bagus.";

  return (
    <section
      className="rcard border border-edge bg-surface/60 p-6 sm:p-8"
      aria-label={`Hasil pertanyaan ${q.id}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-code text-[10px] tracking-[0.3em] text-ember">
          {`PERTANYAAN 0${q.id}`}
        </span>
        <span className="font-code text-[10px] tracking-[0.2em] text-mute/70">
          {`${total} SUARA`}
        </span>
      </div>
      <h2 className="mt-3 max-w-2xl font-display text-2xl leading-snug sm:text-[1.7rem]">
        {q.prompt}
      </h2>

      {total === 0 ? (
        <p className="mt-6 border-l-2 border-edge pl-4 font-display text-lg italic text-mute/80">
          {loaded ? "Belum ada suara untuk pertanyaan ini." : "Memuat hasil…"}
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3">
            {q.options.map((o) => {
              const count =
                r?.options.find((x) => x.key === o.key)?.count ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isWinner = count === maxCount && count > 0;
              const tag =
                o.correct && isWinner
                  ? "JAWABAN · MAYORITAS"
                  : o.correct
                    ? "JAWABAN"
                    : isWinner
                      ? "MAYORITAS KELAS"
                      : null;
              return (
                <div key={o.key} className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`w-5 font-code text-xs ${
                      isWinner && !o.correct ? "text-paper/80" : "text-ember"
                    }`}
                  >
                    {o.key}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span
                        className={`truncate font-body text-sm sm:text-[0.95rem] ${
                          isWinner && !o.correct
                            ? "text-paper/85"
                            : "text-paper/80"
                        }`}
                      >
                        {o.label}
                      </span>
                      <span className="flex shrink-0 items-baseline gap-2 font-code text-[10px] tracking-[0.15em]">
                        {tag && (
                          <span
                            className={
                              isWinner && !o.correct
                                ? "text-paper/70"
                                : "text-ember"
                            }
                          >
                            {tag}
                          </span>
                        )}
                        <span className="text-paper/70">{`${count} · ${pct}%`}</span>
                      </span>
                    </div>
                    <div className="rbar-track h-[10px] bg-white/6">
                      <div
                        className={`rbar-fill pollbar h-full ${
                          isWinner
                            ? "pollbar-winner"
                            : o.correct
                              ? "pollbar-correct"
                              : "bg-ember/45"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-5 border-t border-edge pt-5">
            <span className="font-display text-5xl leading-none text-ember">
              {`${correctPct}%`}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-code text-[10px] tracking-[0.25em] text-mute">
                {`KELAS MENJAWAB BENAR · ${correctCount}/${total} SUARA`}
              </span>
              <span className="font-display text-base italic text-paper/75">
                {verdict}
              </span>
            </div>
          </div>

          <div className="mt-5 border-l-2 border-ember/70 pl-4">
            <p className="font-code text-[10px] tracking-[0.3em] text-ember">
              MENGAPA —
            </p>
            <p className="mt-1.5 max-w-2xl font-body text-sm leading-relaxed text-paper/80">
              {q.answerNote}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
