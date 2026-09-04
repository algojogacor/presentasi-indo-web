"use client";

import { useCallback, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { audioManager } from "@/lib/audioManager";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { SplitChars } from "../atoms";

const SENTENCE =
  "Setiap karya ilmiah punya tubuh. Hari ini kita bedah anatominya.";

export default function S0Opening({ step }: { step: number }) {
  const { settled, registerTimeline, setStep } = usePres();
  const root = useRef<HTMLDivElement>(null);
  const ouvertureRef = useRef<HTMLDivElement>(null);
  const [ouStarted, setOuStarted] = useState(false);
  const ouTlRef = useRef<gsap.core.Timeline | null>(null);

  // Mulai sekuens Ouverture setelah ada interaksi (Space/klik)
  const startOuverture = useCallback(() => {
    if (ouStarted) {
      // Jika sudah berjalan dan ditekan lagi -> percepat langsung ke Step 1
      ouTlRef.current?.progress(1);
      return;
    }
    setOuStarted(true);
    audioManager.init();
    audioManager.playOuverture();

    const el = ouvertureRef.current;
    if (!el) return;

    const kicker = el.querySelector<HTMLElement>(".ou-kicker");
    const line = el.querySelector<HTMLElement>(".ou-line");
    const title = el.querySelector<HTMLElement>(".ou-title");
    const prompt = el.querySelector<HTMLElement>(".ou-prompt");

    const tl = gsap.timeline({
      onComplete: () => {
        audioManager.fadeOutOuverture(1.2);
        setStep(1);
      },
    });
    ouTlRef.current = tl;

    if (prompt) tl.to(prompt, { autoAlpha: 0, duration: 0.4 }, 0);
    tl.to(kicker, { y: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0.2);
    tl.to(line, { y: 0, autoAlpha: 1, duration: 1.0, ease: "power2.out" }, 0.45);
    tl.to(title, { y: 0, autoAlpha: 1, duration: 1.3, ease: "power3.out" }, 0.7);
    tl.to({}, { duration: 6.5 }); // tahan menikmati ambiens teater sebelum pertunjukan
    tl.to(el, { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" });
  }, [ouStarted, setStep]);

  useSectionKeys((k) => {
    if (step === 0 && (k === " " || k === "ArrowRight" || k === "Enter")) {
      startOuverture();
      return true;
    }
    return false;
  });

  // State awal instan sebelum render
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    gsap.set(q.querySelector(".s0-sentence"), { autoAlpha: 0 });
    gsap.set(q.querySelectorAll("[data-char]"), { yPercent: 112, autoAlpha: 0 });
    gsap.set(q.querySelectorAll(".s0-credit"), { autoAlpha: 0, y: 16 });
  }, []);

  // Inisialisasi visual Ouverture (Step 0)
  useIsoLayoutEffect(() => {
    if (step !== 0) return;
    if (settled) {
      setStep(1);
      return;
    }
    const el = ouvertureRef.current;
    if (!el) return;
    const kicker = el.querySelector<HTMLElement>(".ou-kicker");
    const line = el.querySelector<HTMLElement>(".ou-line");
    const title = el.querySelector<HTMLElement>(".ou-title");
    gsap.set([kicker, line, title], { autoAlpha: 0.4, y: 0 });
  }, [step, settled, setStep]);

  // Timeline Step 1 (Cinematic Opening + Drone + Sub-bass)
  useIsoLayoutEffect(() => {
    if (step !== 1) return;
    const q = root.current;
    if (!q) return;
    const sentence = q.querySelector<HTMLElement>(".s0-sentence")!;
    const chars = q.querySelectorAll<HTMLElement>("[data-char]");
    const credits = q.querySelectorAll<HTMLElement>(".s0-credit");

    if (settled) {
      gsap.set(sentence, { autoAlpha: 0.22, top: "12%" });
      gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      gsap.set(credits, { autoAlpha: 1, y: 0 });
      sentence.textContent = SENTENCE;
      registerTimeline(null);
      return;
    }

    audioManager.playDrone();

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
    tl.to({}, { duration: 1.2 });
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
    tl.add(() => audio.thump(), "<"); // Sub-bass saat judul terlahir
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
      audioManager.fadeOutDrone(1.5);
    };
  }, [step, settled, registerTimeline]);

  return (
    <div
      ref={root}
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
    >
      {step === 0 && (
        <div
          ref={ouvertureRef}
          onClick={startOuverture}
          className="fixed inset-0 z-[75] flex cursor-pointer flex-col items-center justify-center bg-[#0A0A0F] select-none"
        >
          <span className="ou-kicker font-code text-xs md:text-sm uppercase tracking-[0.5em] text-[#E8A020]">
            ANATOMI KARYA TULIS ILMIAH
          </span>
          <div className="ou-line my-[2.5vh] h-[1px] w-[100px] bg-[#E8A020]" />
          <h1 className="ou-title font-display text-[15vw] font-normal leading-[0.88] tracking-wide text-[#F0EDE8] text-center">
            OUVERTURE
          </h1>
          {!ouStarted && (
            <div className="ou-prompt mt-[4vh] flex items-center gap-2 rounded-full border border-[#E8A020]/30 bg-[#111118]/90 px-4 py-1.5 font-code text-xs tracking-wider text-[#E8A020]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-pulse" />
              <span>TEKAN SPASI UNTUK MEMULAI</span>
            </div>
          )}
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
