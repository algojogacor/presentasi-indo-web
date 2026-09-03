"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePres, SECTIONS } from "./context";
import { useIsoLayoutEffect } from "./hooks";

const NUMERALS = [
  "OUVERTURE",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
];

/**
 * Kartu babak — kilasan judul sinematik saat memasuki babak baru.
 * Numeral raksasa Cormorant + label kecil kode; naik sekejap, tinggal sesaat,
 * lalu larut. [SPACE] memotongnya (terdaftar sebagai timeline aktif).
 * Tidak dirender saat kembali ke babak yang sudah pernah dilihat (settled).
 */
export default function ActCard({ section }: { section: number }) {
  const { registerTimeline } = usePres();
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const numeral = el.querySelector<HTMLElement>(".ac-numeral")!;
    const label = el.querySelector<HTMLElement>(".ac-label")!;

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
    );
    tl.fromTo(
      numeral,
      { y: 26, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
      "<0.05",
    );
    tl.fromTo(
      label,
      { autoAlpha: 0, letterSpacing: "0.9em" },
      { autoAlpha: 1, letterSpacing: "0.5em", duration: 0.5, ease: "power2.out" },
      "<0.12",
    );
    tl.to({}, { duration: 0.55 }); // tinggal sejenak — napas
    tl.to(
      [numeral, label],
      { autoAlpha: 0, y: -18, duration: 0.45, ease: "power2.in", stagger: 0.04 },
    );
    tl.to(el, { autoAlpha: 0, duration: 0.2 }, "<0.3");
    tl.add(() => registerTimeline(null));
    registerTimeline(tl);
    return () => {
      tl.kill();
      registerTimeline(null);
    };
     
  }, []);

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 z-[65] flex flex-col items-center justify-center"
      aria-hidden="true"
    >
      <span className="ac-numeral font-display text-[11vw] leading-none font-medium text-paper/12 select-none">
        {NUMERALS[section]}
      </span>
      <span className="ac-label mt-[1.2vw] font-code text-[11px] text-ember/85 uppercase">
        {section === 0 ? "Kelompok 6 · PDB 93" : SECTIONS[section].label}
      </span>
    </div>
  );
}
