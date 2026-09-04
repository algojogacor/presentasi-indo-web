"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useStepReveal, useIsoLayoutEffect } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

const STATEMENT =
  "Struktur dalam penulisan karya ilmiah berfungsi sebagai kerangka logis yang mengarahkan pembaca untuk memahami alur pemikiran penulis dari perumusan fenomena hingga penarikan kesimpulan.";

const FACTS = [
  {
    tag: "FAKTA 01 — KOMUNIKASI AKADEMIK",
    text: "Karya ilmiah bukan sekadar sarana melaporkan riset, melainkan alat krusial pengembang pemikiran kritis dan analitis di tengah pesatnya tuntutan publikasi bereputasi (Musdalifah et al., 2025).",
  },
  {
    tag: "FAKTA 02 — HAMBATAN MAHASISWA",
    text: "Banyak mahasiswa masih terhambat menyusun karya ilmiah standar akibat minimnya penguasaan struktur anatomi dan kurangnya latihan penulisan terarah (Baharuddin et al., 2025).",
  },
  {
    tag: "FAKTA 03 — KERANGKA LOGIS",
    text: "Setiap bab KTI memiliki fungsi distingtif; memahami struktur anatomi bukan sebatas kepatuhan teknis, melainkan esensial dalam membangun argumen ilmiah yang utuh dan sahih.",
  },
];

/**
 * Section 2 — Latar Belakang.
 * Step 0: satu pernyataan besar (Cormorant italic 3.5vw).
 * Step 1–3: fakta muncul satu per satu, clip-path dari bawah.
 */
export default function S2Latar({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  useStepReveal(root, step);

  // Saat fakta mulai muncul, pernyataan naik & mengecil agar fakta bernafas
  useIsoLayoutEffect(() => {
    const el = statementRef.current;
    if (!el) return;
    if (step >= 1) {
      gsap.to(el, {
        y: "-14vh",
        scale: 0.82,
        autoAlpha: 0.6,
        duration: 0.7,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(el, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power2.out",
      });
    }
  }, [step]);

  return (
    <div
      ref={root}
      className="absolute inset-0 px-[8vw]"
    >
      <Kicker act="02">LATAR BELAKANG</Kicker>
      <BigNumeral>02</BigNumeral>

      {/* Pernyataan besar — terpusat penuh saat Step 0, naik anggun saat fakta masuk */}
      <div
        ref={statementRef}
        data-step="0"
        className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-[68vw] pointer-events-none"
      >
        <p className="s2-statement font-display italic text-[2.7vw] leading-[1.3] text-paper">
          &ldquo;{STATEMENT}&rdquo;
        </p>
        <span className="mt-3 font-code text-[10px] tracking-[0.3em] text-ember/70">
          — SUB-BAB 1.1 · LATAR BELAKANG MASALAH
        </span>
      </div>

      {/* Tiga fakta urgensi sekuensial — muncul di paruh bawah saat Step 1–3 */}
      <div className="absolute top-[50vh] left-1/2 -translate-x-1/2 w-[62vw] space-y-[1.3vw]">
        {FACTS.map((f, i) => (
          <div
            key={f.tag}
            data-step={i + 1}
            data-reveal="clip"
            className="grid grid-cols-[16vw_1fr] items-baseline gap-[2vw] border-t border-edge pt-[1vw]"
          >
            <span className="font-code text-[10px] tracking-[0.18em] text-ember whitespace-nowrap">
              {f.tag}
            </span>
            <p className="font-body text-[1.22vw] leading-snug text-paper/90">
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
