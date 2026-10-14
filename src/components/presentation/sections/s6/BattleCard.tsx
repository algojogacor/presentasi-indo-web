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
      className="battle-card absolute top-1/2 left-1/2 flex flex-col justify-between h-[58vh] w-[21vw] overflow-hidden rounded-[3px] border border-edge bg-surface/90 p-[1.2vw] opacity-0 backdrop-blur-[2px] shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
      style={{ willChange: "transform" }}
      aria-label={`Kartu ${c.title}`}
    >
      {/* Sudut aksen geometris */}
      <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-ember/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-ember/40 pointer-events-none" />

      <div>
        <header className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-code text-xs tracking-[0.25em] text-ember font-semibold">
                {c.sub}
              </p>
              <span className="font-code text-xs text-mute/80 tracking-wider">
                0{i + 1}/04
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-[clamp(1.35rem,2.1vw,2.4rem)] leading-tight text-paper font-semibold">
              {c.title}
            </h3>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/10 bg-white/[0.04]">
            <IconComp
              className="h-5 w-5 md:h-[1.4vw] md:w-[1.4vw] text-ember"
              strokeWidth={1.6}
              aria-hidden
            />
          </div>
        </header>

        <div className="mt-[0.9vw] space-y-[0.45vw]">
          {c.rows.map((r) => (
            <div
              key={r.k}
              className={`card-row rounded-[2px] py-0.5 pl-2 transition-colors ${
                r.hot && compare
                  ? "border-l-2 border-ember bg-ember/15"
                  : "border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {r.hot && compare && (
                  <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse shrink-0" />
                )}
                <p className="font-code text-[10.5px] md:text-xs tracking-[0.2em] font-semibold text-mute/90">
                  {r.k}
                </p>
              </div>
              <p
                className={`mt-0.5 font-body text-xs md:text-[1.05vw] leading-relaxed ${
                  r.hot && compare ? "text-ember font-semibold" : "text-paper/90"
                }`}
              >
                {r.v}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="card-note mt-auto border-t border-edge pt-2.5 font-display text-xs md:text-[1.12vw] leading-snug italic text-paper/85 opacity-0 shrink-0">
        {c.note}
      </p>
    </article>
  );
}
