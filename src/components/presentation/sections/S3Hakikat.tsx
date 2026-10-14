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
    <div ref={root} className="absolute inset-0 px-4 sm:px-[9vw]">
      <Kicker act="03">HAKIKAT &amp; KARAKTERISTIK</Kicker>
      <BigNumeral>03</BigNumeral>

      {/* Layar definisi — satu per satu, momen penuh */}
      <div className="absolute inset-0 flex items-center px-4 sm:px-0">
        {DEFINITIONS.map((d, i) => (
          <figure
            key={d.by}
            data-step={i}
            data-exclusive
            className="relative max-w-[92vw] md:max-w-[62vw]"
          >
            <span
              aria-hidden
              className="absolute -top-6 sm:-top-[4.2vw] -left-2 sm:-left-[1.4vw] font-display text-[clamp(3rem,7vw,7rem)] leading-none text-ember/60 select-none"
            >
              &ldquo;
            </span>
            <blockquote className="pl-5 sm:pl-[3.4vw] font-display italic text-[clamp(1.2rem,2.65vw,2.65rem)] leading-[1.3] text-paper">
              {d.text}
            </blockquote>
            <figcaption className="mt-3 sm:mt-[1.8vw] pl-5 sm:pl-[3.4vw] font-code text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.32em] text-ember">
              — {d.by}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Lima karakteristik — kartu horizontal, kumulatif */}
      {step >= 3 && (
        <div className="absolute inset-0 flex flex-col justify-start md:justify-center pt-14 md:pt-0 pb-20 md:pb-0 overflow-y-auto px-4 sm:px-[9vw]">
          <p
            data-step="3"
            className="mb-2 sm:mb-[1.2vw] border-t border-edge pt-4 font-code text-[10px] tracking-[0.25em] sm:tracking-[0.32em] text-mute"
          >
            LIMA KARAKTERISTIK KARYA TULIS ILMIAH
          </p>
          {CHARACTERISTICS.map((c, i) => (
            <div
              key={c[0]}
              data-step={i + 3}
              className="grid grid-cols-1 sm:grid-cols-[5.5vw_15vw_1fr] items-start sm:items-baseline gap-1 sm:gap-[2vw] border-t border-edge py-2.5 sm:py-[1.05vw]"
            >
              <div className="flex items-center gap-2 sm:block">
                <span className="font-display text-[clamp(1.2rem,2.7vw,2.7rem)] leading-none text-ember/85">
                  {c[0]}
                </span>
                <span className="font-body text-xs sm:text-[1.25vw] font-semibold uppercase tracking-[0.13em] text-paper sm:hidden">
                  {c[1]}
                </span>
              </div>
              <span className="font-body text-[1.25vw] font-semibold uppercase tracking-[0.13em] text-paper hidden sm:inline">
                {c[1]}
              </span>
              <span className="font-body text-xs sm:text-[1.12vw] leading-snug text-mute">
                {c[2]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
