"use client";

import { SECTIONS } from "./context";

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Peta navigasi — "daftar isi" presentasi itu sendiri.
 * [O]/[Tab] membuka · [Esc]/klik baris menutup · angka meloncat langsung.
 */
export default function MapOverlay({
  current,
  visited,
  onJump,
}: {
  current: number;
  visited: number[];
  onJump: (n: number) => void;
}) {
  const seen = new Set(visited);
  return (
    <div
      className="fixed inset-0 z-[80] bg-base/95 backdrop-blur-[6px]"
      role="dialog"
      aria-modal="true"
      aria-label="Peta navigasi babak"
    >
      <div className="fade-slide-in absolute inset-0 flex flex-col items-center justify-center px-[10vw]">
        <p className="font-code text-[10px] tracking-[0.5em] text-ember">
          DAFTAR ISI
        </p>
        <h2 className="mt-3 font-display text-[3vw] text-paper">
          Peta babak<span className="text-ember">.</span>
        </h2>
        <p className="mt-3 font-code text-[10px] tracking-[0.28em] text-mute">
          KLIK BARIS ATAU TEKAN ANGKA — [ESC] MENUTUP
        </p>

        <div className="mt-[3.5vh] w-[48vw] border-b border-edge">
          {SECTIONS.map((s, i) => {
            const isCurrent = i === current;
            const isSeen = seen.has(i);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onJump(i)}
                className={`group flex w-full items-baseline gap-[1.2vw] border-t border-edge py-[0.85vh] text-left transition-colors duration-200 ${
                  isCurrent ? "border-ember/50" : "hover:border-ember/30"
                }`}
                aria-current={isCurrent ? "true" : undefined}
              >
                <span
                  className={`font-code text-[10px] ${
                    isCurrent
                      ? "text-ember"
                      : isSeen
                        ? "text-paper/50"
                        : "text-mute"
                  }`}
                >
                  {pad2(i)}
                </span>
                <span
                  className={`font-display text-[1.4vw] leading-snug ${
                    isCurrent
                      ? "italic text-ember"
                      : isSeen
                        ? "text-paper/75"
                        : "text-paper/35"
                  }`}
                >
                  {s.label}
                </span>
                <span className="ml-auto font-code text-[9px] tracking-[0.18em] text-mute/70">
                  {s.steps} LANGKAH
                </span>
                {isCurrent && (
                  <span className="font-code text-[9px] tracking-[0.22em] text-ember">
                    ● AKTIF
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
