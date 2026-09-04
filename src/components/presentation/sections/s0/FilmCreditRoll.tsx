"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "../../hooks";
import {
  DOSEN_PENGAMPU,
  TEAM_CREDIT_LABEL,
  MEMBERS_LEFT,
  MEMBERS_RIGHT,
  PRODI_LABEL,
} from "./creditData";

interface FilmCreditRollProps {
  active: boolean;
  settled: boolean;
  registerTimeline: (tl: gsap.core.Timeline | null) => void;
}

export default function FilmCreditRoll({
  active,
  settled,
  registerTimeline,
}: FilmCreditRollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const dosenName = el.querySelector<HTMLElement>(".credit-dosen-name");
    const memberNames = el.querySelectorAll<HTMLElement>(".credit-member-name");

    const applySettledStyles = () => {
      dosenName?.classList.add("credit-settled-dosen");
      memberNames.forEach((m) => m.classList.add("credit-settled-member"));
    };

    const removeSettledStyles = () => {
      dosenName?.classList.remove("credit-settled-dosen");
      memberNames.forEach((m) => m.classList.remove("credit-settled-member"));
    };

    if (!active) {
      gsap.set(el, { autoAlpha: 0, y: 30 });
      removeSettledStyles();
      return;
    }

    if (settled) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      gsap.set(el.querySelectorAll(".credit-item"), { autoAlpha: 1, y: 0, scaleX: 1 });
      applySettledStyles();
      registerTimeline(null);
      return;
    }

    // Sequence Animasi Film Credit Roll
    removeSettledStyles();
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        applySettledStyles();
        registerTimeline(null);
      },
    });

    const dosenLabel = el.querySelector<HTMLElement>(".credit-dosen-label");
    const dosenBox = el.querySelector<HTMLElement>(".credit-dosen-box");
    const separator = el.querySelector<HTMLElement>(".credit-separator");
    const teamLabel = el.querySelector<HTMLElement>(".credit-team-label");
    const memberItems = el.querySelectorAll<HTMLElement>(".credit-member-item");
    const prodi = el.querySelector<HTMLElement>(".credit-prodi");

    // Fade & slide in root
    tl.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);

    // 1. Dosen label
    if (dosenLabel) {
      tl.fromTo(dosenLabel, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.15);
    }

    // 2. Dosen nama & NIP + Gold Shimmer sweep
    if (dosenBox) {
      tl.fromTo(dosenBox, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.3);
    }
    if (dosenName) {
      tl.fromTo(
        dosenName,
        { backgroundPosition: "150% 0" },
        {
          backgroundPosition: "-50% 0",
          duration: 1.0,
          ease: "power2.out",
          onComplete: () => dosenName.classList.add("credit-settled-dosen"),
        },
        0.3,
      );
    }

    // 3. Separator line
    if (separator) {
      tl.fromTo(
        separator,
        { autoAlpha: 0, scaleX: 0 },
        { autoAlpha: 1, scaleX: 1, duration: 0.45, ease: "power2.out" },
        0.48,
      );
    }

    // 4. Tim label
    if (teamLabel) {
      tl.fromTo(teamLabel, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.62);
    }

    // 5. 6 Anggota satu per satu (interval 0.15s) + Shimmer sweep
    memberItems.forEach((mItem, idx) => {
      const startTime = 0.76 + idx * 0.15;
      const mName = mItem.querySelector<HTMLElement>(".credit-member-name");

      tl.fromTo(
        mItem,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.48, ease: "power2.out" },
        startTime,
      );

      if (mName) {
        tl.fromTo(
          mName,
          { backgroundPosition: "150% 0" },
          {
            backgroundPosition: "-50% 0",
            duration: 0.85,
            ease: "power2.out",
            onComplete: () => mName.classList.add("credit-settled-member"),
          },
          startTime,
        );
      }
    });

    // 6. Label Program Studi muncul terakhir
    if (prodi) {
      tl.fromTo(
        prodi,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" },
        1.75,
      );
    }

    registerTimeline(tl);

    return () => {
      tl.kill();
      registerTimeline(null);
    };
  }, [active, settled, registerTimeline]);

  return (
    <div
      ref={containerRef}
      className={`s0-credit-roll mt-[2.8vh] flex flex-col items-center text-center transition-opacity ${
        active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Baris Dosen Pengampu */}
      <span className="credit-item credit-dosen-label font-code text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#6B6B7A]">
        {DOSEN_PENGAMPU.label}
      </span>

      <div className="credit-item credit-dosen-box mt-[0.5vh] flex flex-col items-center">
        <span className="credit-dosen-name credit-shimmer-dosen font-display italic font-medium text-[clamp(1.25rem,1.8vw,1.85rem)]">
          {DOSEN_PENGAMPU.name}
        </span>
        <span className="font-code text-[11px] tracking-wider text-[#4A4A5A] mt-[0.2vh]">
          {DOSEN_PENGAMPU.nip}
        </span>
      </div>

      {/* Garis Separator */}
      <div className="credit-item credit-separator my-[1.8vh] h-[1px] w-[200px] bg-[rgba(232,160,32,0.2)] origin-center" />

      {/* Label Tim Penyusun */}
      <span className="credit-item credit-team-label font-code text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#6B6B7A]">
        {TEAM_CREDIT_LABEL}
      </span>

      {/* 6 Anggota dalam Dua Kolom (3 kiri, 3 kanan) */}
      <div className="mt-[1.3vh] grid grid-cols-2 gap-x-[5vw] gap-y-[1.1vh] text-left">
        {/* Kolom Kiri */}
        <div className="flex flex-col gap-[1.1vh]">
          {MEMBERS_LEFT.map((m) => (
            <div
              key={m.nim}
              className="credit-item credit-member-item flex flex-col"
            >
              <span className="credit-member-name credit-shimmer-member font-display text-[clamp(0.95rem,1.4vw,1.45rem)]">
                {m.name}
              </span>
              <span className="font-code text-[10px] tracking-wider text-[#4A4A5A]">
                {m.nim}
              </span>
            </div>
          ))}
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-[1.1vh]">
          {MEMBERS_RIGHT.map((m) => (
            <div
              key={m.nim}
              className="credit-item credit-member-item flex flex-col"
            >
              <span className="credit-member-name credit-shimmer-member font-display text-[clamp(0.95rem,1.4vw,1.45rem)]">
                {m.name}
              </span>
              <span className="font-code text-[10px] tracking-wider text-[#4A4A5A]">
                {m.nim}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Program Studi Footer */}
      <p className="credit-item credit-prodi mt-[2.6vh] font-code text-[9px] md:text-[10px] tracking-[0.32em] text-[#4A4A5A] uppercase text-center max-w-[85vw]">
        {PRODI_LABEL}
      </p>
    </div>
  );
}
