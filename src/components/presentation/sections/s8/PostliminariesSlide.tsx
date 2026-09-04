"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "../../hooks";
import { REFERENCES } from "@/data/bibliography";

interface PostliminariesSlideProps {
  active: boolean;
}

export default function PostliminariesSlide({
  active,
}: PostliminariesSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (active) {
      gsap.fromTo(
        root,
        { autoAlpha: 0, y: 25, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
      );
    } else {
      gsap.to(root, { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in" });
    }
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-center px-[6vw] py-[6vh] select-none z-20"
    >
      {/* Header Postliminaries */}
      <div className="mb-[2vh] flex items-end justify-between border-b border-edge/80 pb-[1.2vh]">
        <div>
          <div className="inline-flex items-center gap-2 font-code text-[10px] tracking-[0.3em] text-[#E8A020] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
            <span>BAGIAN AKHIR (POSTLIMINARIES) · SUB-BAB 2.2.3</span>
          </div>
          <h2 className="font-display italic text-[clamp(1.7rem,2.5vw,2.8rem)] text-paper leading-tight mt-0.5">
            Daftar Pustaka & Rujukan Akademik
          </h2>
          <p className="font-code text-[10px] text-mute/80 tracking-wider">
            Format Standar Baku APA Edisi Ke-7 · Landasan Teori, Metode & Etika Ilmiah
          </p>
        </div>

        <div className="text-right hidden sm:block font-code text-[10px] text-mute tracking-wider">
          <span className="text-[#E8A020] font-bold">13 SUMBER</span> TERVERIFIKASI
        </div>
      </div>

      {/* Grid 2-Kolom Seluruh Referensi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2.5vw] gap-y-[1.1vh] max-h-[66vh] overflow-y-auto pr-2">
        {REFERENCES.map((ref) => (
          <div
            key={ref.id}
            className="rounded border border-white/10 bg-[#111118]/70 p-2.5 px-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-code text-[9px] font-bold text-[#E8A020]">
                  [{String(ref.id).padStart(2, "0")}]
                </span>
                <span className="font-code text-[8px] uppercase tracking-wider text-mute border border-white/10 px-1.5 py-0.2 rounded">
                  {ref.type}
                </span>
              </div>

              <p className="font-body text-[11px] md:text-[11.5px] leading-snug text-paper/85 pl-2 border-l border-white/10">
                <span className="font-semibold text-paper">{ref.authors}</span>{" "}
                <span>({ref.year}).</span>{" "}
                <span className="font-display italic text-[#F0EDE8]">
                  {ref.title}.
                </span>{" "}
                <span className="text-mute/80">{ref.source}</span>
              </p>
            </div>

            {(ref.doi || ref.url) && (
              <a
                href={ref.doi || ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 pl-2 font-code text-[9.5px] text-[#E8A020]/80 hover:text-[#FFB740] hover:underline truncate flex items-center gap-1 transition-colors"
              >
                <span className="text-[10px]">↗</span>
                <span className="truncate">{ref.doi ?? ref.url}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Penutup Footer */}
      <div className="mt-[1.8vh] pt-[1vh] border-t border-edge/60 flex items-center justify-between font-code text-[9.5px] text-mute/60 tracking-widest">
        <span>STRUKTUR POSTLIMINARIES KARYA TULIS ILMIAH</span>
        <span>KELOMPOK 6 PDB 93 · UNIVERSITAS AIRLANGGA · 2026</span>
      </div>
    </div>
  );
}
