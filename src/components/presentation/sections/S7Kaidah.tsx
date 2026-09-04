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
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-[10px] tracking-[0.2em] text-wrong">
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
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-[10px] tracking-[0.2em] text-wrong">
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
    desc: "Setiap pemikiran, data, atau kutipan pihak lain wajib dicantumkan sumber rujukannya secara jujur (parafrasa atau kutipan langsung) dengan bantuan pengelola referensi seperti Mendeley atau Zotero (Farida, 2024).",
    before: {
      label: "PELANGGARAN ETIKA — MENYALIN TANPA RUJUKAN",
      body: (
        <>
          Karya ilmiah adalah produk komunikasi akademik tertulis yang menyajikan
          gagasan rasional atau hasil investigasi empiris dengan metode ilmiah.
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-[10px] tracking-[0.2em] text-wrong">
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
    <div ref={root} className="absolute inset-0 px-[9vw]" data-testid="kaidah">
      <Kicker act="07">KAIDAH KEBAHASAAN &amp; ETIKA</Kicker>
      <BigNumeral>07</BigNumeral>

      {POINTS.map((p, i) => (
        <figure
          key={p.idx}
          data-step={i}
          data-exclusive
          className="absolute inset-0 flex flex-col justify-center pt-[6vh]"
        >
          <p className="font-code text-[10px] tracking-[0.3em] text-ember">
            {p.idx} — {p.tag}
          </p>
          <h2 className="mt-3 font-display text-[3.8vw] leading-[1.02] text-paper">
            {p.title}
          </h2>
          <p className="mt-4 max-w-[44vw] font-body text-[1.2vw] leading-relaxed text-mute">
            {p.desc}
          </p>

          <div className="mt-[4vh] grid max-w-[76vw] grid-cols-2 gap-[2vw]">
            <div className="border-t-2 border-wrong/60 pt-4">
              <p className="font-code text-[10px] tracking-[0.25em] text-wrong">
                {p.before.label}
              </p>
              <p className="mt-4 font-body text-[1.35vw] leading-relaxed text-paper/70">
                {p.before.body}
              </p>
            </div>
            <div className="border-t-2 border-ember pt-4">
              <p className="font-code text-[10px] tracking-[0.25em] text-ember">
                {p.after.label}
              </p>
              <p className="mt-4 font-body text-[1.35vw] leading-relaxed text-paper/95">
                {p.after.body}
              </p>
            </div>
          </div>
        </figure>
      ))}
    </div>
  );
}
