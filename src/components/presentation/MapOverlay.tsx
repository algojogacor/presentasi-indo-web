"use client";

import { SECTIONS } from "./context";
import { REHEARSAL_PLAN } from "./rehearsal";

const pad2 = (n: number) => String(n).padStart(2, "0");

const actMinutes = (i: number) =>
  Math.round(
    (REHEARSAL_PLAN[i] ?? []).reduce((s, x) => s + x, 0) / 60,
  );

/**
 * Peta navigasi — "daftar isi" presentasi itu sendiri.
 * [O]/[Tab] membuka · [Esc]/klik baris menutup · angka meloncat langsung.
 */
export default function MapOverlay({
  current,
  visited,
  onJump,
  onClose,
}: {
  current: number;
  visited: number[];
  onJump: (n: number) => void;
  onClose?: () => void;
}) {
  const seen = new Set(visited);
  return (
    <div
      className="fixed inset-0 z-[80] bg-base/95 backdrop-blur-[6px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Peta navigasi babak"
    >
      {/* Backdrop click to close */}
      {onClose && <div className="absolute inset-0" onClick={onClose} />}

      <div className="fade-slide-in relative z-10 min-h-full flex flex-col items-center justify-center px-4 sm:px-[10vw] py-12 md:py-8">
        {/* Tombol Tutup Mobile & Desktop */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-white/5 text-paper/70 hover:text-paper hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Tutup peta babak"
          >
            <span className="font-code text-sm">✕</span>
          </button>
        )}

        <p className="font-code text-[10px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] text-ember">
          DAFTAR ISI
        </p>
        <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-[3vw] text-paper text-center">
          Peta babak<span className="text-ember">.</span>
        </h2>
        <p className="mt-2 sm:mt-3 font-code text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.28em] text-mute text-center">
          PILIH BABAK UNTUK MELOMPAT {onClose ? "· KETUK ✕ UNTUK MENUTUP" : "— [ESC] MENUTUP"}
        </p>

        <div className="mt-4 sm:mt-[3.5vh] w-full max-w-full sm:max-w-lg md:w-[48vw] border-b border-edge">
          {SECTIONS.map((s, i) => {
            const isCurrent = i === current;
            const isSeen = seen.has(i);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onJump(i)}
                className={`group flex w-full items-center sm:items-baseline gap-2.5 sm:gap-[1.2vw] border-t border-edge py-3 sm:py-[0.85vh] px-2 text-left transition-colors duration-200 min-h-[44px] ${
                  isCurrent ? "border-ember/50 bg-ember/5" : "hover:border-ember/30 hover:bg-white/[0.02]"
                }`}
                aria-current={isCurrent ? "true" : undefined}
              >
                <span
                  className={`font-code text-[10px] sm:text-xs shrink-0 ${
                    isCurrent
                      ? "text-ember font-bold"
                      : isSeen
                        ? "text-paper/50"
                        : "text-mute"
                  }`}
                >
                  {pad2(i)}
                </span>
                <span
                  className={`font-display text-sm sm:text-base md:text-[1.4vw] leading-snug flex-1 truncate ${
                    isCurrent
                      ? "italic text-ember font-medium"
                      : isSeen
                        ? "text-paper/75"
                        : "text-paper/40"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className="hidden sm:flex ml-auto items-end gap-[3px] shrink-0"
                  aria-hidden="true"
                >
                  {Array.from({ length: s.steps }).map((_, k) => (
                    <span
                      key={k}
                      className={
                        isCurrent
                          ? "h-[9px] w-[3px] bg-ember/80"
                          : isSeen
                            ? "h-[6px] w-[3px] bg-paper/35"
                            : "h-[6px] w-[3px] bg-white/12"
                      }
                    />
                  ))}
                </span>
                <span className="font-code text-[9px] tracking-wider text-mute/70 shrink-0">
                  {`${s.steps} lkg`}
                </span>
                {isCurrent && (
                  <span className="font-code text-[9px] tracking-[0.15em] text-ember shrink-0">
                    ●
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
