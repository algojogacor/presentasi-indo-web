"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { usePres } from "../context";
import { Kicker } from "../atoms";
import AmbientWords from "./s8/AmbientWords";
import ConclusionStepper from "./s8/ConclusionStepper";
import ClosingCallback from "./s8/ClosingCallback";
import ThankYouCard from "./s8/ThankYouCard";
import SessionRecap from "./s8/SessionRecap";

/**
 * Section 8 — Penutup.
 * Step 0–3: empat simpulan (eksekutif, terpusat elegan dengan stepper 4 poin).
 * Step 4: kalimat pembuka kembali — kata "sudah" bernasib ember di tengah layar.
 * Step 5: kredit, terima kasih, tanya jawab — kalimat pembuka mengecil naik ke atas,
 *         disertai kartu terima kasih dan rekapitulasi sesi hidup di bawah.
 */
export default function S8Closing({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<HTMLDivElement>(null);
  const { hud } = usePres();
  const [recapDetail, setRecapDetail] = useState(false);

  // [V] — rekap sesi: rincian per pertanyaan di layar tanya jawab (step 5).
  useSectionKeys((key) => {
    if (key === "v") {
      setRecapDetail((d) => {
        hud(
          d ? "REKAP SESI — RINGKAS [V]" : "REKAP SESI — RINCIAN [V]",
          "ember",
        );
        return !d;
      });
      return true;
    }
    return false;
  });

  // Kalimat callback (Hanya aktif eksklusif di Step 4):
  useIsoLayoutEffect(() => {
    const el = callbackRef.current;
    if (!el) return;
    if (step === 4) {
      gsap.to(el, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        y: step < 4 ? 24 : -24,
        scale: 0.95,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  }, [step]);

  return (
    <div ref={root} className="absolute inset-0" data-testid="penutup">
      {/* Latar hidup — kata-kata anatomis mengapung nyaris tak terlihat */}
      <AmbientWords />

      <Kicker act="08">PENUTUP</Kicker>

      {/* Simpulan — 4 poin dari Bab 3.1 Makalah (Step 0–3) */}
      <ConclusionStepper step={step} />

      {/* Callback kalimat pembuka — "sudah" bernasib ember (Step 4 & 5) */}
      <ClosingCallback callbackRef={callbackRef} />

      {/* Kredit & tanya jawab (Step 5) */}
      {step >= 5 && <ThankYouCard />}

      {/* Rekap sesi hidup selama tanya jawab (step 5) — [V] buka rincian */}
      {step >= 5 && <SessionRecap detail={recapDetail} />}
    </div>
  );
}
