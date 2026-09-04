"use client";

import { useRef } from "react";
import { useStepReveal } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

const DEFINITIONS = [
  {
    text: "Karya tulis yang sengaja dibuat dengan mematuhi kaidah-kaidah keilmuan dan dilandasi oleh hasil pengamatan, peninjauan, atau penelitian dalam bidang tertentu.",
    by: "KBBI DARING · BADAN BAHASA (2024)",
  },
  {
    text: "Uraian atau penjabaran hasil temuan berdasarkan data sekunder dan data primer yang bertujuan untuk memecahkan masalah tertentu.",
    by: "WULANDARI ET AL. (2024)",
  },
  {
    text: "Produk komunikasi akademik tertulis yang menyajikan gagasan rasional atau hasil investigasi empiris dengan metode ilmiah yang dapat dipertanggungjawabkan secara terbuka.",
    by: "SAMAL & ARDIANTO (2025)",
  },
];

const CHARACTERISTICS: [string, string, string][] = [
  ["01", "Objektif", "Setiap pernyataan, analisis, dan simpulan didasarkan pada data faktual atau bukti empiris, bukan opini pribadi yang emosional."],
  ["02", "Logis & Rasional", "Alur penalaran disusun secara runtut, koheren, dan dapat diterima akal sehat (induktif maupun deduktif)."],
  ["03", "Sistematis", "Mengikuti pola organisasi penulisan yang terstruktur, baku, dan berkesinambungan antarbab atau antarseksi."],
  ["04", "Cendekia & Lugas", "Menggunakan ragam bahasa baku, kalimat efektif, istilah teknis yang tepat, serta menghindari ambiguitas atau metafora berlebihan."],
  ["05", "Verifikatif", "Prosedur penelitian dan metodologi disajikan secara transparan sehingga memungkinkan peneliti lain melakukan replikasi."],
];

/**
 * Section 3 — Hakikat & Karakteristik KTI.
 * Step 0–2: satu definisi per layar (quote besar, eksklusif).
 * Step 3–7: lima karakteristik sebagai kartu horizontal, satu per satu.
 */
export default function S3Hakikat({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  useStepReveal(root, step);

  return (
    <div ref={root} className="absolute inset-0 px-[9vw]">
      <Kicker act="03">HAKIKAT &amp; KARAKTERISTIK</Kicker>
      <BigNumeral>03</BigNumeral>

      {/* Layar definisi — satu per satu, momen penuh */}
      <div className="absolute inset-0 flex items-center">
        {DEFINITIONS.map((d, i) => (
          <figure
            key={d.by}
            data-step={i}
            data-exclusive
            className="relative max-w-[62vw]"
          >
            <span
              aria-hidden
              className="absolute -top-[4.2vw] -left-[1.4vw] font-display text-[7vw] leading-none text-ember/60"
            >
              &ldquo;
            </span>
            <blockquote className="pl-[3.4vw] font-display italic text-[2.65vw] leading-[1.28] text-paper">
              {d.text}
            </blockquote>
            <figcaption className="mt-[1.8vw] pl-[3.4vw] font-code text-[11px] tracking-[0.32em] text-ember">
              — {d.by}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Lima karakteristik — kartu horizontal, kumulatif */}
      {step >= 3 && (
        <div className="absolute inset-0 flex flex-col justify-center">
          <p
            data-step="3"
            className="mb-[1.2vw] border-t border-edge pt-4 font-code text-[10px] tracking-[0.32em] text-mute"
          >
            LIMA KARAKTERISTIK KARYA TULIS ILMIAH
          </p>
          {CHARACTERISTICS.map((c, i) => (
            <div
              key={c[0]}
              data-step={i + 3}
              className="grid grid-cols-[5.5vw_15vw_1fr] items-baseline gap-[2vw] border-t border-edge py-[1.05vw]"
            >
              <span className="font-display text-[2.7vw] leading-none text-ember/85">
                {c[0]}
              </span>
              <span className="font-body text-[1.25vw] font-semibold uppercase tracking-[0.13em] text-paper">
                {c[1]}
              </span>
              <span className="font-body text-[1.12vw] leading-snug text-mute">
                {c[2]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
