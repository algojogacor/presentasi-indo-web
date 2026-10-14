"use client";

import { useRef } from "react";
import { useStepReveal } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

interface Panel {
  label: string;
  body: React.ReactNode;
}

interface Point {
  idx: string;
  title: React.ReactNode;
  tag: string;
  desc: string;
  before: Panel;
  after: Panel;
}

const POINTS: Point[] = [
  {
    idx: "07.1",
    title: "Penerapan Ejaan (EYD Edisi V)",
    tag: "TATA TULIS RESMI · KEPMENDIKBUDRISTEK NO. 0424/P/2022",
    desc: "Penulisan karya ilmiah wajib mengacu pada EYD Edisi V (Badan Bahasa, 2022), mencakup penggunaan huruf miring untuk istilah asing, penulisan huruf kapital, penggabungan kata berimbuhan, serta ketepatan tanda baca.",
    before: {
      label: "SALAH — ISTILAH ASING TIDAK DIBERI HURUF MIRING",
      body: (
        <>
          Data penelitian diolah secara online menggunakan metode deep learning
          dan data mining.
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-xs tracking-[0.18em] text-wrong font-semibold">
            ISTILAH ASING TIDAK TERCETAK MIRING
          </span>
        </>
      ),
    },
    after: {
      label: "BENAR (EYD V) — HURUF MIRING UNTUK ISTILAH ASING",
      body: (
        <>
          Data penelitian diolah secara{" "}
          <em className="font-semibold italic text-ember">online</em> menggunakan
          metode <em className="font-semibold italic text-ember">deep learning</em>{" "}
          dan <em className="font-semibold italic text-ember">data mining</em>.
        </>
      ),
    },
  },
  {
    idx: "07.2",
    title: "Struktur Kalimat Efektif",
    tag: "HEMAT KATA · SUBJEK-PREDIKAT TEGAS · ANTI-SINTAKSIS RANCU",
    desc: "Kalimat ilmiah wajib memiliki subjek dan predikat yang jelas, tidak ambigu, hemat kata, serta bebas dari kalimat menggantung (fragment sentence) dan kerancuan aktif-pasif (Jumadi et al., 2024).",
    before: {
      label: "TIDAK EFEKTIF — 16 KATA, PREPOSISI GANDA & RANCU",
      body: (
        <>
          Di dalam penelitian ini adalah bertujuan untuk membahas daripada pengaruh
          struktur terhadap kualitas karya tulis ilmiah.
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-xs tracking-[0.18em] text-wrong font-semibold">
            SUBJEK KABUR · KATA BERLEBIHAN
          </span>
        </>
      ),
    },
    after: {
      label: "EFEKTIF — 8 KATA, LUGAS & SUBJEK-PREDIKAT JELAS",
      body: (
        <>
          Penelitian ini bertujuan menganalisis pengaruh struktur terhadap kualitas
          karya tulis ilmiah.
        </>
      ),
    },
  },
  {
    idx: "07.3",
    title: "Integritas & Anti-Plagiarisme",
    tag: "ETIKA AKADEMIK · TEKNIK SITASI · PENGELOLA REFERENSI",
    desc: "Setiap pemikiran, data, atau kutipan pihak lain wajib dicantumkan sumber rujukannya secara jujur (parafrasa atau kutipan langsung) dengan bantuan pengelola referensi seperti Mendeley atau Zotero (Samal & Ardianto, 2025).",
    before: {
      label: "PELANGGARAN ETIKA — MENYALIN TANPA RUJUKAN",
      body: (
        <>
          Karya ilmiah adalah produk komunikasi akademik tertulis yang menyajikan
          gagasan rasional atau hasil investigasi empiris dengan metode ilmiah.
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-xs tracking-[0.18em] text-wrong font-semibold">
            TANPA SITASI — KLAIM SEPIHAK (PLAGIARISME)
          </span>
        </>
      ),
    },
    after: {
      label: "BERINTEGRITAS — PARAFRASA DENGAN SITASI BAKU",
      body: (
        <>
          Komunikasi akademik tertulis yang menyajikan investigasi empiris secara
          metodologis dikategorikan sebagai karya ilmiah{" "}
          <span className="font-semibold text-ember">(Samal &amp; Ardianto, 2025)</span>.
        </>
      ),
    },
  },
];

/**
 * Section 7 — Kaidah Kebahasaan & Etika.
 * Step 0–2: tiga poin sekuensial, panel "sebelum" (merah redup) vs "sesudah" (amber).
 */
export default function S7Kaidah({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  useStepReveal(root, step);

  return (
    <div ref={root} className="absolute inset-0 px-6 sm:px-[9vw]" data-testid="kaidah">
      <Kicker act="07">KAIDAH KEBAHASAAN &amp; ETIKA</Kicker>
      <BigNumeral>07</BigNumeral>

      {POINTS.map((p, i) => (
        <figure
          key={p.idx}
          data-step={i}
          data-exclusive
          className="absolute inset-0 flex flex-col justify-center pt-[6vh]"
        >
          <p className="font-code text-xs sm:text-sm tracking-[0.3em] text-ember font-medium">
            {p.idx} — {p.tag}
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,3.8vw,4.2rem)] leading-[1.05] text-paper font-semibold">
            {p.title}
          </h2>
          <p className="mt-3.5 max-w-[90vw] md:max-w-[62vw] font-body text-sm sm:text-base md:text-[1.35vw] leading-relaxed text-paper/85">
            {p.desc}
          </p>

          <div className="mt-[3.8vh] grid max-w-[82vw] grid-cols-2 gap-[2.4vw]">
            <div className="rounded-r border-t-2 border-wrong/60 bg-wrong/[0.03] p-4 sm:p-5 pt-3.5">
              <div className="inline-flex items-center gap-1.5 rounded bg-wrong/15 px-2.5 py-0.5 font-code text-xs text-wrong mb-2.5 border border-wrong/30 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-wrong" />
                <span>KETIDAKBAKUAN TEKS</span>
              </div>
              <p className="font-code text-xs sm:text-sm tracking-[0.2em] text-wrong font-semibold">
                {p.before.label}
              </p>
              <p className="mt-3 font-body text-sm md:text-[1.45vw] leading-relaxed text-paper/85">
                {p.before.body}
              </p>
            </div>
            <div className="rounded-r border-t-2 border-ember bg-ember/[0.04] p-4 sm:p-5 pt-3.5 shadow-[0_4px_25px_rgba(232,160,32,0.06)]">
              <div className="inline-flex items-center gap-1.5 rounded bg-ember/15 px-2.5 py-0.5 font-code text-xs text-ember mb-2.5 border border-ember/30 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
                <span>STANDAR BAKU EYD V</span>
              </div>
              <p className="font-code text-xs sm:text-sm tracking-[0.2em] text-ember font-semibold">
                {p.after.label}
              </p>
              <p className="mt-3 font-body text-sm md:text-[1.45vw] leading-relaxed text-paper/95 font-medium">
                {p.after.body}
              </p>
            </div>
          </div>
        </figure>
      ))}
    </div>
  );
}
