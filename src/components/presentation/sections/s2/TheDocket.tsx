"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { useIsoLayoutEffect } from "../../hooks";
import { DOCKET_ITEMS, MANFAAT_DATA } from "./docketData";

interface TheDocketProps {
  step: number;
}

export default function TheDocket({ step }: TheDocketProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const manfaatRef = useRef<HTMLDivElement>(null);
  const lastStepRef = useRef<number>(step);

  // Efek audio tactile saat beralih antar dakwaan (Step 4–7)
  useEffect(() => {
    if (step >= 4 && step <= 7 && step !== lastStepRef.current) {
      audio.thump();
    }
    lastStepRef.current = step;
  }, [step]);

  // Animasi transisi Stack Dimming per item
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (step < 4) {
      gsap.to(root, {
        autoAlpha: 0,
        y: 35,
        duration: 0.45,
        ease: "power2.inOut",
        pointerEvents: "none",
      });
      return;
    }

    gsap.to(root, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      pointerEvents: "auto",
    });

    DOCKET_ITEMS.forEach((_, idx) => {
      const el = itemsRef.current[idx];
      if (!el) return;

      const targetStep = 4 + idx;
      const isRevealed = step >= targetStep;
      const isActive = step === targetStep;

      if (!isRevealed) {
        gsap.to(el, {
          autoAlpha: 0,
          y: 24,
          duration: 0.4,
          ease: "power2.out",
        });
      } else if (isActive) {
        // Item aktif: terang, bersinar, skala penuh
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        });
      } else {
        // Item lampau (Option A Stack Dimming): meredup ke opacity 0.24
        gsap.to(el, {
          autoAlpha: 0.24,
          y: 0,
          scale: 0.985,
          duration: 0.5,
          ease: "power2.inOut",
        });
      }
    });

    // Sub-bab 1.4 Manfaat Penulisan (hanya saat Step 7)
    const mEl = manfaatRef.current;
    if (mEl) {
      if (step === 7) {
        gsap.fromTo(
          mEl,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power2.out" },
        );
      } else {
        gsap.to(mEl, { autoAlpha: 0, y: 12, duration: 0.35 });
      }
    }
  }, [step]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 flex flex-col justify-center px-[8vw] pt-[7vh] pb-[4vh] select-none"
    >
      {/* Header Dokumen Dakwaan */}
      <div className="mb-[2.2vh] flex items-end justify-between border-b border-edge/60 pb-[1vh]">
        <div>
          <span className="font-code text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#E8A020]">
            SUB-BAB 1.2 & 1.3 · DOKUMEN DAKWAAN RISET
          </span>
          <h2 className="font-display italic text-[clamp(1.6rem,2.4vw,2.6rem)] text-paper leading-tight mt-0.5">
            Empat Pertanyaan Fundamental
          </h2>
        </div>
        <div className="font-code text-[10px] tracking-widest text-mute hidden sm:block">
          STATUS // {step >= 4 && step <= 7 ? `DAKWAAN 0${step - 3}/04` : "SELESAI"}
        </div>
      </div>

      {/* Stack Dimming 4 Rumusan Masalah */}
      <div className="flex flex-col gap-[1.2vh]">
        {DOCKET_ITEMS.map((item, idx) => {
          const targetStep = 4 + idx;
          const isActive = step === targetStep;

          return (
            <div
              key={item.roman}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
              className={`rounded-lg border p-[1.4vh] px-[1.8vw] transition-colors duration-500 ${
                isActive
                  ? "border-[#E8A020]/60 bg-[#111118]/90 shadow-[0_0_30px_rgba(232,160,32,0.12)]"
                  : "border-white/5 bg-transparent"
              }`}
            >
              <div className="flex items-start gap-[1.6vw]">
                {/* Lencana Romawi */}
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border font-code text-xs font-semibold tracking-wider transition-colors duration-500 ${
                    isActive
                      ? "border-[#E8A020] bg-[#E8A020]/15 text-[#E8A020]"
                      : "border-mute/30 bg-transparent text-mute"
                  }`}
                >
                  {item.roman}
                </div>

                {/* Konten Pertanyaan & Mandat */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span
                      className={`font-code text-[9px] uppercase tracking-[0.25em] transition-colors ${
                        isActive ? "text-[#E8A020]/90" : "text-mute/60"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-code text-[9px] tracking-wider transition-colors ${
                        isActive
                          ? "rounded bg-[#E8A020]/15 px-2 py-0.5 text-[#FFB740]"
                          : "text-mute/50"
                      }`}
                    >
                      {item.roadmap}
                    </span>
                  </div>

                  <p
                    className={`font-display italic text-[clamp(1.1rem,1.65vw,1.75rem)] leading-snug mt-0.5 transition-colors duration-500 ${
                      isActive ? "text-[#F0EDE8]" : "text-paper/60"
                    }`}
                  >
                    &ldquo;{item.question}&rdquo;
                  </p>

                  {/* Mandat Tujuan Penulisan */}
                  <div
                    className={`mt-[0.6vh] border-l-2 pl-3 font-code text-[10px] md:text-[11px] leading-relaxed transition-colors duration-500 ${
                      isActive
                        ? "border-[#E8A020] text-paper/85"
                        : "border-mute/30 text-mute/50"
                    }`}
                  >
                    <span className="font-semibold text-[#E8A020]/80 mr-1.5">
                      TARGET MANDAT:
                    </span>
                    {item.mandat}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sintesis Sub-bab 1.4 Manfaat Penulisan (Muncul di Step 7) */}
      <div
        ref={manfaatRef}
        className="mt-[1.6vh] rounded border border-edge/80 bg-[#0E0E14]/90 p-[1.2vh] px-[1.8vw] opacity-0"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-pulse" />
          <span className="font-code text-[9px] uppercase tracking-[0.25em] text-[#E8A020]">
            {MANFAAT_DATA.label}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[3vw] gap-y-1 text-left">
          <div className="border-l border-white/10 pl-2.5">
            <span className="font-code text-[9px] text-mute uppercase tracking-wider block">
              {MANFAAT_DATA.teoritis.title}
            </span>
            <p className="font-body text-[11px] leading-snug text-paper/80">
              {MANFAAT_DATA.teoritis.desc}
            </p>
          </div>
          <div className="border-l border-white/10 pl-2.5">
            <span className="font-code text-[9px] text-mute uppercase tracking-wider block">
              {MANFAAT_DATA.praktis.title}
            </span>
            <p className="font-body text-[11px] leading-snug text-paper/80">
              {MANFAAT_DATA.praktis.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
