import { SECTIONS } from "../context";
import { visitedActs } from "../session";

interface RailTicksProps {
  section: number;
}

export default function RailTicks({ section }: RailTicksProps) {
  return (
    <div
      className="pointer-events-none fixed right-6 bottom-5 z-[70] flex items-end gap-[3px]"
      aria-hidden="true"
    >
      {SECTIONS.map((_, i) => (
        <span
          key={i}
          className={
            i === section
              ? "rail-live h-[10px] w-[3px] bg-ember"
              : visitedActs.has(i)
                ? "h-[6px] w-[3px] bg-paper/30"
                : "h-[6px] w-[3px] bg-white/12"
          }
        />
      ))}
    </div>
  );
}
