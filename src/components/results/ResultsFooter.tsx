import { Download, Printer, Presentation, Smartphone } from "lucide-react";

export default function ResultsFooter() {
  return (
    <footer className="mt-auto border-t border-edge bg-surface/40">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
        <div className="no-print flex flex-wrap gap-3">
          <a
            href="/api/export"
            className="flex items-center gap-2 border border-ember/60 px-4 py-2.5 font-code text-[10px] tracking-[0.22em] text-ember transition-colors hover:bg-ember/10 focus-visible:bg-ember/10 focus-visible:outline-1 focus-visible:outline-ember"
            download
          >
            <Download className="h-4 w-4" aria-hidden />
            UNDUH CSV
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-edge px-4 py-2.5 font-code text-[10px] tracking-[0.22em] text-paper/80 transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:text-ember focus-visible:outline-1 focus-visible:outline-ember"
          >
            <Printer className="h-4 w-4" aria-hidden />
            CETAK / PDF
          </button>
        </div>
        <div className="no-print flex flex-wrap gap-3 font-code text-[10px] tracking-[0.22em]">
          <a
            href="#/"
            className="flex items-center gap-2 border border-edge px-4 py-2.5 text-mute transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:outline-1 focus-visible:outline-ember"
          >
            <Presentation className="h-4 w-4" aria-hidden />
            PRESENTASI
          </a>
          <a
            href="#/voting"
            className="flex items-center gap-2 border border-edge px-4 py-2.5 text-mute transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:outline-1 focus-visible:outline-ember"
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            VOTING
          </a>
        </div>
        <p className="w-full font-code text-[9px] tracking-[0.28em] text-mute/50 sm:w-auto">
          ANATOMI KARYA TULIS ILMIAH — KEL6 · PDB 93 · 2026
        </p>
      </div>
    </footer>
  );
}
