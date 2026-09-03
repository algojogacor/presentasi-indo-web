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
    title: "EYD Edisi V",
    tag: "EJAAN — EDISI 2022 · 25 BUTIR PENYESUAIAN",
    desc: "Ejaan resmi terbaru menggantikan EYD IV (2015). Perubahan yang paling terasa di KTI: istilah asing ditulis dengan huruf tebal — bukan miring.",
    before: {
      label: "SEBELUM — ISTILAH ASING DITULIS MIRING",
      body: (
        <>
          Data diusulkan dan diproses menggunakan metode{" "}
          <em className="text-paper/55 italic underline decoration-wrong/60 underline-offset-4">
            machine learning
          </em>
          .
        </>
      ),
    },
    after: {
      label: "SESUDAH — HURUF TEBAL",
      body: (
        <>
          Data diusulkan dan diproses menggunakan metode{" "}
          <strong className="font-semibold text-ember">machine learning</strong>
          .
        </>
      ),
    },
  },
  {
    idx: "07.2",
    title: "Kalimat Efektif",
    tag: "HEMAT KATA · PADAT · SUBJEK DI DEPAN",
    desc: "Kalimat efektif membuang kata sisa dan menempatkan subjek di depan — pembaca menerima gagasan pada kontak pertama.",
    before: {
      label: "SEBELUM — 18 KATA",
      body: (
        <>
          Dalam penelitian ini, penulis akan mencoba untuk menguraikan tentang
          anatomi karya tulis ilmiah.
        </>
      ),
    },
    after: {
      label: "SESUDAH — 6 KATA",
      body: (
        <>
          Penelitian ini menguraikan anatomi karya tulis ilmiah.
        </>
      ),
    },
  },
  {
    idx: "07.3",
    title: "Anti-Plagiarisme",
    tag: "ETIKA — GAGASAN DIPINJAM, WAJIB DIPULANGKAN",
    desc: "Menyalin tanpa rujukan adalah mencuri tubuh gagasan orang lain. Parafrasa dan sitasi menjadikan pinjaman itu tercatat.",
    before: {
      label: "SEBELUM — SALIN TANPA RUJUKAN",
      body: (
        <>
          Karya tulis ilmiah adalah laporan yang ditulis dan diterbitkan untuk
          memenuhi norma dan etika ilmiah yang ditaati.
          <span className="mt-3 block border-l-2 border-wrong pl-2 font-code text-[10px] tracking-[0.2em] text-wrong">
            TANPA SITASI — PLAGIARISME
          </span>
        </>
      ),
    },
    after: {
      label: "SESUDAH — PARAFRASA + SITASI",
      body: (
        <>
          KTI lahir dari kewajiban tunduk pada norma dan etika ilmiah yang
          ditaati
          <span className="text-ember"> (KBBI, Edisi V)</span>.
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
