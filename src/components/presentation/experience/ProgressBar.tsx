import { SECTIONS } from "../context";
import { cumStepsBefore, TOTAL_STEPS } from "../rehearsal";

interface ProgressBarProps {
  clockRunning: boolean;
  posPct: number;
  planPct: number;
  rehearsalOn: boolean;
}

export default function ProgressBar({
  clockRunning,
  posPct,
  planPct,
  rehearsalOn,
}: ProgressBarProps) {
  if (!clockRunning) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[68] h-[3px]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-white/7" />
      {/* Segmen babak — tint selang-seling untuk membedakan teritori */}
      {SECTIONS.slice(1).map((s, i) => (
        <span
          key={`seg-${i}`}
          className={i % 2 === 0 ? "absolute inset-y-0 bg-white/[0.05]" : ""}
          style={{
            left: `${(cumStepsBefore(i + 1) / TOTAL_STEPS) * 100}%`,
            width: `${(s.steps / TOTAL_STEPS) * 100}%`,
          }}
        />
      ))}
      {/* Batas antar-babak */}
      {SECTIONS.slice(1).map((_, i) => (
        <span
          key={`tick-${i}`}
          className="absolute top-0 bottom-0 w-px bg-white/25"
          style={{
            left: `${(cumStepsBefore(i + 1) / TOTAL_STEPS) * 100}%`,
          }}
        />
      ))}
      {/* Isian posisi — gradasi ember + titik ujung menyala */}
      <div
        className="ribbon-fill absolute inset-y-0 left-0 bg-gradient-to-r from-ember/40 to-ember"
        style={{ width: `${posPct}%` }}
      />
      <span className="ribbon-tip" style={{ left: `${posPct}%` }} />
      {rehearsalOn && (
        <span className="plan-dot" style={{ left: `${planPct}%` }} />
      )}
    </div>
  );
}
