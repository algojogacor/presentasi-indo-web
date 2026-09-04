"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { useIsoLayoutEffect } from "../../hooks";

interface VerdictCardsProps {
  active: boolean;
}

export default function VerdictCards({ active }: VerdictCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Efek dentum palu sidang (gavel thump) saat putusan saran dibuka
  useEffect(() => {
    if (active) {
      audio.thump();
    }
  }, [active]);

  useIsoLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (!active) {
      gsap.to(root, {
        autoAlpha: 0,
        y: 24,
        scale: 0.97,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
        pointerEvents: "none",
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      root,
      { autoAlpha: 0, y: 28, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, pointerEvents: "auto" },
    );

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.45 },
        0.1,
      );
    }

    if (card1Ref.current) {
      tl.fromTo(
        card1Ref.current,
        { autoAlpha: 0, y: 35, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.65 },
        0.2,
      );
    }

    if (card2Ref.current) {
      tl.fromTo(
        card2Ref.current,
        { autoAlpha: 0, y: 35, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.65 },
        0.38,
      );
    }

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col justify-center px-[8vw] select-none z-20"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      {/* Header Putusan Saran */}
      <div
        ref={headerRef}
        className="mb-[3vh] flex flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-edge/60 bg-surface/40 font-code text-[9.5px] tracking-[0.3em] text-[#E8A020] uppercase mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
          <span>SUB-BAB 3.2 · PRESKRIPSI & REKOMENDASI AKADEMIK</span>
        </div>
        <h2 className="font-display italic text-[clamp(1.8rem,2.7vw,3rem)] text-paper leading-tight">
          Putusan Akhir: Dua Rekomendasi Ilmiah
        </h2>
        <p className="mt-1 font-code text-[11px] tracking-[0.2em] text-mute/80 uppercase">
          Vonis strategis bagi subjek peneliti dan ekosistem keilmuan kampus
        </p>
      </div>

      {/* Grid Dua Kartu Rekomendasi Berdampingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.4vw] max-w-[84vw] mx-auto w-full">
        {/* Kartu 1 — Untuk Mahasiswa Peneliti */}
        <div
          ref={card1Ref}
          className="relative flex flex-col justify-between rounded-xl border border-[#E8A020]/40 bg-[#111118]/90 p-[2.6vh] px-[2.2vw] shadow-[0_0_35px_rgba(232,160,32,0.08)] backdrop-blur-md"
        >
          {/* Aksen Emas Sudut */}
          <div className="absolute top-0 left-0 h-8 w-[2px] bg-[#E8A020]" />
          <div className="absolute top-0 left-0 h-[2px] w-8 bg-[#E8A020]" />

          <div>
            <div className="flex items-center justify-between border-b border-edge pb-2 mb-3">
              <span className="font-code text-[9.5px] uppercase tracking-[0.25em] text-[#E8A020]">
                PRESKRIPSI I · PRAKTISI RISET
              </span>
              <span className="font-code text-[10px] text-mute/60 tracking-wider">
                AKTOR PENELITI
              </span>
            </div>

            <div className="flex items-start gap-4 my-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E8A020]/30 bg-[#E8A020]/10 text-[#E8A020]">
                {/* SVG Segitiga Emas Koherensi */}
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <polygon
                    points="12 3 2 21 22 21"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="14"
                    r="2.5"
                    fill="currentColor"
                    fillOpacity="0.25"
                  />
                  <line
                    x1="12"
                    y1="3"
                    x2="12"
                    y2="11.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>

              <div>
                <span className="font-code text-[10px] uppercase tracking-wider text-mute block">
                  SASARAN: MAHASISWA
                </span>
                <h3 className="font-display italic text-[clamp(1.25rem,1.75vw,1.85rem)] text-paper leading-snug mt-0.5">
                  &ldquo;Kawal Koherensi Segitiga Emas: Masalah, Pembahasan, dan Simpulan.&rdquo;
                </h3>
              </div>
            </div>

            <p className="font-body text-[clamp(0.9rem,1.1vw,1.15rem)] leading-relaxed text-paper/80 mt-2.5 pl-1 border-l-2 border-[#E8A020]/40">
              Mahasiswa wajib memastikan rumusan fenomena di Bab I terjawab tuntas pada analisis dialektika Bab IV, serta ditarik menjadi simpulan substantif di Bab V tanpa bias opini pribadi.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-edge/60 flex items-center justify-between font-code text-[9px] text-mute/70 tracking-wider">
            <span>PEDOMAN // SUB-BAB 3.2 BUTIR 1</span>
            <span className="text-[#E8A020]">KOHERENSI LOGIKA</span>
          </div>
        </div>

        {/* Kartu 2 — Untuk Institusi & Pengampu MKWU */}
        <div
          ref={card2Ref}
          className="relative flex flex-col justify-between rounded-xl border border-edge/90 bg-[#111118]/90 p-[2.6vh] px-[2.2vw] shadow-[0_0_35px_rgba(255,255,255,0.03)] backdrop-blur-md"
        >
          {/* Aksen Putih Sudut */}
          <div className="absolute top-0 right-0 h-8 w-[2px] bg-white/40" />
          <div className="absolute top-0 right-0 h-[2px] w-8 bg-white/40" />

          <div>
            <div className="flex items-center justify-between border-b border-edge pb-2 mb-3">
              <span className="font-code text-[9.5px] uppercase tracking-[0.25em] text-paper/80">
                PRESKRIPSI II · KURIKULUM AKADEMIK
              </span>
              <span className="font-code text-[10px] text-mute/60 tracking-wider">
                EKOSISTEM KAMPUS
              </span>
            </div>

            <div className="flex items-start gap-4 my-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-paper">
                {/* SVG Blueprint Pilar Institusi */}
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18" strokeDasharray="2 2" />
                  <path d="M9 3v18M15 3v18" strokeDasharray="2 2" />
                  <polygon
                    points="12 6 15 11 9 11"
                    fill="currentColor"
                    fillOpacity="0.25"
                  />
                </svg>
              </div>

              <div>
                <span className="font-code text-[10px] uppercase tracking-wider text-mute block">
                  SASARAN: INSTITUSI & MKWU
                </span>
                <h3 className="font-display italic text-[clamp(1.25rem,1.75vw,1.85rem)] text-paper leading-snug mt-0.5">
                  &ldquo;Perluas Praktikum Penulisan Jurnal IMRaD dan Proposal Riset Baku.&rdquo;
                </h3>
              </div>
            </div>

            <p className="font-body text-[clamp(0.9rem,1.1vw,1.15rem)] leading-relaxed text-paper/80 mt-2.5 pl-1 border-l-2 border-white/30">
              Pembelajaran MKWU Bahasa Indonesia di perguruan tinggi didorong memperbanyak porsi latihan praktis aplikatif dalam mengonstruksi artikel ilmiah jurnal bereputasi dan proposal PKM sesuai standar pedoman resmi.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-edge/60 flex items-center justify-between font-code text-[9px] text-mute/70 tracking-wider">
            <span>PEDOMAN // SUB-BAB 3.2 BUTIR 2</span>
            <span className="text-paper/90">STANDARISASI KURIKULUM</span>
          </div>
        </div>
      </div>

      {/* Navigasi Petunjuk Bawah */}
      <p className="mt-[3vh] text-center font-code text-[9.5px] tracking-[0.25em] text-mute/50">
        PUTUSAN AKADEMIK · TEKAN [SPACE] MENUJU PREMIS AKHIR
      </p>
    </div>
  );
}
