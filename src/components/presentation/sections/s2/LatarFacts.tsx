"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStepReveal, useIsoLayoutEffect } from "../../hooks";
import { STATEMENT, FACTS } from "./docketData";

interface LatarFactsProps {
  step: number;
}

export default function LatarFacts({ step }: LatarFactsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  useStepReveal(containerRef, step);

  // Responsivitas posisi pernyataan saat fakta muncul
  useIsoLayoutEffect(() => {
    const el = statementRef.current;
    if (!el) return;

    if (step >= 1 && step < 4) {
      gsap.to(el, {
        y: "-14vh",
        scale: 0.82,
        autoAlpha: 0.6,
        duration: 0.7,
        ease: "power3.inOut",
      });
    } else if (step === 0) {
      gsap.to(el, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power2.out",
      });
    }
  }, [step]);

  // Transisi keluar saat berpindah ke The Docket (step >= 4)
  useIsoLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (step >= 4) {
      gsap.to(root, {
        autoAlpha: 0,
        y: -25,
        duration: 0.5,
        ease: "power2.inOut",
        pointerEvents: "none",
      });
    } else {
      gsap.to(root, {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        pointerEvents: "auto",
      });
    }
  }, [step]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Pernyataan besar */}
      <div
        ref={statementRef}
        data-step="0"
        className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-[68vw] pointer-events-none"
      >
        <p className="s2-statement font-display italic text-[clamp(1.6rem,2.7vw,2.9rem)] leading-[1.3] text-paper">
          &ldquo;{STATEMENT}&rdquo;
        </p>
        <span className="mt-3 font-code text-[10px] tracking-[0.3em] text-ember/70 uppercase">
          — SUB-BAB 1.1 · LATAR BELAKANG MASALAH
        </span>
      </div>

      {/* Tiga fakta urgensi sekuensial */}
      <div className="absolute top-[50vh] left-1/2 -translate-x-1/2 w-[62vw] space-y-[1.3vw]">
        {FACTS.map((f, i) => (
          <div
            key={f.tag}
            data-step={i + 1}
            data-reveal="clip"
            className="grid grid-cols-[16vw_1fr] items-baseline gap-[2vw] border-t border-edge pt-[1vw]"
          >
            <span className="font-code text-[10px] tracking-[0.18em] text-ember whitespace-nowrap">
              {f.tag}
            </span>
            <p className="font-body text-[clamp(0.95rem,1.22vw,1.3rem)] leading-snug text-paper/90">
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
