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
 * Step 0: gerbang redup (menunggu [SPACE] — sekaligus membuka izin audio).
 * Step 1: kalimat scamble → jeda 1.2s → judul per karakter + dentum sub-bass → kredit.
 */
export default function S0Opening({ step }: { step: number }) {
  const { settled, registerTimeline, setStep } = usePres();
  const root = useRef<HTMLDivElement>(null);

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
      {/* Cahaya panggung samar — hanya di gerbang awal */}
      {step === 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 38% at 50% -12%, rgba(232,160,32,0.06), transparent 70%)",
          }}
        />
      )}

      {step === 0 && (
        <div className="relative flex flex-col items-center gap-[2vw] px-[5vw] py-[3.2vw]">
          {/* Bingkai panggung — bracket sudut bernafas */}
          <span
            aria-hidden
            className="gate-bracket absolute -top-3 -left-3 h-4 w-4 border-t border-l border-ember/50"
          />
          <span
            aria-hidden
            className="gate-bracket absolute -top-3 -right-3 h-4 w-4 border-t border-r border-ember/50"
          />
          <span
            aria-hidden
            className="gate-bracket absolute -bottom-3 -left-3 h-4 w-4 border-b border-l border-ember/50"
          />
          <span
            aria-hidden
            className="gate-bracket absolute -bottom-3 -right-3 h-4 w-4 border-b border-r border-ember/50"
          />

          <p className="font-code text-[10px] tracking-[0.5em] text-mute">
            ANATOMI KARYA TULIS ILMIAH
          </p>
          <span
            aria-hidden
            className="h-px w-[16vw] bg-gradient-to-r from-transparent via-edge to-transparent"
          />
          <button
            type="button"
            onClick={() => {
              audio.init();
              setStep(1);
            }}
            onKeyDown={(e) => {
              // Space pada tombol jangan dobel-trigger dengan handler global
              if (e.key === " ") e.stopPropagation();
            }}
            className="font-code text-[11px] tracking-[0.4em] text-ember/70 animate-pulse transition-colors duration-300 hover:text-ember"
            aria-label="Tekan Space untuk memulai"
          >
            [ SPACE ] — MULAI
          </button>
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
