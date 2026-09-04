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
        className="relative h-[min(62vh,64vw)] border border-edge bg-[#0C0C13] opacity-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        style={{ aspectRatio: "1 / 1.414" }}
      >
        {/* Tanda pojok bidang rontgen */}
        {["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"].map(
          (pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute ${pos} font-code text-[10px] text-ember/50 select-none`}
            >
              +
            </span>
          ),
        )}

        {/* Header Metadata Kalibrasi Spesimen */}
        <div className="absolute top-2 inset-x-3 flex items-center justify-between border-b border-white/5 pb-1 select-none">
          <span className="font-code text-[7.5px] tracking-[0.25em] text-mute">
            DOKUMEN · KTI — RONTGEN STRUKTURAL
          </span>
          <span className="font-code text-[7px] tracking-wider text-ember/70">
            A4 · 210×297MM · 1:√2
          </span>
        </div>

        <div className="scanline" aria-hidden />

        <div className="absolute inset-x-3 top-8 bottom-3 flex flex-col gap-[4px]">
          {/* --- ZONE 1: PRELIMINARIES --- */}
          <div
            data-part="1"
            className="zone relative flex h-[21%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
          >
            <div className="flex items-center justify-between">
              <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                PRELIMINARIES
              </span>
              <span className="font-code text-[6.5px] text-mute/50 tracking-wider">
                MARGIN 4-4-3-3 CM
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[5px] pt-1">
              <div className="z-line h-[7px] w-[58%] self-center bg-ember/55" />
              <div className="z-line h-[3px] w-[28%] self-center bg-white/16" />
              <div className="z-line h-[3px] w-[72%] self-center bg-white/16" />
              <div className="z-block flex flex-col gap-[3px] border border-white/14 p-1">
                <div className="z-line h-[2px] w-[88%] bg-white/16" />
                <div className="z-line h-[2px] w-[94%] bg-white/16" />
                <div className="z-line h-[2px] w-[62%] bg-white/16" />
                <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                  ABSTRAK & KATA KUNCI
                </span>
              </div>
              <div className="flex flex-col gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="z-line h-[2px] flex-1 bg-white/16" />
                    <div className="z-line h-[2px] w-[7px] bg-white/28" />
                  </div>
                ))}
                <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                  DAFTAR ISI & TABEL
                </span>
              </div>
            </div>
          </div>

          {/* --- ZONE 2: BODY TEXT (DENGAN TULANG PUNGGUNG KOHERENSI) --- */}
          <div
            data-part="2"
            className="zone relative flex h-[55%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
          >
            <div className="flex items-center justify-between">
              <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                BODY TEXT
              </span>
              <span className="font-code text-[6.5px] text-ember/60 tracking-wider">
                RONGGA ARGUMEN UTAMA
              </span>
            </div>

            {/* Tulang Punggung Koherensi Riset (Spine of Coherence) */}
            <div className="flex flex-1 gap-1.5 pt-1">
              {/* Garis Konektor Tulang Punggung Vertikal */}
              <div className="relative w-[3px] shrink-0 flex flex-col items-center justify-around py-1">
                <div className="absolute inset-y-1 w-[1px] bg-white/12" />
                {ROMAN.map((r, i) => (
                  <div
                    key={`dot-${r}`}
                    className={`relative z-10 h-1.5 w-1.5 rounded-full border transition-colors ${
                      i === 0 || i === 2 || i === 3 || i === 4
                        ? "border-ember/60 bg-ember/30"
                        : "border-white/20 bg-black"
                    }`}
                    title={`Vertebra Bab ${r}`}
                  />
                ))}
              </div>

              {/* 5 Segmen Bab */}
              <div className="flex flex-1 flex-col gap-[3px]">
                {ROMAN.map((r, i) => (
                  <div
                    key={r}
                    data-bab={i}
                    className="bab relative flex flex-1 flex-col justify-center rounded-[2px] border border-white/5 px-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="bab-num font-code text-[7px] text-mute">
                        {r}
                      </span>
                      <div
                        className="bab-bar h-[3px] bg-white/16"
                        style={{ width: `${78 - i * 6}%` }}
                      />
                    </div>
                    <span className="bab-title absolute right-2 top-0.5 font-code text-[7px] tracking-[0.16em] text-paper/70 opacity-0">
                      BAB {r} — {["PENDAHULUAN", "TINJAUAN PUSTAKA", "METODE", "HASIL & PEMBAHASAN", "SIMPULAN & SARAN"][i]}
                    </span>
                    <div className="bab-sub hidden flex-col gap-[2px] overflow-hidden pt-[3px] opacity-0">
                      <div className="h-[2px] w-[92%] bg-white/22" />
                      <div className="h-[2px] w-[86%] bg-white/22" />
                      <div className="h-[2px] w-[90%] bg-white/22" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ZONE 3: POSTLIMINARIES --- */}
          <div
            data-part="3"
            className="zone relative flex h-[24%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
          >
            <div className="flex items-center justify-between">
              <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                POSTLIMINARIES
              </span>
              <span className="font-code text-[6.5px] text-mute/50 tracking-wider">
                BUKTI JEJAK & INTEGRITAS
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[5px] pt-1">
              <div className="flex flex-col gap-[3px] pl-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="z-line h-[2px] bg-white/16" style={{ width: `${88 - i * 8}%` }} />
                ))}
                <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                  DAFTAR PUSTAKA (APA 7TH)
                </span>
              </div>
              <div className="flex items-center gap-2 pl-1.5">
                <div className="z-line h-[10px] w-[10px] border border-white/20" />
                <div className="z-line h-[10px] w-[10px] border border-white/20" />
                <div className="z-line h-[3px] w-[40%] bg-white/16" />
                <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                  LAMPIRAN RESMI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 font-code text-[9px] tracking-[0.25em] text-mute">
        <span>SPECIMEN 01 — KTI/AKADEMIK</span>
        <span className="text-white/20">·</span>
        <span>PDB 93 UNAIR</span>
      </div>
    </div>
  );
}
