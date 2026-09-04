"use client";

import { createContext, useContext } from "react";
import type { gsap } from "gsap";

export type KeyHandler = (key: string, e: KeyboardEvent) => boolean | void;

export interface PresApi {
  section: number;
  step: number;
  /** True jika section ini pernah dikunjungi (remount = settle instan, tanpa replay). */
  settled: boolean;
  setStep: (n: number) => void;
  goto: (section: number, step?: number) => void;
  registerKeyHandler: (fn: KeyHandler | null) => void;
  registerTimeline: (tl: gsap.core.Timeline | null) => void;
  hud: (msg: string, tone?: "info" | "ember") => void;
}

export const PresCtx = createContext<PresApi | null>(null);

export function usePres(): PresApi {
  const ctx = useContext(PresCtx);
  if (!ctx) throw new Error("usePres harus dipakai di dalam <Experience>");
  return ctx;
}

/** Peta babak: jumlah langkah per section (indeks langkah 0..steps-1). */
export const SECTIONS: { label: string; steps: number }[] = [
  { label: "OUVERTURE", steps: 2 },
  { label: "GUEST LECTURER", steps: 5 },
  { label: "LATAR BELAKANG", steps: 4 },
  { label: "HAKIKAT & KARAKTERISTIK", steps: 8 },
  { label: "ANATOMY THEATER", steps: 9 },
  { label: "SESI INTERAKTIF", steps: 5 },
  { label: "VARIASI KTI", steps: 6 },
  { label: "KAIDAH & ETIKA", steps: 3 },
  { label: "PENUTUP", steps: 6 },
];
