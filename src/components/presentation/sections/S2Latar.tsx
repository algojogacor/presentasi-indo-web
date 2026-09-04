"use client";

import { useRef } from "react";
import { Kicker, BigNumeral } from "../atoms";
import LatarFacts from "./s2/LatarFacts";
import TheDocket from "./s2/TheDocket";

/**
 * Section 2 — Latar Belakang, Rumusan Masalah, & Tujuan Penulisan (BAB I).
 *
 * Alur Pacing Teatrikal (8 Langkah):
 * - Step 0: Pernyataan kunci kerangka logis KTI (Sub-bab 1.1)
 * - Step 1–3: Tiga fakta urgensi penulisan (Komunikasi, Hambatan, Kerangka)
 * - Step 4–7: The Docket — 4 Rumusan Masalah & Mandat Tujuan (Sub-bab 1.2 & 1.3)
 *             dengan koreografi Stack Dimming & audio gavel thump,
 *             disertai sintesis Manfaat Penulisan (Sub-bab 1.4) di Step 7.
 */
export default function S2Latar({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);

  const kickerText =
    step < 4 ? "LATAR BELAKANG" : "RUMUSAN MASALAH & TUJUAN";

  return (
    <div ref={root} className="absolute inset-0 px-[8vw]">
      <Kicker act="02">{kickerText}</Kicker>
      <BigNumeral>02</BigNumeral>

      {/* Bagian 1: Latar Belakang & 3 Fakta (Step 0–3) */}
      <LatarFacts step={step} />

      {/* Bagian 2: The Docket — Rumusan Masalah, Mandat Tujuan & Manfaat (Step 4–7) */}
      <TheDocket step={step} />
    </div>
  );
}
