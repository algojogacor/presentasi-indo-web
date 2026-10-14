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
      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-[10vw] text-center pointer-events-none">
        <p className="s1-quote max-w-[92vw] md:max-w-[72vw] font-display italic text-[clamp(1.4rem,2.4vw,2.6rem)] leading-snug text-paper transition-opacity">
          &ldquo;Sebelum kita membedah anatomi teks di atas meja operasi, mari
          kita dengarkan pandangan Guru Besar Fakultas Ilmu Komputer Universitas
          Indonesia, Prof. Wisnu Jatmiko, mengenai mengapa tubuh ilmiah ini harus
          dilahirkan dan dipublikasikan ke dunia&hellip;&rdquo;
        </p>
      </div>
    </div>
  );
}

export function ClosingQuote() {
  return (
    <div className="s1-closing absolute inset-0 z-[40] flex flex-col items-center justify-center px-4 md:px-[12vw] text-center opacity-0 pointer-events-none">
      <div className="backdrop-blur-[2px] bg-black/40 px-6 sm:px-12 py-7 sm:py-10 border border-white/5 shadow-2xl max-w-[94vw] md:max-w-none">
        <p className="max-w-[92vw] md:max-w-[72vw] font-display italic text-[clamp(1.5rem,2.6vw,2.9rem)] leading-snug text-paper/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          &ldquo;Memahami struktur sebuah karya ilmiah tidak hanya berkaitan
          dengan cara menulisnya secara teknis, tetapi sangat penting dalam
          membentuk argumen dan menyampaikan informasi ilmiah dengan baik dan
          benar.&rdquo;
        </p>
        <p className="mt-4 sm:mt-5 font-code text-xs sm:text-sm md:text-base tracking-[0.25em] sm:tracking-[0.3em] text-ember drop-shadow-md uppercase font-semibold">
          — MAKALAH KELOMPOK 6 PDB 93 (SUB-BAB 1.1)
        </p>
      </div>
    </div>
  );
}
