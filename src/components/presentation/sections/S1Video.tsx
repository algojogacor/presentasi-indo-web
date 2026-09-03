"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePres } from "../context";
import { useIsoLayoutEffect } from "../hooks";
import { LiveDot } from "../atoms";

/**
 * Section 1 — Guest Lecturer (embed YouTube teatrikal).
 * Step 0: tirai tertutup + kalimat pengantar presenter.
 * Step 1: tirai terbuka → frame siaran langsung + video.
 * Step 2: tirai menutup + kalimat penutup.
 * Shortcut Shift+S (ditangani Experience) melewati section ini.
 */
export default function S1Video({ step }: { step: number }) {
  const { settled, registerTimeline } = usePres();
  const root = useRef<HTMLDivElement>(null);

  // Klaim kembali fokus keyboard jika iframe YouTube merebutnya
  useEffect(() => {
    const iv = setInterval(() => {
      const ae = document.activeElement as HTMLElement | null;
      if (ae && ae.tagName === "IFRAME") ae.blur();
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  // State awal: tirai tertutup, pengantar tampil, penutup tersembunyi
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    gsap.set(q.querySelector(".s1-curtain-l"), { xPercent: 0 });
    gsap.set(q.querySelector(".s1-curtain-r"), { xPercent: 0 });
    gsap.set(q.querySelector(".s1-intro"), { autoAlpha: 1 });
    gsap.set(q.querySelector(".s1-closing"), { autoAlpha: 0 });
    gsap.set(q.querySelector(".s1-frame"), { autoAlpha: 1, scale: 1 });
     
  }, []);

  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    const l = q.querySelector<HTMLElement>(".s1-curtain-l");
    const r = q.querySelector<HTMLElement>(".s1-curtain-r");
    const intro = q.querySelector<HTMLElement>(".s1-intro");
    const closing = q.querySelector<HTMLElement>(".s1-closing");
    const frame = q.querySelector<HTMLElement>(".s1-frame");
    if (!l || !r || !intro || !closing || !frame) return;

    const openCurtain = (instant: boolean) => {
      if (instant) {
        gsap.set([l, r], { xPercent: (i: number) => (i === 0 ? -100 : 100) });
        gsap.set(intro, { autoAlpha: 0 });
        gsap.set(closing, { autoAlpha: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.to(intro, { autoAlpha: 0, duration: 0.45, ease: "power1.in" });
      tl.to(
        [l, r],
        {
          xPercent: (i: number) => (i === 0 ? -100 : 100),
          duration: 1.05,
          ease: "power4.inOut",
        },
        "<0.18",
      );
      tl.fromTo(
        frame,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.75, ease: "power2.out" },
        "-=0.55",
      );
      registerTimeline(tl);
    };

    const closeCurtain = (instant: boolean) => {
      if (instant) {
        gsap.set([l, r], { xPercent: 0 });
        gsap.set(intro, { autoAlpha: 0 });
        gsap.set(closing, { autoAlpha: 1, y: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        return;
      }
      const tl = gsap.timeline();
      tl.to(frame, { autoAlpha: 0.3, scale: 0.975, duration: 0.4, ease: "power1.in" });
      tl.to(
        [l, r],
        { xPercent: 0, duration: 1.05, ease: "power4.inOut" },
        "<0.05",
      );
      tl.fromTo(
        closing,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.35",
      );
      registerTimeline(tl);
    };

    if (step === 1) openCurtain(settled);
    else if (step === 2) closeCurtain(settled);
    else if (settled) {
      // kembali ke step 0
      gsap.set([l, r], { xPercent: 0 });
      gsap.set(closing, { autoAlpha: 0 });
      gsap.set(frame, { autoAlpha: 1, scale: 1 });
      gsap.to(intro, { autoAlpha: 1, duration: 0.4 });
    }
    return () => {
      registerTimeline(null);
    };
     
  }, [step]);

  return (
    <div ref={root} className="absolute inset-0">
      {/* Frame siaran langsung */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="s1-frame relative" style={{ width: "min(62vw, 148vh)" }}>
          <div className="absolute -top-7 left-0 flex items-center gap-2 font-code text-[10px] tracking-[0.35em] text-mute">
            <LiveDot />
            <span>GUEST LECTURER</span>
          </div>
          <div className="relative aspect-video w-full overflow-hidden border border-ember/60 bg-black">
            {step >= 1 ? (
              <iframe
                src="https://www.youtube.com/embed/E6pPlIvlrPs?autoplay=1&rel=0&modestbranding=1"
                title="BAB 5 Part 1 — Pentingnya Menulis dan Mempublikasikan Artikel Ilmiah"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : null}
          </div>
          <div className="mt-4 flex items-end justify-between gap-6">
            <div>
              <p className="font-body text-[1.05vw] leading-snug text-paper">
                Prof. Wisnu Jatmiko — Guru Besar Fasilkom UI
              </p>
              <p className="mt-1.5 font-code text-[10px] tracking-[0.22em] text-mute">
                SERI METODOLOGI PENELITIAN &amp; PENULISAN ARTIKEL ILMIAH
              </p>
            </div>
            <div className="text-right font-code text-[10px] leading-[1.8] tracking-[0.12em] text-mute">
              <p>BAB 5 · PART 1 — PENTINGNYA MENULIS</p>
              <p>LAB1231 FASILKOM UI · 04:41 · 1080p</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pengantar (dibacakan sebelum tirai dibuka) */}
      <div className="s1-intro absolute inset-0 z-40 flex flex-col items-center justify-center px-[14vw] text-center">
        <p className="max-w-[62vw] font-display italic text-[1.85vw] leading-snug text-paper/80">
          &ldquo;Sebelum kita membedah anatomi teks di atas meja operasi, mari
          kita dengarkan pandangan Guru Besar Fakultas Ilmu Komputer Universitas
          Indonesia, Prof. Wisnu Jatmiko, mengenai mengapa tubuh ilmiah ini harus
          dilahirkan dan dipublikasikan ke dunia&hellip;&rdquo;
        </p>
        <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-mute">
          PENGANTAR — DIBACAKAN · LALU [SPACE] / [SHIFT+S] UNTUK LEWATI
        </p>
      </div>

      {/* Penutup (setelah video) */}
      <div className="s1-closing absolute inset-0 z-40 flex flex-col items-center justify-center px-[16vw] text-center opacity-0">
        <p className="max-w-[64vw] font-display italic text-[2.3vw] leading-snug text-paper/90">
          &ldquo;Gagasan ilmiah tidak akan pernah hidup tanpa sebuah tubuh
          tulisan yang baku.&rdquo;
        </p>
        <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-mute">
          PROF. WISNU JATMIKO — PARAFRASE · [SPACE] MENUJU ANATOMI
        </p>
      </div>

      {/* Tirai dua panel — polos, tanpa seam agar tidak memotong teks */}
      <div className="s1-curtain-l absolute inset-y-0 left-0 z-30 w-1/2 bg-[#060609]" />
      <div className="s1-curtain-r absolute inset-y-0 right-0 z-30 w-1/2 bg-[#060609]" />
    </div>
  );
}
