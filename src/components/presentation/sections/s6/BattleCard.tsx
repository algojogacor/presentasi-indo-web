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
      className="battle-card absolute top-1/2 left-1/2 h-[54vh] w-[20vw] overflow-hidden rounded-[3px] border border-edge bg-surface/85 p-[1.3vw] opacity-0 backdrop-blur-[2px] shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
      style={{ willChange: "transform" }}
      aria-label={`Kartu ${c.title}`}
    >
      {/* Sudut aksen geometris */}
      <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-ember/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-ember/40 pointer-events-none" />

      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-code text-[9px] tracking-[0.3em] text-ember">
              {c.sub}
            </p>
            <span className="font-code text-[8px] text-mute/60 tracking-wider">
              0{i + 1}/04
            </span>
          </div>
          <h3 className="mt-2 font-display text-[1.95vw] leading-none text-paper">
            {c.title}
          </h3>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/5 bg-white/[0.02]">
          <IconComp
            className="h-[1.4vw] w-[1.4vw] text-ember/80"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      </header>

      <div className="mt-[1.2vw] space-y-[0.75vw]">
        {c.rows.map((r) => (
          <div
            key={r.k}
            className={`card-row rounded-[2px] py-1 pl-2 transition-colors ${
              r.hot && compare
                ? "border-l-2 border-ember bg-ember/15"
                : "border-l-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {r.hot && compare && (
                <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse shrink-0" />
              )}
              <p className="font-code text-[8px] tracking-[0.28em] text-mute">
                {r.k}
              </p>
            </div>
            <p
              className={`mt-1 font-body text-[0.98vw] leading-snug ${
                r.hot && compare ? "text-ember font-medium" : "text-paper/80"
              }`}
            >
              {r.v}
            </p>
          </div>
        ))}
      </div>

      <p className="card-note absolute right-[1.3vw] bottom-[1.2vw] left-[1.3vw] border-t border-edge pt-3 font-display text-[1.05vw] italic text-paper/70 opacity-0">
        {c.note}
      </p>
    </article>
  );
}
