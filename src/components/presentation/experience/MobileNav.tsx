"use client";

import { ChevronLeft, ChevronRight, Map, BookOpen } from "lucide-react";
import { SECTIONS } from "../context";

interface MobileNavProps {
  section: number;
  step: number;
  onAdvance: () => void;
  onBack: () => void;
  onOpenMap: () => void;
  onOpenBib: () => void;
  onOpenLobby?: () => void;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function MobileNav({
  section,
  step,
  onAdvance,
  onBack,
  onOpenMap,
  onOpenBib,
  onOpenLobby,
}: MobileNavProps) {
  const isFirst = !onOpenLobby && section === 0 && step === 0;
  const isAtStart = section === 0 && step === 0;
  const isLast =
    section === SECTIONS.length - 1 &&
    step === SECTIONS[section].steps - 1;

  const currentTotalSteps = SECTIONS[section]?.steps ?? 1;

  return (
    <nav
      aria-label="Navigasi presentasi"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-6 z-[75] flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/12 bg-[#0c0c14]/92 px-1.5 py-1 sm:px-2.5 sm:py-1.5 backdrop-blur-lg shadow-[0_4px_28px_rgba(0,0,0,0.85)] select-none transition-all duration-300"
    >
      {/* Tombol Pustaka [P] */}
      <button
        type="button"
        onClick={onOpenBib}
        className="flex h-11 w-11 items-center justify-center rounded-full text-mute transition-colors hover:bg-white/5 hover:text-ember active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember"
        aria-label="Buka Daftar Pustaka"
        title="Daftar Pustaka [P]"
      >
        <BookOpen className="h-4 w-4" />
      </button>

      {/* Tombol Peta Babak [O] */}
      <button
        type="button"
        onClick={onOpenMap}
        className="flex h-11 w-11 items-center justify-center rounded-full text-mute transition-colors hover:bg-white/5 hover:text-ember active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember"
        aria-label="Buka Peta Babak"
        title="Peta Babak [O]"
      >
        <Map className="h-4 w-4" />
      </button>

      <span className="h-4 w-px bg-white/10 mx-0.5" aria-hidden="true" />

      {/* Tombol Mundur (Previous) */}
      <button
        type="button"
        onClick={isAtStart && onOpenLobby ? onOpenLobby : onBack}
        disabled={isFirst}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember ${
          isFirst
            ? "cursor-not-allowed opacity-25 text-mute"
            : "cursor-pointer text-paper/85 hover:bg-white/8 hover:text-ember"
        }`}
        aria-label={isAtStart && onOpenLobby ? "Kembali ke Lobi QR" : "Langkah sebelumnya"}
        title={isAtStart && onOpenLobby ? "Kembali ke Lobi QR" : "Sebelumnya (←)"}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Indikator Babak & Langkah */}
      <button
        type="button"
        onClick={onOpenMap}
        className="flex items-center gap-1 px-2 py-1 font-code text-[11px] tracking-wider text-paper/80 hover:text-ember transition-colors"
        title="Klik untuk membuka peta babak"
        aria-label={`Babak ${section}, langkah ${step + 1} dari ${currentTotalSteps}. Klik untuk buka peta.`}
      >
        <span className="text-ember font-semibold">{pad2(section)}</span>
        <span className="text-white/30">/</span>
        <span>
          {pad2(step + 1)}:{pad2(currentTotalSteps)}
        </span>
      </button>

      {/* Tombol Maju (Next) */}
      <button
        type="button"
        onClick={onAdvance}
        disabled={isLast}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember ${
          isLast
            ? "cursor-not-allowed opacity-35 bg-white/5 text-mute"
            : "cursor-pointer bg-ember/20 text-ember hover:bg-ember/30 hover:text-ember-hi shadow-[0_0_15px_rgba(232,160,32,0.2)]"
        }`}
        aria-label="Langkah berikutnya"
        title="Berikutnya (Space / →)"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
