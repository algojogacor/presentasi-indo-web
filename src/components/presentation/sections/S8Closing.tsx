"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { usePres } from "../context";
import { Kicker } from "../atoms";
import AmbientWords from "./s8/AmbientWords";
import ConclusionStepper from "./s8/ConclusionStepper";
import VerdictCards from "./s8/VerdictCards";
import ClosingCallback from "./s8/ClosingCallback";
import ThankYouCard from "./s8/ThankYouCard";
import SessionRecap from "./s8/SessionRecap";
import PostliminariesSlide from "./s8/PostliminariesSlide";
import AppendixSlide from "./s8/AppendixSlide";

/**
 * Section 8 — Penutup (BAB III Makalah).
 *
 * Alur Pacing Teatrikal (9 Langkah):
 * - Step 0–3: Empat simpulan eksekutif (Sub-bab 3.1 Makalah).
 * - Step 4: The Verdict — Dua Kartu Rekomendasi/Saran (Sub-bab 3.2 Makalah).
 * - Step 5: Callback kalimat pembuka — kata "sudah" bernasib ember di tengah layar.
 * - Step 6: Kredit, terima kasih, tanya jawab & rekapitulasi interaktif live.
 * - Step 7: Postliminaries — Lembaran Daftar Pustaka Lengkap (12 Rujukan Baku).
 * - Step 8: Postliminaries — Lampiran & Naskah Lengkap (QR Code + Dokumen Asli).
 */
export default function S8Closing({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<HTMLDivElement>(null);
  const { hud } = usePres();
  const [recapDetail, setRecapDetail] = useState(false);

  // [V] — rekap sesi: rincian per pertanyaan di layar tanya jawab (step 6).
  useSectionKeys((key) => {
    if (key === "v" && step === 6) {
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

  // Kalimat callback (Hanya aktif eksklusif di Step 5):
  useIsoLayoutEffect(() => {
    const el = callbackRef.current;
    if (!el) return;
    if (step === 5) {
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
        y: step < 5 ? 24 : -24,
        scale: 0.95,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  }, [step]);

  const kickerText =
    step < 4
      ? "PENUTUP · SIMPULAN"
      : step === 4
        ? "PENUTUP · REKOMENDASI"
        : step === 7
          ? "PENUTUP · POSTLIMINARIES"
          : step === 8
            ? "PENUTUP · LAMPIRAN"
            : "PENUTUP";

  return (
    <div ref={root} className="absolute inset-0" data-testid="penutup">
      {/* Latar hidup — kata-kata anatomis mengapung nyaris tak terlihat */}
      <AmbientWords />

      <Kicker act="08">{kickerText}</Kicker>

      {/* Simpulan — 4 poin dari Bab 3.1 Makalah (Step 0–3) */}
      <ConclusionStepper step={step} />

      {/* Putusan Saran — 2 kartu rekomendasi Sub-bab 3.2 Makalah (Step 4) */}
      <VerdictCards active={step === 4} />

      {/* Callback kalimat pembuka — "sudah" bernasib ember (Step 5) */}
      <ClosingCallback callbackRef={callbackRef} />

      {/* Kredit & tanya jawab (Step 6) */}
      {step === 6 && <ThankYouCard />}

      {/* Rekap sesi hidup selama tanya jawab (step 6) — [V] buka rincian */}
      {step === 6 && <SessionRecap detail={recapDetail} />}

      {/* Postliminaries — Daftar Pustaka Lengkap 12 Rujukan (Step 7) */}
      <PostliminariesSlide active={step === 7} />

      {/* Postliminaries — Lampiran Resmi & Dokumen Asli (Step 8) */}
      {step === 8 && <AppendixSlide />}
    </div>
  );
}
