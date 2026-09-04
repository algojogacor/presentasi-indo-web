"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePres } from "../context";
import { useIsoLayoutEffect } from "../hooks";
import CurtainFilterSvg from "./s1/CurtainFilterSvg";
import Curtains from "./s1/Curtains";
import VideoFrame from "./s1/VideoFrame";
import { OpeningQuote, ClosingQuote } from "./s1/QuoteLayers";
import { initS1State, animateS1Step } from "./s1/animations";

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
    initS1State(root.current, step);
  }, []);

  // Mesin transisi langkah GSAP
  useIsoLayoutEffect(() => {
    animateS1Step(root.current, step, settled, registerTimeline);

    return () => {
      if (root.current) {
        const searchlights = root.current.querySelectorAll<HTMLElement>(".s1-searchlight");
        gsap.killTweensOf(searchlights);
      }
      registerTimeline(null);
    };
  }, [step, settled, registerTimeline]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden select-none">
      {/* SVG Filters untuk gelombang & tekstur lipatan kain beludru dramatis */}
      <CurtainFilterSvg />

      {/* Frame siaran langsung (YouTube) */}
      <VideoFrame step={step} />

      {/* Tirai Panel Kiri & Kanan */}
      <Curtains />

      {/* Layer Hitam Panggung & 7 Searchlight Beams */}
      <OpeningQuote step={step} />

      {/* Penutup (setelah video selesai, Step 4) */}
      <ClosingQuote />
    </div>
  );
}
