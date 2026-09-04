import { LiveDot } from "../../atoms";

interface VideoFrameProps {
  step: number;
}

export default function VideoFrame({ step }: VideoFrameProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="s1-frame relative" style={{ width: "min(62vw, 148vh)" }}>
        <div className="absolute -top-7 left-0 flex items-center gap-2 font-code text-[10px] tracking-[0.35em] text-mute">
          <LiveDot />
          <span>GUEST LECTURER</span>
        </div>
        <div className="relative aspect-video w-full overflow-hidden border border-ember/60 bg-black shadow-2xl">
          {step >= 3 ? (
            <iframe
              src="https://www.youtube.com/embed/E6pPlIvlrPs?autoplay=1&rel=0&modestbranding=1"
              title="BAB 5 Part 1 — Pentingnya Menulis dan Mempublikasikan Artikel Ilmiah"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : null}
        </div>
        <div className="mt-4 flex items-end justify-between gap-6">
          <div>
            <p className="font-body text-[1.05vw] leading-snug text-paper">
              Prof. Wisnu Jatmiko — Guru Besar Fasilkom UI
            </p>
            <p className="mt-1.5 font-code text-[10px] tracking-[0.22em] text-mute">
              SERI METODOLOGI PENELITIAN &amp; PENULISAN ARTIKEL ILMIAH
            </p>
          </div>
          <div className="text-right font-code text-[10px] leading-[1.8] tracking-[0.12em] text-mute">
            <p>BAB 5 · PART 1 — PENTINGNYA MENULIS</p>
            <p>LAB1231 FASILKOM UI · 04:41 · 1080p</p>
          </div>
        </div>
      </div>
    </div>
  );
}
