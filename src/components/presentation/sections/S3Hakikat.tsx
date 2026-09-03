"use client";

import { useRef } from "react";
import { useStepReveal } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

const DEFINITIONS = [
  {
    text: "Laporan yang ditulis dan diterbitkan untuk memaparkan hasil penelitian atau pengkajian — disusun untuk memenuhi norma dan etika ilmiah yang kuat dan ditaati.",
    by: "KBBI · EDISI V",
  },
  {
    text: "Karya tulis yang disusun berdasarkan data dan fakta, diperoleh dari hasil penelitian lapangan maupun kepustakaan, serta disusun dengan metode ilmiah.",
    by: "WULANDARI dkk.",
  },
  {
    text: "Rangkaian kegiatan penulisan yang menyampaikan gagasan, data, dan fakta dengan metode serta sistematisasi tertentu.",
    by: "SAMAL & ARDIANTO",
  },
];

const CHARACTERISTICS: [string, string, string][] = [
  ["01", "Objektif", "Berdasarkan fakta dan data — bebas dari kepentingan dan opini pribadi penulis."],
  ["02", "Logis", "Setiap klaim dihubungkan dengan argumen yang runtut dan dapat ditelusuri."],
  ["03", "Sistematis", "Bagian tersusun bertahap sesuai konvensi struktur ilmiah."],
  ["04", "Cendekia", "Berbahasa baku, tepat, dan komunikatif bagi komunitas ilmiah."],
  ["05", "Verifikatif", "Temuan dapat diuji dan diverifikasi ulang oleh pembaca lain."],
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
