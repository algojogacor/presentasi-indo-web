import type { BattleCardData } from "@/data/battle";

interface BattleCardProps {
  card: BattleCardData;
  index: number;
  compare: boolean;
}

export default function BattleCard({ card: c, index: i, compare }: BattleCardProps) {
  const IconComp = c.icon;

  return (
    <article
      data-card={i}
      className="battle-card absolute top-1/2 left-1/2 h-[54vh] w-[20vw] overflow-hidden rounded-[3px] border border-edge bg-surface/85 p-[1.3vw] opacity-0 backdrop-blur-[2px]"
      style={{ willChange: "transform" }}
      aria-label={`Kartu ${c.title}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-code text-[9px] tracking-[0.3em] text-ember">
            {c.sub}
          </p>
          <h3 className="mt-2 font-display text-[1.95vw] leading-none text-paper">
            {c.title}
          </h3>
        </div>
        <IconComp
          className="h-[1.6vw] w-[1.6vw] shrink-0 text-mute"
          strokeWidth={1.5}
          aria-hidden
        />
      </header>

      <div className="mt-[1.2vw] space-y-[0.75vw]">
        {c.rows.map((r) => (
          <div
            key={r.k}
            className={`card-row rounded-[2px] py-1 pl-2 ${
              r.hot && compare
                ? "border-l-2 border-ember bg-ember/10"
                : "border-l-2 border-transparent"
            }`}
          >
            <p className="font-code text-[8px] tracking-[0.28em] text-mute">
              {r.k}
            </p>
            <p
              className={`mt-1 font-body text-[0.98vw] leading-snug ${
                r.hot && compare ? "text-ember" : "text-paper/80"
              }`}
            >
              {r.v}
            </p>
          </div>
        ))}
      </div>

      <p className="card-note absolute right-[1.3vw] bottom-[1.2vw] left-[1.3vw] border-t border-edge pt-3 font-display text-[1.05vw] italic text-paper/60 opacity-0">
        {c.note}
      </p>
    </article>
  );
}
