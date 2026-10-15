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
        className="relative h-[min(52vh,85vw)] sm:h-[min(65vh,70vw)] md:h-[80vh] lg:h-[82vh] xl:h-[84vh] border border-white/20 bg-[#090910] opacity-0 shadow-[0_0_60px_rgba(232,160,32,0.12),0_25px_60px_rgba(0,0,0,0.95)] shrink-0"
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
        <div className="absolute top-2 sm:top-2.5 inset-x-3 sm:inset-x-4 flex items-center justify-between border-b border-white/10 pb-1 select-none">
          <span className="font-code text-[8.5px] sm:text-[9.5px] tracking-[0.25em] text-mute/90 font-medium">
            DOKUMEN · KTI — RONTGEN STRUKTURAL
          </span>
          <span className="font-code text-[8px] sm:text-[9px] tracking-wider text-ember/85 font-semibold">
            A4 · 210×297MM · 1:√2
          </span>
        </div>

        <div className="scanline" aria-hidden />

        <div className="absolute inset-x-3 sm:inset-x-3.5 top-8 sm:top-9 bottom-2.5 sm:bottom-3 flex flex-col gap-1.5 sm:gap-2">
          {/* --- ZONE 1: PRELIMINARIES --- */}
          <div
            data-part="1"
            className="zone relative flex h-[28%] flex-col justify-between rounded-[2px] border border-edge p-2 sm:p-2.5 opacity-35 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/5 shrink-0">
              <span className="z-label font-code text-[8.5px] sm:text-[9.5px] tracking-[0.25em] text-mute font-semibold">
                PRELIMINARIES
              </span>
              <span className="font-code text-[7px] sm:text-[8px] text-mute/70 tracking-wider">
                MARGIN 4-4-3-3 CM
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between pt-1 overflow-hidden">
              {/* Header bars: Judul KTI & Penulis */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="z-line h-[5px] sm:h-[6px] w-[62%] bg-ember/65 rounded-full" />
                <div className="z-line h-[2px] sm:h-[2.5px] w-[32%] bg-white/22 rounded-full" />
              </div>

              {/* Box Abstrak & Kata Kunci */}
              <div className="z-block flex flex-col gap-1 border border-white/15 bg-white/[0.02] p-1.5 rounded-[1px] shrink-0">
                <div className="flex items-center justify-between">
                  <span className="z-tag font-code text-[7.5px] sm:text-[8px] tracking-[0.18em] text-ember font-bold opacity-0">
                    ABSTRAK & KATA KUNCI
                  </span>
                  <div className="z-line h-[1.5px] w-8 bg-white/18 rounded-full" />
                </div>
                <div className="z-line h-[2px] w-[94%] bg-white/20 rounded-full" />
                <div className="z-line h-[2px] w-[82%] bg-white/20 rounded-full" />
              </div>

              {/* Daftar Isi & Tabel */}
              <div className="flex flex-col gap-1 shrink-0 pb-0.5">
                <div className="flex items-center justify-between">
                  <span className="z-tag font-code text-[7.5px] sm:text-[8px] tracking-[0.18em] text-ember font-bold opacity-0">
                    DAFTAR ISI & TABEL
                  </span>
                  <div className="z-line h-[1.5px] w-6 bg-white/18 rounded-full" />
                </div>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="z-line h-[1.5px] flex-1 bg-white/20 rounded-full" />
                    <div className="z-line h-[1.5px] w-3 bg-white/35 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ZONE 2: BODY TEXT (DENGAN TULANG PUNGGUNG KOHERENSI) --- */}
          <div
            data-part="2"
            className="zone relative flex h-[48%] flex-col rounded-[2px] border border-edge px-2 py-1.5 opacity-35 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/5 shrink-0">
              <span className="z-label font-code text-[8.5px] sm:text-[9.5px] tracking-[0.25em] text-mute font-semibold">
                BODY TEXT
              </span>
              <span className="font-code text-[7px] sm:text-[8px] text-ember/85 tracking-wider font-medium">
                RONGGA ARGUMEN UTAMA
              </span>
            </div>

            {/* Tulang Punggung Koherensi Riset (Spine of Coherence) */}
            <div className="flex flex-1 gap-2 pt-1 overflow-hidden">
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
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                {ROMAN.map((r, i) => (
                  <div
                    key={r}
                    data-bab={i}
                    className="bab relative flex flex-1 flex-col justify-center rounded-[2px] border border-white/8 px-2 overflow-hidden"
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
                    <div className="bab-sub hidden flex-col gap-[2px] overflow-hidden pt-1 opacity-0">
                      <div className="h-[2px] w-[92%] bg-white/30 rounded-full" />
                      <div className="h-[2px] w-[86%] bg-white/30 rounded-full" />
                      <div className="h-[2px] w-[90%] bg-white/30 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ZONE 3: POSTLIMINARIES --- */}
          <div
            data-part="3"
            className="zone relative flex h-[24%] flex-col justify-between rounded-[2px] border border-edge p-2 sm:p-2.5 opacity-35 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/5 shrink-0">
              <span className="z-label font-code text-[8.5px] sm:text-[9.5px] tracking-[0.25em] text-mute font-semibold">
                POSTLIMINARIES
              </span>
              <span className="font-code text-[7px] sm:text-[8px] text-mute/70 tracking-wider">
                BUKTI JEJAK & INTEGRITAS
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-around pt-1 overflow-hidden">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="z-tag font-code text-[7.5px] sm:text-[8px] tracking-[0.18em] text-ember font-bold opacity-0">
                    DAFTAR PUSTAKA (APA 7TH)
                  </span>
                  <div className="z-line h-[1.5px] w-6 bg-white/18 rounded-full" />
                </div>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="z-line h-[2px] bg-white/20 rounded-full" style={{ width: `${88 - i * 8}%` }} />
                ))}
              </div>
              <div className="flex items-center gap-2.5 pt-0.5">
                <div className="z-line h-[12px] w-[12px] border border-white/25 rounded-[1px] shrink-0" />
                <div className="z-line h-[12px] w-[12px] border border-white/25 rounded-[1px] shrink-0" />
                <span className="z-tag font-code text-[7.5px] sm:text-[8px] tracking-[0.18em] text-ember font-bold opacity-0">
                  LAMPIRAN RESMI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2.5 font-code text-[11px] sm:text-xs tracking-[0.25em] text-mute/85 font-medium select-none">
        <span>SPECIMEN 01 — KTI/AKADEMIK</span>
        <span className="text-white/20">·</span>
        <span>PDB 93 UNAIR</span>
      </div>
    </div>
  );
}
