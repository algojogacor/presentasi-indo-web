import Searchlights from "./Searchlights";

interface OpeningQuoteProps {
  step: number;
}

export function OpeningQuote({ step }: OpeningQuoteProps) {
  return (
    <div className="s1-black-layer absolute inset-0 z-[45] flex flex-col items-center justify-center bg-[#0A0A0F] overflow-hidden">
      {/* 7 Searchlight Beams — Volumetric cones ala 20th Century Fox */}
      <Searchlights />

      {/* Quote Pengantar Presenter */}
      <div className="relative z-10 flex flex-col items-center justify-center px-[14vw] text-center pointer-events-none">
        <p className="s1-quote max-w-[62vw] font-display italic text-[1.95vw] leading-snug text-paper transition-opacity">
          &ldquo;Sebelum kita membedah anatomi teks di atas meja operasi, mari
          kita dengarkan pandangan Guru Besar Fakultas Ilmu Komputer Universitas
          Indonesia, Prof. Wisnu Jatmiko, mengenai mengapa tubuh ilmiah ini harus
          dilahirkan dan dipublikasikan ke dunia&hellip;&rdquo;
        </p>
        <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-ember drop-shadow-md">
          {step === 0
            ? "PENGANTAR — DIBACAKAN · [SPACE] NYALAKAN SEARCHLIGHT · [SHIFT+S] LEWATI"
            : "SEARCHLIGHT AKTIF · [SPACE] BUKA PANGGUNG · [SHIFT+S] LEWATI"}
        </p>
      </div>
    </div>
  );
}

export function ClosingQuote() {
  return (
    <div className="s1-closing absolute inset-0 z-[40] flex flex-col items-center justify-center px-[16vw] text-center opacity-0 pointer-events-none">
      <div className="backdrop-blur-[2px] bg-black/40 px-10 py-8 border border-white/5 shadow-2xl">
        <p className="max-w-[64vw] font-display italic text-[2.3vw] leading-snug text-paper/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          &ldquo;Gagasan ilmiah tidak akan pernah hidup tanpa sebuah tubuh
          tulisan yang baku.&rdquo;
        </p>
        <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-ember drop-shadow-md">
          PROF. WISNU JATMIKO — PARAFRASE · [SPACE] MENUJU ANATOMI
        </p>
      </div>
    </div>
  );
}
