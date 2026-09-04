"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { usePres } from "../context";
import { useIsoLayoutEffect } from "../hooks";
import { SplitChars } from "../atoms";

const SENTENCE =
  "Setiap karya ilmiah punya tubuh. Hari ini kita bedah anatominya.";

/**
 * Section 0 — Opening Cinematic.
 * Step 0: Halaman Ouverture sinematik (~15vw "OUVERTURE", kicker "ANATOMI KARYA TULIS ILMIAH",
 *         garis amber 100px, staggered fade-in 2s, diam 2s, fade-out ke hitam, auto-play ke Step 1).
 * Step 1: Kalimat scramble → jeda 1.2s → judul per karakter + dentum sub-bass → kredit.
 */
export default function S0Opening({ step }: { step: number }) {
  const { settled, registerTimeline, setStep } = usePres();
  const root = useRef<HTMLDivElement>(null);
  const ouvertureRef = useRef<HTMLDivElement>(null);

  // State awal sebelum cat pertama — set semuanya tersembunyi
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    const sentence = q.querySelector<HTMLElement>(".s0-sentence");
    const chars = q.querySelectorAll<HTMLElement>("[data-char]");
    const credits = q.querySelectorAll<HTMLElement>(".s0-credit");
    gsap.set(sentence, { autoAlpha: 0 });
    gsap.set(chars, { yPercent: 112, autoAlpha: 0 });
    gsap.set(credits, { autoAlpha: 0, y: 16 });
  }, []);

  // Timeline Ouverture (Step 0) — auto-play & auto-lanjut
  useIsoLayoutEffect(() => {
    if (step !== 0) return;
    const el = ouvertureRef.current;
    if (!el) return;

    if (settled) {
      // Kembali ke opening setelah presentasi berjalan → langsung ke step 1
      setStep(1);
      return;
    }

    const kicker = el.querySelector<HTMLElement>(".ou-kicker");
    const line = el.querySelector<HTMLElement>(".ou-line");
    const title = el.querySelector<HTMLElement>(".ou-title");
    if (!kicker || !line || !title) return;

    // Set awal tersembunyi di bawah
    gsap.set([kicker, line, title], { autoAlpha: 0, y: 32 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Otomatis lanjut ke Section 0 (Step 1)
        audio.init();
        setStep(1);
      },
    });

    // 1. Animasi masuk: semua elemen fade in staggered dari bawah, total durasi ~2 detik
    tl.to(
      kicker,
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: "power2.out",
      },
      0,
    );

    tl.to(
      line,
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.0,
        ease: "power2.out",
      },
      0.28,
    );

    tl.to(
      title,
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.35,
        ease: "power3.out",
      },
      0.55,
    );

    // 2. Diam selama 2 detik penuh setelah semua elemen masuk
    tl.to({}, { duration: 2.0 });

    // 3. Kemudian fade out ke hitam, baru masuk Section 0 (Step 1)
    tl.to(el, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [step, settled, setStep]);

  // Timeline opening berjalan saat memasuki step 1
  useIsoLayoutEffect(() => {
    if (step !== 1) return;
    const q = root.current;
    if (!q) return;
    const sentence = q.querySelector<HTMLElement>(".s0-sentence")!;
    const chars = q.querySelectorAll<HTMLElement>("[data-char]");
    const credits = q.querySelectorAll<HTMLElement>(".s0-credit");

    if (settled) {
      // Kembali ke opening setelah presentasi berjalan → tampil final, tanpa replay
      gsap.set(sentence, { autoAlpha: 0.22, top: "12%" });
      gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      gsap.set(credits, { autoAlpha: 1, y: 0 });
      sentence.textContent = SENTENCE;
      registerTimeline(null);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.set(sentence, { text: "" });
    tl.to(sentence, { autoAlpha: 1, duration: 0.01 });
    tl.to(sentence, {
      scrambleText: {
        text: SENTENCE,
        chars: "aeioukmnrst ",
        speed: 0.35,
        revealDelay: 0.25,
      },
      duration: 2.4,
      ease: "none",
    });
    tl.to({}, { duration: 1.2 }); // jeda — hening sebelum judul
    // Kalimat terangkat ke slot atas (19%) agar tidak menumpuk judul besar
    tl.to(sentence, {
      autoAlpha: 0.22,
      top: "12%",
      duration: 0.9,
      ease: "power2.inOut",
    });
    tl.fromTo(
      chars,
      { yPercent: 112, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.035 },
      "<0.35",
    );
    tl.add(() => audio.thump(), "<"); // dentum sub-bass saat judul lahir
    tl.fromTo(
      credits,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
      "-=0.3",
    );
    tl.add(() => registerTimeline(null));
    registerTimeline(tl);
    return () => {
      tl.kill();
      registerTimeline(null);
    };
  }, [step]);

  return (
    <div
      ref={root}
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
    >
      {/* Halaman Ouverture (Step 0) — layar hitam penuh, auto-play & auto-lanjut */}
      {step === 0 && (
        <div
          ref={ouvertureRef}
          className="pointer-events-none fixed inset-0 z-[75] flex flex-col items-center justify-center bg-[#0A0A0F] select-none"
          aria-hidden="true"
        >
          {/* Teks kecil di atas: IBM Plex Mono, #E8A020, letter-spacing lebar */}
          <span
            className="ou-kicker font-code text-xs md:text-sm uppercase tracking-[0.5em] text-[#E8A020]"
            style={{ color: "#E8A020" }}
          >
            ANATOMI KARYA TULIS ILMIAH
          </span>

          {/* Garis amber tipis (~100px) di antara keduanya */}
          <div
            className="ou-line my-[2.5vh] h-[1px] w-[100px] bg-[#E8A020]"
            style={{ width: "100px", height: "1px", backgroundColor: "#E8A020" }}
            aria-hidden="true"
          />

          {/* Teks utama: "OUVERTURE" ~15vw, font Cormorant Garamond, warna #F0EDE8 */}
          <h1
            className="ou-title font-display text-[15vw] font-normal leading-[0.88] tracking-wide text-[#F0EDE8] text-center select-none"
            style={{ color: "#F0EDE8" }}
          >
            OUVERTURE
          </h1>
        </div>
      )}

      <p
        aria-label={SENTENCE}
        className="s0-sentence absolute top-[38%] left-1/2 w-[72vw] -translate-x-1/2 text-center font-display text-[2.5vw] italic leading-snug text-paper/90 opacity-0"
      />

      <h1 className="text-center leading-[0.95]">
        <span className="block font-display font-semibold text-[9vw] tracking-[0.02em] text-paper">
          <SplitChars text="ANATOMI" />
        </span>
        <span className="mt-[0.6vw] block font-display italic font-medium text-[3.1vw] text-paper/85">
          <SplitChars text="Karya Tulis Ilmiah" />
        </span>
      </h1>

      <div className="mt-[4.5vw] flex flex-col items-center gap-[0.9vw]">
        <p className="s0-credit font-code text-[11px] tracking-[0.45em] text-paper/70 opacity-0">
          KELOMPOK 6 — PDB 93
        </p>
        <p className="s0-credit font-code text-[10px] tracking-[0.3em] text-mute opacity-0">
          UNIVERSITAS AIRLANGGA · 2026
        </p>
      </div>
    </div>
  );
}
