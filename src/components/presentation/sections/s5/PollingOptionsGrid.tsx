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
    <div className="mt-[3.2vh] grid max-w-[56vw] grid-cols-2 gap-[1.1vw]">
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
            className={`group flex items-start gap-[0.9vw] border p-[1.1vw] text-left transition-all duration-300 ${
              isCorrect
                ? "border-ember bg-ember/10"
                : isWinner
                  ? "border-paper/55 bg-paper/8"
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
              className={`pt-[0.35vw] font-code text-[11px] ${
                isWinner && !isCorrect ? "text-paper/80" : "text-ember"
              }`}
            >
              {o.key}
            </span>
            <span
              className={`font-body text-[1.25vw] leading-snug ${
                isWinner && !isCorrect
                  ? "text-paper/85"
                  : "text-paper/90"
              }`}
            >
              {o.label}
            </span>
            {tag && (
              <span
                className={`ml-auto font-code text-[9px] tracking-[0.25em] ${
                  isWinner && !isCorrect
                    ? "text-paper/70"
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
