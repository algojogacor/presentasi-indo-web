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
      className="absolute inset-0 flex flex-col justify-start md:justify-center px-4 sm:px-[6vw] pt-14 md:pt-[6vh] pb-24 md:pb-[6vh] select-none z-20"
    >
      {/* Header Postliminaries */}
      <div className="mb-3.5 md:mb-[2.2vh] flex items-end justify-between border-b border-edge/80 pb-2.5 md:pb-[1.2vh]">
        <div>
          <div className="inline-flex items-center gap-2 font-code text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] text-[#E8A020] uppercase font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#E8A020] animate-pulse" />
            <span>BAGIAN AKHIR (POSTLIMINARIES) · SUB-BAB 2.2.3</span>
          </div>
          <h2 className="font-display italic font-semibold text-[clamp(1.8rem,2.8vw,3.2rem)] text-paper leading-tight mt-1">
            Daftar Pustaka & Rujukan Akademik
          </h2>
          <p className="font-code text-xs sm:text-sm text-mute/90 tracking-wide font-medium mt-0.5">
            Format Standar Baku APA Edisi Ke-7 · Landasan Teori, Metode & Etika Ilmiah
          </p>
        </div>

        <div className="text-right hidden sm:block font-code text-xs sm:text-sm text-mute tracking-wider">
          <span className="text-[#E8A020] font-bold">{REFERENCES.length} SUMBER</span> TERVERIFIKASI
        </div>
      </div>

      {/* Grid 2-Kolom Seluruh Referensi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[2.6vw] gap-y-[1.3vh] max-h-[66vh] overflow-y-auto pr-2">
        {REFERENCES.map((ref) => (
          <div
            key={ref.id}
            className="rounded-lg border border-white/10 bg-[#111118]/80 p-3 sm:p-3.5 px-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-code text-xs font-bold text-[#E8A020]">
                  [{String(ref.id).padStart(2, "0")}]
                </span>
                <span className="font-code text-xs uppercase tracking-wider text-mute/90 border border-white/15 px-2 py-0.5 rounded font-medium">
                  {ref.type}
                </span>
              </div>

              <p className="font-body text-xs sm:text-sm md:text-base leading-relaxed text-paper/90 pl-2.5 border-l-2 border-white/15">
                <span className="font-semibold text-paper">{ref.authors}</span>{" "}
                <span>({ref.year}).</span>{" "}
                <span className="font-display italic text-[#F0EDE8]">
                  {ref.title}.
                </span>{" "}
                <span className="text-mute/90">{ref.source}</span>
              </p>
            </div>

            {(ref.doi || ref.url) && (
              <a
                href={ref.doi || ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 pl-2.5 font-code text-xs sm:text-sm text-[#E8A020] hover:text-[#FFB740] hover:underline truncate flex items-center gap-1 transition-colors font-medium"
              >
                <span className="text-sm">↗</span>
                <span className="truncate">{ref.doi ?? ref.url}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Penutup Footer */}
      <div className="mt-[2vh] pt-[1.2vh] border-t border-edge/60 flex items-center justify-between font-code text-xs text-mute/80 tracking-widest font-medium">
        <span>STRUKTUR POSTLIMINARIES KARYA TULIS ILMIAH</span>
        <span>KELOMPOK 6 PDB 93 · UNIVERSITAS AIRLANGGA · 2026</span>
      </div>
    </div>
  );
}
