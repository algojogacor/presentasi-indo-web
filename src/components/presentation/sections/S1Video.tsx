"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePres } from "../context";
import { useIsoLayoutEffect } from "../hooks";
import { LiveDot } from "../atoms";

const REST_WAVE_SCALE = 38;
const PEAK_WAVE_SCALE = 82;

/** Konfigurasi 7 searchlight beam ala 20th Century Fox opening sequence */
const SEARCHLIGHT_BEAMS = [
  { left: "15%", rotFrom: -40, rotTo: -20, dur: 2.5 },
  { left: "25%", rotFrom: -25, rotTo: -5, dur: 3.2 },
  { left: "38%", rotFrom: -15, rotTo: 10, dur: 2.8 },
  { left: "50%", rotFrom: -5, rotTo: 20, dur: 3.8 },
  { left: "62%", rotFrom: 10, rotTo: 30, dur: 2.6 },
  { left: "75%", rotFrom: 20, rotTo: 40, dur: 3.4 },
  { left: "85%", rotFrom: 25, rotTo: 45, dur: 2.9 },
];

/**
 * Section 1 — Guest Lecturer (embed YouTube teatrikal dengan 20th Century Fox searchlight beams).
 * Step 0: Layar hitam penuh (#0A0A0F) + quote presenter redup.
 * Step 1: Tujuh searchlight beam tipis menyapu dari bawah ke atas layar, masing-masing
 *         dengan sudut dan durasi osilasi berbeda-beda (asinkron), mix-blend-mode screen.
 * Step 2: Layer hitam "runtuh" ke bawah (y: 0 -> 110vh, power3.in, 0.9s) → tirai merah beludru tertutup tersingkap (delay 0.1s).
 * Step 3: Tirai beludru membuka (2.4s, power3.inOut, asimetris 0.1s) → frame siaran YouTube aktif.
 * Step 4: Tirai menutup kembali (2.4s, power3.inOut) + kalimat penutup Prof. Wisnu Jatmiko.
 * Shortcut Shift+S melewati section ini.
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

  // State awal instan pada mount
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    const blackLayer = q.querySelector<HTMLElement>(".s1-black-layer");
    const searchlights = Array.from(q.querySelectorAll<HTMLElement>(".s1-searchlight"));
    const quote = q.querySelector<HTMLElement>(".s1-quote");
    const l = q.querySelector<HTMLElement>(".s1-curtain-l");
    const r = q.querySelector<HTMLElement>(".s1-curtain-r");
    const closing = q.querySelector<HTMLElement>(".s1-closing");
    const frame = q.querySelector<HTMLElement>(".s1-frame");

    if (step <= 1) {
      gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
      searchlights.forEach((el, i) => {
        const cfg = SEARCHLIGHT_BEAMS[i];
        if (!cfg) return;
        const midRot = (cfg.rotFrom + cfg.rotTo) / 2;
        gsap.set(el, {
          autoAlpha: step === 1 ? 1 : 0,
          rotation: step === 1 ? midRot : cfg.rotFrom,
        });
      });
      gsap.set(quote, { autoAlpha: step === 1 ? 1 : 0.52 });
      gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
    } else {
      gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
      gsap.set([l, r], {
        xPercent: (i: number) => (step >= 3 && step !== 4 ? (i === 0 ? -100 : 100) : 0),
        autoAlpha: 1,
      });
    }
    gsap.set(closing, { autoAlpha: step === 4 ? 1 : 0 });
    gsap.set(frame, { autoAlpha: 1, scale: 1 });
  }, []);

  // Mesin transisi langkah GSAP
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    const blackLayer = q.querySelector<HTMLElement>(".s1-black-layer");
    const searchlights = Array.from(q.querySelectorAll<HTMLElement>(".s1-searchlight"));
    const quote = q.querySelector<HTMLElement>(".s1-quote");
    const l = q.querySelector<HTMLElement>(".s1-curtain-l");
    const r = q.querySelector<HTMLElement>(".s1-curtain-r");
    const closing = q.querySelector<HTMLElement>(".s1-closing");
    const frame = q.querySelector<HTMLElement>(".s1-frame");
    const dispL = q.querySelector<SVGElement>("#disp-l");
    const dispR = q.querySelector<SVGElement>("#disp-r");
    if (!blackLayer || !searchlights.length || !quote || !l || !r || !closing || !frame) return;

    const setWaveScale = (val: number) => {
      dispL?.setAttribute("scale", String(val));
      dispR?.setAttribute("scale", String(val));
    };

    // Step 0: Layar hitam penuh (#0A0A0F) + quote redup, searchlight mati
    if (step === 0) {
      gsap.killTweensOf(searchlights);
      if (settled) {
        gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
        searchlights.forEach((el, i) => {
          const cfg = SEARCHLIGHT_BEAMS[i];
          if (!cfg) return;
          gsap.set(el, { autoAlpha: 0, rotation: cfg.rotFrom });
        });
        gsap.set(quote, { autoAlpha: 0.52 });
        gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
        gsap.set(closing, { autoAlpha: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        setWaveScale(REST_WAVE_SCALE);
      } else {
        const tl = gsap.timeline();
        tl.to(blackLayer, { y: 0, autoAlpha: 1, duration: 0.4 });
        tl.to(searchlights, { autoAlpha: 0, duration: 0.4 }, "<");
        tl.to(quote, { autoAlpha: 0.52, duration: 0.4 }, "<");
        tl.set([l, r], { xPercent: 0, autoAlpha: 0 });
        tl.set(closing, { autoAlpha: 0 });
        registerTimeline(tl);
      }
    }
    // Step 1: 7 searchlight beams fade in staggered, lalu berosilasi asinkron ala 20th Century Fox
    else if (step === 1) {
      gsap.killTweensOf(searchlights);

      // Mulai osilasi per-beam dengan durasi berbeda → asinkron, organik
      const startOscillation = () => {
        searchlights.forEach((el, i) => {
          const cfg = SEARCHLIGHT_BEAMS[i];
          if (!cfg) return;
          gsap.fromTo(
            el,
            { rotation: cfg.rotFrom },
            {
              rotation: cfg.rotTo,
              duration: cfg.dur,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
          );
        });
      };

      if (settled) {
        gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
        searchlights.forEach((el, i) => {
          const cfg = SEARCHLIGHT_BEAMS[i];
          if (!cfg) return;
          const midRot = (cfg.rotFrom + cfg.rotTo) / 2;
          gsap.set(el, { autoAlpha: 1, rotation: midRot });
        });
        gsap.set(quote, { autoAlpha: 1 });
        gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
        gsap.set(closing, { autoAlpha: 0 });
        startOscillation();
      } else {
        const tl = gsap.timeline({ onComplete: startOscillation });
        tl.set(blackLayer, { y: 0, autoAlpha: 1 });

        // Set semua beam ke rotasi awal dan opacity 0
        searchlights.forEach((el, i) => {
          const cfg = SEARCHLIGHT_BEAMS[i];
          if (!cfg) return;
          gsap.set(el, { rotation: cfg.rotFrom, autoAlpha: 0 });
        });

        // Fade in staggered 0.1s antar beam, durasi 1s per beam
        tl.to(
          searchlights,
          {
            autoAlpha: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power1.out",
          },
          0,
        );

        // Teks quote naik dari redup ke penuh bersamaan dengan searchlight
        tl.to(
          quote,
          {
            autoAlpha: 1,
            duration: 1,
            ease: "power2.out",
          },
          0,
        );
        registerTimeline(tl);
      }
    }
    // Step 2: Layer hitam "runtuh" ke bawah (y: 110vh, 0.9s, power3.in) → tirai merah tertutup terlihat (delay 0.1s)
    else if (step === 2) {
      gsap.killTweensOf(searchlights);
      if (settled) {
        gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
        gsap.set([l, r], { xPercent: 0, autoAlpha: 1 });
        gsap.set(closing, { autoAlpha: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        setWaveScale(REST_WAVE_SCALE);
      } else {
        const tl = gsap.timeline();
        tl.set([l, r], { xPercent: 0, autoAlpha: 0 });
        // Layer hitam runtuh ke bawah
        tl.to(blackLayer, {
          y: "110vh",
          duration: 0.9,
          ease: "power3.in",
        });
        // Delay 0.1 detik sebelum tirai muncul di baliknya
        tl.to(
          [l, r],
          {
            autoAlpha: 1,
            duration: 0.45,
            ease: "power1.out",
          },
          "0.1",
        );
        tl.set(blackLayer, { autoAlpha: 0 });
        registerTimeline(tl);
      }
    }
    // Step 3: Tirai beludru membuka (2.4s, power3.inOut, asimetris 0.1s delay, wave surge) → YouTube aktif
    else if (step === 3) {
      gsap.killTweensOf(searchlights);
      if (settled) {
        gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
        gsap.set(l, { xPercent: -100, autoAlpha: 1 });
        gsap.set(r, { xPercent: 100, autoAlpha: 1 });
        gsap.set(closing, { autoAlpha: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        setWaveScale(REST_WAVE_SCALE);
      } else {
        const tl = gsap.timeline();
        tl.set(blackLayer, { y: "110vh", autoAlpha: 0 });
        tl.set([l, r], { autoAlpha: 1 });

        // Panel kiri bergerak membuka
        tl.to(
          l,
          {
            xPercent: -100,
            duration: 2.4,
            ease: "power3.inOut",
          },
          0,
        );

        // Panel kanan menyusul 0.1s kemudian
        tl.to(
          r,
          {
            xPercent: 100,
            duration: 2.4,
            ease: "power3.inOut",
          },
          0.1,
        );

        // Dinamika gelombang kain saat ditarik membuka
        const wave = { val: REST_WAVE_SCALE };
        tl.to(
          wave,
          {
            val: PEAK_WAVE_SCALE,
            duration: 1.0,
            ease: "sine.out",
            onUpdate: () => setWaveScale(wave.val),
          },
          0,
        );
        tl.to(
          wave,
          {
            val: REST_WAVE_SCALE,
            duration: 1.4,
            ease: "sine.inOut",
            onUpdate: () => setWaveScale(wave.val),
          },
          1.0,
        );

        tl.fromTo(
          frame,
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
          0.8,
        );
        registerTimeline(tl);
      }
    }
    // Step 4: Tirai menutup kembali (2.4s, power3.inOut) + kalimat penutup tampil
    else if (step === 4) {
      gsap.killTweensOf(searchlights);
      if (settled) {
        gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
        gsap.set([l, r], { xPercent: 0, autoAlpha: 1 });
        gsap.set(closing, { autoAlpha: 1, y: 0 });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        setWaveScale(REST_WAVE_SCALE);
      } else {
        const tl = gsap.timeline();
        tl.to(frame, { autoAlpha: 0.25, scale: 0.975, duration: 0.6, ease: "power1.in" });

        // Panel kiri bergerak menutup
        tl.to(
          l,
          {
            xPercent: 0,
            duration: 2.4,
            ease: "power3.inOut",
          },
          "<0.05",
        );

        // Panel kanan menyusul 0.1s kemudian
        tl.to(
          r,
          {
            xPercent: 0,
            duration: 2.4,
            ease: "power3.inOut",
          },
          "<0.1",
        );

        // Dinamika gelombang kain saat menutup
        const wave = { val: REST_WAVE_SCALE };
        tl.to(
          wave,
          {
            val: PEAK_WAVE_SCALE,
            duration: 1.0,
            ease: "sine.out",
            onUpdate: () => setWaveScale(wave.val),
          },
          "<",
        );
        tl.to(
          wave,
          {
            val: REST_WAVE_SCALE,
            duration: 1.4,
            ease: "sine.inOut",
            onUpdate: () => setWaveScale(wave.val),
          },
          ">",
        );

        tl.fromTo(
          closing,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" },
          "-=0.7",
        );
        registerTimeline(tl);
      }
    }

    return () => {
      gsap.killTweensOf(searchlights);
      registerTimeline(null);
    };
  }, [step, settled, registerTimeline]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden select-none">
      {/* SVG Filters untuk gelombang & tekstur lipatan kain beludru dramatis */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id="curtain-wave-l" x="-20%" y="-10%" width="140%" height="120%">
            <feTurbulence
              id="turb-l"
              type="fractalNoise"
              baseFrequency="0.009 0.0018"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              id="disp-l"
              in="SourceGraphic"
              in2="noise"
              scale={REST_WAVE_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="curtain-wave-r" x="-20%" y="-10%" width="140%" height="120%">
            <feTurbulence
              id="turb-r"
              type="fractalNoise"
              baseFrequency="0.009 0.0018"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              id="disp-r"
              in="SourceGraphic"
              in2="noise"
              scale={REST_WAVE_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Frame siaran langsung (YouTube) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="s1-frame relative" style={{ width: "min(62vw, 148vh)" }}>
          <div className="absolute -top-7 left-0 flex items-center gap-2 font-code text-[10px] tracking-[0.35em] text-mute">
            <LiveDot />
            <span>GUEST LECTURER</span>
          </div>
          <div className="relative aspect-video w-full overflow-hidden border border-ember/60 bg-black shadow-2xl">
            {step >= 3 ? (
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

      {/* Tirai Panel Kiri (#3D0A0A gradasi ke #1A0505 dengan ornamen emas #C4963A) */}
      <div className="s1-curtain-l absolute inset-y-0 left-0 z-[30] w-[51.5%] overflow-hidden shadow-[12px_0_35px_rgba(0,0,0,0.95)]">
        <div
          className="relative w-full h-full"
          style={{
            filter: "url(#curtain-wave-l)",
            background: `
              linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.7) 100%),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.75) 0px,
                rgba(0, 0, 0, 0.55) 14px,
                rgba(255, 120, 120, 0.16) 40px,
                rgba(255, 255, 255, 0.22) 50px,
                rgba(255, 120, 120, 0.14) 60px,
                rgba(0, 0, 0, 0.55) 86px,
                rgba(0, 0, 0, 0.75) 100px
              ),
              linear-gradient(to right, #1A0505 0%, #250707 28%, #350A0A 70%, #3D0A0A 100%)
            `,
          }}
        >
          {/* Highlight ornamen tepi dalam emas #C4963A */}
          <div
            className="absolute top-0 bottom-0 right-0 w-[10px] z-10 shadow-[0_0_15px_rgba(196,150,58,0.5)]"
            style={{
              background:
                "linear-gradient(to right, #8C6A24 0%, #E2BD63 45%, #C4963A 75%, #6B4E15 100%)",
            }}
          >
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 5px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tirai Panel Kanan (#3D0A0A gradasi ke #1A0505 dengan ornamen emas #C4963A) */}
      <div className="s1-curtain-r absolute inset-y-0 right-0 z-[30] w-[51.5%] overflow-hidden shadow-[-12px_0_35px_rgba(0,0,0,0.95)]">
        <div
          className="relative w-full h-full"
          style={{
            filter: "url(#curtain-wave-r)",
            background: `
              linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.7) 100%),
              repeating-linear-gradient(
                to left,
                rgba(0, 0, 0, 0.75) 0px,
                rgba(0, 0, 0, 0.55) 14px,
                rgba(255, 120, 120, 0.16) 40px,
                rgba(255, 255, 255, 0.22) 50px,
                rgba(255, 120, 120, 0.14) 60px,
                rgba(0, 0, 0, 0.55) 86px,
                rgba(0, 0, 0, 0.75) 100px
              ),
              linear-gradient(to left, #1A0505 0%, #250707 28%, #350A0A 70%, #3D0A0A 100%)
            `,
          }}
        >
          {/* Highlight ornamen tepi dalam emas #C4963A */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[10px] z-10 shadow-[0_0_15px_rgba(196,150,58,0.5)]"
            style={{
              background:
                "linear-gradient(to right, #6B4E15 0%, #C4963A 25%, #E2BD63 55%, #8C6A24 100%)",
            }}
          >
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, #000 0px, #000 2px, transparent 2px, transparent 5px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Layer Hitam Panggung (Step 0 & 1 menutupi tirai, Step 2 runtuh ke bawah) */}
      <div className="s1-black-layer absolute inset-0 z-[45] flex flex-col items-center justify-center bg-[#0A0A0F] overflow-hidden">
        {/* 7 Searchlight Beams — Volumetric cones ala 20th Century Fox: dari bawah ke atas menembus haze */}
        {SEARCHLIGHT_BEAMS.map((beam, i) => (
          <div
            key={i}
            className="s1-searchlight absolute pointer-events-none"
            style={{
              bottom: 0,
              left: beam.left,
              width: "28vw",
              height: "130vh",
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${beam.rotFrom}deg)`,
              mixBlendMode: "screen",
              opacity: 0,
              background: `conic-gradient(from 180deg at 50% 100%, transparent 0deg, transparent 162deg, rgba(255, 235, 180, 0.04) 170deg, rgba(255, 240, 200, 0.18) 177deg, rgba(255, 245, 220, 0.25) 180deg, rgba(255, 240, 200, 0.18) 183deg, rgba(255, 235, 180, 0.04) 190deg, transparent 198deg, transparent 360deg)`,
              filter: "blur(28px)",
            }}
          />
        ))}

        {/* Quote Pengantar Presenter */}
        <div className="relative z-10 flex flex-col items-center justify-center px-[14vw] text-center pointer-events-none">
          <p className="s1-quote max-w-[62vw] font-display italic text-[1.95vw] leading-snug text-paper transition-opacity">
            &ldquo;Sebelum kita membedah anatomi teks di atas meja operasi, mari
            kita dengarkan pandangan Guru Besar Fakultas Ilmu Komputer Universitas
            Indonesia, Prof. Wisnu Jatmiko, mengenai mengapa tubuh ilmiah ini harus
            dilahirkan dan dipublikasikan ke dunia&hellip;&rdquo;
          </p>
          <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-ember drop-shadow-md">
            {step === 0
              ? "PENGANTAR — DIBACAKAN · [SPACE] NYALAKAN SEARCHLIGHT · [SHIFT+S] LEWATI"
              : "SEARCHLIGHT AKTIF · [SPACE] BUKA PANGGUNG · [SHIFT+S] LEWATI"}
          </p>
        </div>
      </div>

      {/* Penutup (setelah video selesai, Step 4) */}
      <div className="s1-closing absolute inset-0 z-[40] flex flex-col items-center justify-center px-[16vw] text-center opacity-0 pointer-events-none">
        <div className="backdrop-blur-[2px] bg-black/40 px-10 py-8 border border-white/5 shadow-2xl">
          <p className="max-w-[64vw] font-display italic text-[2.3vw] leading-snug text-paper/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            &ldquo;Gagasan ilmiah tidak akan pernah hidup tanpa sebuah tubuh
            tulisan yang baku.&rdquo;
          </p>
          <p className="mt-7 font-code text-[10px] tracking-[0.35em] text-ember drop-shadow-md">
            PROF. WISNU JATMIKO — PARAFRASE · [SPACE] MENUJU ANATOMI
          </p>
        </div>
      </div>
    </div>
  );
}
