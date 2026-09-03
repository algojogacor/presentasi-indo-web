"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { BookOpen, Newspaper, GraduationCap, Rocket } from "lucide-react";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

interface Row {
  k: string;
  v: string;
  hot?: boolean;
}

interface Card {
  title: string;
  sub: string;
  icon: typeof BookOpen;
  rows: Row[];
  note: string;
}

const CARDS: Card[] = [
  {
    title: "Makalah",
    sub: "TUGAS STUDI",
    icon: BookOpen,
    rows: [
      { k: "STRUKTUR", v: "Halaman judul · kata pengantar · daftar isi · BAB I–III · daftar pustaka" },
      { k: "TUJUAN", v: "Pemenuhan tugas perkuliahan" },
      { k: "AUDIENS", v: "Dosen pengampu & kelas" },
      { k: "PANJANG", v: "± 10–30 halaman" },
      { k: "CIRI", v: "Studi kepustakaan; format mengikuti pedoman institusi" },
    ],
    note: "Formatnya lentur — pedoman institusi yang menentukan.",
  },
  {
    title: "Artikel Jurnal",
    sub: "PUBLIKASI ILMIAH",
    icon: Newspaper,
    rows: [
      { k: "STRUKTUR", v: "Abstrak terstruktur · IMRAD — Pendahuluan, Metode, Hasil, Pembahasan", hot: true },
      { k: "TUJUAN", v: "Publikasi & kontribusi pengetahuan baru", hot: true },
      { k: "AUDIENS", v: "Peer reviewer & pembaca global" },
      { k: "PANJANG", v: "± 8–15 halaman" },
      { k: "CIRI", v: "Padat, lolos peer review, menyumbang temuan" },
    ],
    note: "Tersekat IMRAD — ketat karena hidup di publikasi.",
  },
  {
    title: "Skripsi",
    sub: "SYARAT SARJANA",
    icon: GraduationCap,
    rows: [
      { k: "STRUKTUR", v: "Preliminaries lengkap · BAB I–V · postliminaries lengkap" },
      { k: "TUJUAN", v: "Syarat kelulusan jenjang S1" },
      { k: "AUDIENS", v: "Pembimbing & penguji — ujian terbuka" },
      { k: "PANJANG", v: "± 60–150 halaman", hot: true },
      { k: "CIRI", v: "Karya mandiri dengan data original" },
    ],
    note: "Anatomi paling lengkap — seluruh konvensi dipakai.",
  },
  {
    title: "Proposal PKM",
    sub: "KOMPETISI HIBAH",
    icon: Rocket,
    rows: [
      { k: "STRUKTUR", v: "Pendahuluan & tujuan · kajian pustaka · metode pelaksanaan · jadwal & biaya" },
      { k: "TUJUAN", v: "Pendanaan & penghargaan Kemenristekdikti", hot: true },
      { k: "AUDIENS", v: "Juri program hibah" },
      { k: "PANJANG", v: "± 10–20 halaman" },
      { k: "CIRI", v: "Proposal aksi — menjanjikan hasil, belum melaporkan hasil", hot: true },
    ],
    note: "Bukan laporan hasil — ia menjual janji hasil.",
  },
];

/**
 * Section 6 — Battle Cards.
 * Step 0: empat kartu sejajar · 1–4: spotlight satu kartu · 5: mode komparasi [B].
 */
export default function S6Battle({ step }: { step: number }) {
  const { setStep, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);

  const selIdx = step >= 1 && step <= 4 ? step - 1 : -1;
  const compare = step === 5;

  useSectionKeys((key) => {
    if (key === "b") {
      setStep(compare ? 0 : 5);
      return true;
    }
    const n = Number(key);
    if (n >= 1 && n <= 4) {
      setStep(n);
      return true;
    }
    return false;
  });

  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    const cards = Array.from(q.querySelectorAll<HTMLElement>(".battle-card"));

    cards.forEach((el, i) => {
      let xPct: number;
      let scale: number;
      let opacity: number;
      let z = 1;
      if (compare) {
        xPct = (i - 1.5) * 112 - 50;
        scale = 0.86;
        opacity = 1;
      } else if (selIdx >= 0) {
        if (i === selIdx) {
          xPct = -50;
          scale = 1.42;
          opacity = 1;
          z = 10;
        } else {
          const d = i - selIdx;
          const mag = Math.min(Math.abs(d), 2.2) * 108;
          xPct = (d < 0 ? -mag : mag) - 50;
          scale = 0.55;
          opacity = 0.28;
        }
      } else {
        xPct = (i - 1.5) * 108 - 50;
        scale = 1;
        opacity = 1;
      }
      gsap.to(el, {
        xPercent: xPct,
        yPercent: -50,
        scale,
        opacity,
        zIndex: z,
        duration: settled ? 0 : 0.85,
        ease: "power3.inOut",
        overwrite: "auto",
      });

      const rows = el.querySelectorAll<HTMLElement>(".card-row");
      const note = el.querySelector<HTMLElement>(".card-note");
      const showRows = compare || selIdx >= 0;
      if (settled) {
        gsap.set(rows, { autoAlpha: showRows ? 1 : 0, y: 0 });
        if (note) gsap.set(note, { autoAlpha: selIdx === i ? 1 : 0 });
        return;
      }
      if (showRows) {
        gsap.fromTo(
          rows,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06, delay: 0.3, overwrite: "auto" },
        );
      } else {
        gsap.to(rows, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
      }
      if (note)
        gsap.to(note, {
          autoAlpha: selIdx === i ? 1 : 0,
          duration: settled ? 0 : 0.4,
          delay: 0.35,
        });
    });
  }, [step, selIdx, compare, settled]);

  return (
    <div ref={root} className="absolute inset-0" data-testid="battle-cards">
      <Kicker act="06">VARIASI JENIS KTI</Kicker>
      <BigNumeral>06</BigNumeral>

      {compare && (
        <p className="fade-slide-in absolute top-[5vh] right-[6vw] z-10 font-code text-[10px] tracking-[0.3em] text-mute">
          MODE KOMPARASI — PERBEDAAN KUNCI DI-TANDAI
        </p>
      )}

      <div className="absolute inset-0 pt-[16vh]">
        {CARDS.map((c, i) => (
          <article
            key={c.title}
            data-card={i}
            className="battle-card absolute top-1/2 left-1/2 h-[54vh] w-[20vw] overflow-hidden rounded-[3px] border border-edge bg-surface/85 p-[1.3vw] opacity-0 backdrop-blur-[2px]"
            style={{ willChange: "transform" }}
            aria-label={`Kartu ${c.title}`}
          >
            <header className="flex items-start justify-between gap-2">
              <div>
                <p className="font-code text-[9px] tracking-[0.3em] text-ember">
                  {c.sub}
                </p>
                <h3 className="mt-2 font-display text-[1.95vw] leading-none text-paper">
                  {c.title}
                </h3>
              </div>
              <c.icon
                className="h-[1.6vw] w-[1.6vw] shrink-0 text-mute"
                strokeWidth={1.5}
                aria-hidden
              />
            </header>

            <div className="mt-[1.2vw] space-y-[0.75vw]">
              {c.rows.map((r) => (
                <div
                  key={r.k}
                  className={`card-row rounded-[2px] py-1 pl-2 ${
                    r.hot && compare
                      ? "border-l-2 border-ember bg-ember/10"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <p className="font-code text-[8px] tracking-[0.28em] text-mute">
                    {r.k}
                  </p>
                  <p
                    className={`mt-1 font-body text-[0.98vw] leading-snug ${
                      r.hot && compare ? "text-ember" : "text-paper/80"
                    }`}
                  >
                    {r.v}
                  </p>
                </div>
              ))}
            </div>

            <p className="card-note absolute right-[1.3vw] bottom-[1.2vw] left-[1.3vw] border-t border-edge pt-3 font-display text-[1.05vw] italic text-paper/60 opacity-0">
              {c.note}
            </p>
          </article>
        ))}
      </div>

      <p className="absolute right-[6vw] bottom-[6vh] font-code text-[9px] tracking-[0.25em] text-mute">
        [1–4] SPOTLIGHT · [B] KOMPARASI · [SPACE] BERURUTAN
      </p>
    </div>
  );
}
