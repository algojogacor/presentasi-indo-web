import type { RefObject } from "react";
import { ROMAN } from "@/data/anatomy";

interface DocumentSheetProps {
  sheetRef: RefObject<HTMLDivElement | null>;
}

export default function DocumentSheet({ sheetRef }: DocumentSheetProps) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={sheetRef}
        className="relative h-[min(46vh,54vw)] sm:h-[min(58vh,58vw)] md:h-[min(70vh,44vw)] lg:h-[min(74vh,38vw)] xl:h-[min(76vh,36vw)] border border-white/20 bg-[#090910] opacity-0 shadow-[0_0_50px_rgba(232,160,32,0.1),0_20px_50px_rgba(0,0,0,0.95)] shrink-0"
        style={{ aspectRatio: "1 / 1.414" }}
      >
        {/* Tanda pojok bidang rontgen (crosshair kalibrasi) */}
        {["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"].map(
          (pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute ${pos} font-code text-xs text-ember/80 font-bold select-none`}
            >
              +
            </span>
          ),
        )}

        {/* Header Metadata Kalibrasi Spesimen */}
        <div className="absolute top-2.5 inset-x-3.5 sm:inset-x-4 flex items-center justify-between border-b border-white/10 pb-1.5 select-none">
          <span className="font-code text-[8.5px] sm:text-[9.5px] tracking-[0.25em] text-mute/90 font-medium">
            DOKUMEN · KTI — RONTGEN STRUKTURAL
          </span>
          <span className="font-code text-[8px] sm:text-[9px] tracking-wider text-ember/85 font-semibold">
            A4 · 210×297MM · 1:√2
          </span>
        </div>

        <div className="scanline" aria-hidden />

        <div className="absolute inset-x-3 sm:inset-x-3.5 top-9 sm:top-10 bottom-3 sm:bottom-3.5 flex flex-col gap-1.5">
          {/* --- ZONE 1: PRELIMINARIES --- */}
          <div
            data-part="1"
            className="zone relative flex h-[21%] flex-col rounded-[2px] border border-edge px-2 opacity-35"
          >
            <div className="flex items-center justify-between pt-0.5">
              <span className="z-label font-code text-[9px] sm:text-[10px] tracking-[0.28em] text-mute font-semibold">
                PRELIMINARIES
              </span>
              <span className="font-code text-[7.5px] sm:text-[8.5px] text-mute/70 tracking-wider">
                MARGIN 4-4-3-3 CM
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[5px] pt-1">
              <div className="z-line h-[8px] w-[58%] self-center bg-ember/65 rounded-full" />
              <div className="z-line h-[3px] w-[28%] self-center bg-white/22 rounded-full" />
              <div className="z-line h-[3px] w-[72%] self-center bg-white/22 rounded-full" />
              <div className="z-block flex flex-col gap-[3px] border border-white/20 bg-white/[0.02] p-1 sm:p-1.5 rounded-[1px]">
                <div className="z-line h-[2.5px] w-[88%] bg-white/25 rounded-full" />
                <div className="z-line h-[2.5px] w-[94%] bg-white/25 rounded-full" />
                <div className="z-line h-[2.5px] w-[62%] bg-white/25 rounded-full" />
                <span className="z-tag font-code text-[8px] sm:text-[9px] tracking-[0.2em] text-ember font-bold opacity-0 pt-0.5">
                  ABSTRAK & KATA KUNCI
                </span>
              </div>
              <div className="flex flex-col gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="z-line h-[2.5px] flex-1 bg-white/22 rounded-full" />
                    <div className="z-line h-[2.5px] w-[8px] bg-white/35 rounded-full" />
                  </div>
                ))}
                <span className="z-tag font-code text-[8px] sm:text-[9px] tracking-[0.2em] text-ember font-bold opacity-0 pt-0.5">
                  DAFTAR ISI & TABEL
                </span>
              </div>
            </div>
          </div>

          {/* --- ZONE 2: BODY TEXT (DENGAN TULANG PUNGGUNG KOHERENSI) --- */}
          <div
            data-part="2"
            className="zone relative flex h-[55%] flex-col rounded-[2px] border border-edge px-2 opacity-35"
          >
            <div className="flex items-center justify-between pt-0.5">
              <span className="z-label font-code text-[9px] sm:text-[10px] tracking-[0.28em] text-mute font-semibold">
                BODY TEXT
              </span>
              <span className="font-code text-[7.5px] sm:text-[8.5px] text-ember/85 tracking-wider font-medium">
                RONGGA ARGUMEN UTAMA
              </span>
            </div>

            {/* Tulang Punggung Koherensi Riset (Spine of Coherence) */}
            <div className="flex flex-1 gap-2 pt-1">
              {/* Garis Konektor Tulang Punggung Vertikal */}
              <div className="relative w-[3.5px] shrink-0 flex flex-col items-center justify-around py-1">
                <div className="absolute inset-y-1 w-[1.5px] bg-white/20" />
                {ROMAN.map((r, i) => (
                  <div
                    key={`dot-${r}`}
                    className={`relative z-10 h-2 w-2 rounded-full border transition-colors ${
                      i === 0 || i === 2 || i === 3 || i === 4
                        ? "border-ember/70 bg-ember/40 shadow-[0_0_6px_rgba(232,160,32,0.5)]"
                        : "border-white/30 bg-black"
                    }`}
                    title={`Vertebra Bab ${r}`}
                  />
                ))}
              </div>

              {/* 5 Segmen Bab */}
              <div className="flex flex-1 flex-col gap-1">
                {ROMAN.map((r, i) => (
                  <div
                    key={r}
                    data-bab={i}
                    className="bab relative flex flex-1 flex-col justify-center rounded-[2px] border border-white/8 px-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bab-num font-code text-[8px] sm:text-[9px] font-semibold text-mute">
                        {r}
                      </span>
                      <div
                        className="bab-bar h-[3.5px] bg-white/24 rounded-full"
                        style={{ width: `${78 - i * 6}%` }}
                      />
                    </div>
                    <span className="bab-title absolute right-2.5 top-0.5 sm:top-1 font-code text-[8px] sm:text-[9px] tracking-[0.16em] text-paper/85 font-medium opacity-0">
                      BAB {r} — {["PENDAHULUAN", "TINJAUAN PUSTAKA", "METODE", "HASIL & PEMBAHASAN", "SIMPULAN & SARAN"][i]}
                    </span>
                    <div className="bab-sub hidden flex-col gap-[2.5px] overflow-hidden pt-1 opacity-0">
                      <div className="h-[2.5px] w-[92%] bg-white/30 rounded-full" />
                      <div className="h-[2.5px] w-[86%] bg-white/30 rounded-full" />
                      <div className="h-[2.5px] w-[90%] bg-white/30 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ZONE 3: POSTLIMINARIES --- */}
          <div
            data-part="3"
            className="zone relative flex h-[24%] flex-col rounded-[2px] border border-edge px-2 opacity-35"
          >
            <div className="flex items-center justify-between pt-0.5">
              <span className="z-label font-code text-[9px] sm:text-[10px] tracking-[0.28em] text-mute font-semibold">
                POSTLIMINARIES
              </span>
              <span className="font-code text-[7.5px] sm:text-[8.5px] text-mute/70 tracking-wider">
                BUKTI JEJAK & INTEGRITAS
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[5px] pt-1">
              <div className="flex flex-col gap-[3px] pl-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="z-line h-[2.5px] bg-white/22 rounded-full" style={{ width: `${88 - i * 8}%` }} />
                ))}
                <span className="z-tag font-code text-[8px] sm:text-[9px] tracking-[0.2em] text-ember font-bold opacity-0 pt-0.5">
                  DAFTAR PUSTAKA (APA 7TH)
                </span>
              </div>
              <div className="flex items-center gap-2 pl-1.5">
                <div className="z-line h-[10px] w-[10px] border border-white/25 rounded-[1px]" />
                <div className="z-line h-[10px] w-[10px] border border-white/25 rounded-[1px]" />
                <div className="z-line h-[3px] w-[40%] bg-white/22 rounded-full" />
                <span className="z-tag font-code text-[8px] sm:text-[9px] tracking-[0.2em] text-ember font-bold opacity-0 pt-0.5">
                  LAMPIRAN RESMI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5 sm:gap-3 font-code text-[11px] sm:text-xs tracking-[0.25em] text-mute/85 font-medium select-none">
        <span>SPECIMEN 01 — KTI/AKADEMIK</span>
        <span className="text-white/20">·</span>
        <span>PDB 93 UNAIR</span>
      </div>
    </div>
  );
}
