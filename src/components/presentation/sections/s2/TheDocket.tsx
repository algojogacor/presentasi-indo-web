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
      className="absolute inset-0 flex flex-col justify-start md:justify-center px-3 sm:px-[8vw] pt-14 md:pt-[7vh] pb-20 md:pb-[4vh] overflow-y-auto select-none"
    >
      {/* Header Dokumen Dakwaan */}
      <div className="mb-3.5 md:mb-[2.6vh] flex items-end justify-between border-b border-edge/60 pb-2.5 md:pb-[1.2vh]">
        <div>
          <span className="font-code text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.3em] text-[#E8A020] font-medium">
            SUB-BAB 1.2 & 1.3 · DOKUMEN DAKWAAN RISET
          </span>
          <h2 className="font-display italic font-semibold text-[clamp(1.8rem,2.8vw,3.2rem)] text-paper leading-tight mt-1">
            Empat Pertanyaan Fundamental
          </h2>
        </div>
        <div className="font-code text-xs tracking-widest text-mute/80 hidden sm:block">
          STATUS // {step >= 4 && step <= 7 ? `DAKWAAN 0${step - 3}/04` : "SELESAI"}
        </div>
      </div>

      {/* Stack Dimming 4 Rumusan Masalah */}
      <div className="flex flex-col gap-2.5 md:gap-[1.5vh]">
        {DOCKET_ITEMS.map((item, idx) => {
          const targetStep = 4 + idx;
          const isActive = step === targetStep;

          return (
            <div
              key={item.roman}
              ref={(el) => {
                itemsRef.current[idx] = el;
              }}
              className={`rounded-lg border p-3 sm:p-[1.6vh] px-3.5 sm:px-[2vw] transition-colors duration-500 ${
                isActive
                  ? "border-[#E8A020]/70 bg-[#111118]/95 shadow-[0_0_35px_rgba(232,160,32,0.15)]"
                  : "border-white/5 bg-transparent"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-[1.8vw]">
                {/* Lencana Romawi */}
                <div
                  className={`mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded border font-code text-sm md:text-base font-bold tracking-wider transition-colors duration-500 ${
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
                      className={`font-code text-xs md:text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                        isActive ? "text-[#E8A020]" : "text-mute/70"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-code text-xs tracking-wider transition-colors ${
                        isActive
                          ? "rounded bg-[#E8A020]/15 px-2.5 py-0.5 text-[#FFB740] font-semibold"
                          : "text-mute/50"
                      }`}
                    >
                      {item.roadmap}
                    </span>
                  </div>

                  <p
                    className={`font-display italic font-medium text-[clamp(1.35rem,2.1vw,2.3rem)] leading-snug mt-1 transition-colors duration-500 ${
                      isActive ? "text-[#F0EDE8]" : "text-paper/60"
                    }`}
                  >
                    &ldquo;{item.question}&rdquo;
                  </p>

                  {/* Mandat Tujuan Penulisan */}
                  <div
                    className={`mt-[0.8vh] border-l-2 pl-3 font-code text-xs md:text-sm leading-relaxed transition-colors duration-500 ${
                      isActive
                        ? "border-[#E8A020] text-paper/90"
                        : "border-mute/30 text-mute/50"
                    }`}
                  >
                    <span className="font-semibold text-[#E8A020] mr-2">
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
        className="mt-[1.8vh] rounded-lg border border-edge/80 bg-[#0E0E14]/95 p-[1.4vh] px-[2vw] opacity-0 shadow-lg"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#E8A020] animate-pulse" />
          <span className="font-code text-xs uppercase tracking-[0.25em] text-[#E8A020] font-medium">
            {MANFAAT_DATA.label}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[3.5vw] gap-y-2 text-left">
          <div className="border-l border-white/10 pl-3">
            <span className="font-code text-xs text-mute/90 uppercase tracking-wider font-semibold block mb-0.5">
              {MANFAAT_DATA.teoritis.title}
            </span>
            <p className="font-body text-xs md:text-sm leading-relaxed text-paper/85">
              {MANFAAT_DATA.teoritis.desc}
            </p>
          </div>
          <div className="border-l border-white/10 pl-3">
            <span className="font-code text-xs text-mute/90 uppercase tracking-wider font-semibold block mb-0.5">
              {MANFAAT_DATA.praktis.title}
            </span>
            <p className="font-body text-xs md:text-sm leading-relaxed text-paper/85">
              {MANFAAT_DATA.praktis.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
