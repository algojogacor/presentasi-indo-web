"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStepReveal, useIsoLayoutEffect } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

const STATEMENT =
  "Banyak mahasiswa yang bisa menulis, tapi tidak tahu apa yang mereka tulis.";

const FACTS = [
  {
    tag: "FAKTA 01 — STRUKTUR",
    text: "Menulis lancar tidak sama dengan menulis terstruktur. Banyak tulisan mahasiswa runtuh bukan karena idenya — tapi karena anatominya.",
  },
  {
    tag: "FAKTA 02 — KONVENSI",
    text: "Struktur KTI adalah konvensi komunitas ilmiah: bagian awal, inti, dan akhir punya fungsi yang tidak bisa ditukar tempat.",
  },
  {
    tag: "FAKTA 03 — KONSEKUENSI",
    text: "Salah struktur berarti gagal komunikasi — pembaca tersesat sebelum sampai pada isi.",
  },
];

/**
 * Section 2 — Latar Belakang.
 * Step 0: satu pernyataan besar (Cormorant italic 3.5vw).
 * Step 1–3: fakta muncul satu per satu, clip-path dari bawah.
 */
export default function S2Latar({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  useStepReveal(root, step);

  // Saat fakta mulai muncul, pernyataan naik & mengecil agar fakta bernafas
  useIsoLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".s2-statement");
    if (!el) return;
    if (step >= 1) {
      gsap.to(el, {
        yPercent: -16,
        scale: 0.82,
        autoAlpha: 0.55,
        duration: 0.7,
        ease: "power3.inOut",
        transformOrigin: "center top",
      });
    } else {
      gsap.to(el, {
        yPercent: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out",
        transformOrigin: "center top",
      });
    }
  }, [step]);

  return (
    <div
      ref={root}
      className="absolute inset-0 flex flex-col items-center justify-center px-[10vw]"
    >
      <Kicker act="02">LATAR BELAKANG</Kicker>
      <BigNumeral>02</BigNumeral>

      <p
        data-step="0"
        className="s2-statement max-w-[58vw] text-center font-display italic text-[3.4vw] leading-[1.18] text-paper"
      >
        {STATEMENT}
      </p>

      <div className="mt-[4.5vw] w-[54vw] space-y-[1.5vw]">
        {FACTS.map((f, i) => (
          <div
            key={f.tag}
            data-step={i + 1}
            data-reveal="clip"
            className="grid grid-cols-[13vw_1fr] items-baseline gap-[2vw] border-t border-edge pt-[1.1vw]"
          >
            <span className="font-code text-[10px] tracking-[0.22em] text-ember">
              {f.tag}
            </span>
            <p className="font-body text-[1.35vw] leading-snug text-paper/90">
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
