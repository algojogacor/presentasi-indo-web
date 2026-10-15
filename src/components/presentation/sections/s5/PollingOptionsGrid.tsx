import type { PollQuestion } from "@/lib/questions";

interface PollingOptionsGridProps {
  question: PollQuestion;
  revealed: boolean;
  winners: string[];
  manualChoice: string | null;
  live: boolean;
  fallback: boolean;
  onChoose: (key: string) => void;
}

export default function PollingOptionsGrid({
  question,
  revealed,
  winners,
  manualChoice,
  live,
  fallback,
  onChoose,
}: PollingOptionsGridProps) {
  return (
    <div className="mt-2.5 md:mt-[2vh] grid w-full max-w-full md:max-w-[64vw] grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-[1vw]">
      {question.options.map((o) => {
        const isCorrect = revealed && o.correct;
        const isWinner = revealed && winners.includes(o.key);
        const isManual = manualChoice === o.key;
        const tag =
          isCorrect && isWinner
            ? "JAWABAN · MAYORITAS"
            : isCorrect
              ? "JAWABAN"
              : isWinner
                ? "MAYORITAS KELAS"
                : null;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChoose(o.key)}
            disabled={!live || !fallback || !!manualChoice}
            className={`group flex items-start gap-2.5 sm:gap-[0.8vw] border p-3 sm:p-[0.9vw] text-left transition-all duration-300 ${
              isCorrect
                ? "border-ember bg-ember/15"
                : isWinner
                  ? "border-paper/60 bg-paper/10"
                  : revealed
                    ? "border-edge opacity-35"
                    : "border-edge hover:border-ember/50"
            } ${isManual ? "ring-1 ring-ember" : ""} ${
              live && fallback && !manualChoice
                ? "cursor-pointer"
                : "cursor-default"
            }`}
            aria-label={`Opsi ${o.key}: ${o.label}`}
          >
            <span
              className={`pt-0.5 font-code text-sm md:text-base font-bold ${
                isWinner && !isCorrect ? "text-paper/85" : "text-ember"
              }`}
            >
              {o.key}
            </span>
            <span
              className={`font-body text-sm md:text-[1.35vw] font-medium leading-snug ${
                isWinner && !isCorrect
                  ? "text-paper/90"
                  : "text-paper"
              }`}
            >
              {o.label}
            </span>
            {tag && (
              <span
                className={`ml-auto font-code text-xs tracking-[0.2em] font-semibold whitespace-nowrap ${
                  isWinner && !isCorrect
                    ? "text-paper/80"
                    : "text-ember"
                }`}
              >
                {tag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
