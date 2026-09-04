"use client";

import { useRef } from "react";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";
import DocumentSheet from "./s4/DocumentSheet";
import {
  OverviewDissection,
  PrelimDissection,
  BodyDissection,
  PostDissection,
} from "./s4/DissectionViews";
import {
  animateSheetEnter,
  animatePanelTransition,
  animateRowStagger,
  animateZonesAndBab,
} from "./s4/animations";

/**
 * Section 4 — ANATOMY THEATER (centerpiece).
 * Split-screen: kiri lembar dokumen "rontgen", kanan panel bedah.
 * Step 0 overview · 1 Preliminaries · 2 Body Text · 3–7 BAB I–V (drill A–E) · 8 Postliminaries.
 */
export default function S4Anatomy({ step }: { step: number }) {
  const { setStep, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const part = step === 1 ? 1 : step >= 2 && step <= 7 ? 2 : step === 8 ? 3 : 0;
  const bab = step >= 3 && step <= 7 ? step - 3 : -1;

  useSectionKeys((key) => {
    if (key === "1") {
      setStep(1);
      return true;
    }
    if (key === "2") {
      setStep(2);
      return true;
    }
    if (key === "3") {
      setStep(8);
      return true;
    }
    const idx = ["a", "b", "c", "d", "e"].indexOf(key);
    if (idx >= 0) {
      setStep(3 + idx);
      return true;
    }
    return false;
  });

  // Lembar dokumen naik saat section ini pertama kali masuk
  useIsoLayoutEffect(() => {
    animateSheetEnter(sheetRef.current, settled);
  }, []);

  // Panel kanan: transisi halus saat berganti rongga
  useIsoLayoutEffect(() => {
    animatePanelTransition(panelRef.current, settled);
  }, [part]);

  // Baris panel muncul berurutan saat berganti rongga (bukan saat drill BAB)
  useIsoLayoutEffect(() => {
    animateRowStagger(panelRef.current, settled);
  }, [part]);

  // State rontgen: rongga terpilih menyala, dua lainnya tergeser & meredup
  useIsoLayoutEffect(() => {
    animateZonesAndBab(root.current, part, bab, settled);
  }, [part, bab, settled]);

  return (
    <div
      ref={root}
      className="absolute inset-0 px-[6vw] pt-[11vh] pb-[7vh]"
      data-testid="anatomy-theater"
    >
      <Kicker act="04">ANATOMY THEATER</Kicker>
      <BigNumeral>04</BigNumeral>

      <div className="grid h-full grid-cols-[45%_55%] items-center gap-[2.5vw]">
        {/* ============ KIRI — lembar rontgen ============ */}
        <DocumentSheet sheetRef={sheetRef} />

        {/* ============ KANAN — panel bedah ============ */}
        <div
          ref={panelRef}
          className="max-h-[70vh] overflow-y-auto pr-1"
          data-part={part}
        >
          {part === 0 && <OverviewDissection />}
          {part === 1 && <PrelimDissection />}
          {part === 2 && <BodyDissection bab={bab} />}
          {part === 3 && <PostDissection />}
        </div>
      </div>
    </div>
  );
}
