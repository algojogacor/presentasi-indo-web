"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { EffectCallback, DependencyList } from "react";
import { gsap } from "@/lib/gsap";
import { usePres, type KeyHandler } from "./context";

// Build SSR Turbopack (react-ssr) tidak mengekspor useLayoutEffect untuk modul
// "use client" — jadi semua effect memakai useEffect (dibungkus fungsi agar
// tidak di-alias-kan Turbopack ke binding react). State awal tersembunyi
// ditangani kelas CSS ([data-step], [data-char], .opacity-0) agar tidak ada
// flash satu frame sebelum GSAP mengoverride inline.
export function useIsoLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList | undefined,
): void {
  useEffect(effect, deps);
}

const INIT_BY_KIND: Record<string, gsap.TweenVars> = {
  clip: { autoAlpha: 0, clipPath: "inset(100% 0 0 0)" },
  rise: { autoAlpha: 0, y: 18 },
};
const FINAL_BY_KIND: Record<string, gsap.TweenVars> = {
  clip: { autoAlpha: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
  rise: { autoAlpha: 1, y: 0 },
};

/**
 * Mesin reveal berbasis langkah.
 * - Elemen `[data-step="k"]` kumulatif: tampil saat step >= k.
 * - Elemen `[data-step="k"][data-exclusive]`: hanya tampil saat step === k.
 * - `data-reveal="clip"` → clip-path dari bawah; selain itu fade + rise.
 * Mount di tengah section (jump / kembali) = settle instan untuk semua elemen
 * yang seharusnya terlihat — tanpa memutar ulang animasi.
 */
export function useStepReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  step: number,
): void {
  const prevStep = useRef(-1);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const isMount = prevStep.current === -1;
    for (const el of els) {
      const k = Number(el.dataset.step ?? "0");
      const kind = el.dataset.reveal === "clip" ? "clip" : "rise";
      const exclusive = el.hasAttribute("data-exclusive");
      if (exclusive) {
        if (step === k) {
          if (isMount) gsap.set(el, FINAL_BY_KIND[kind]);
          else
            gsap.fromTo(el, INIT_BY_KIND[kind], {
              ...FINAL_BY_KIND[kind],
              duration: 0.6,
              delay: 0.16,
              ease: "power3.out",
              overwrite: "auto",
            });
        } else if (prevStep.current === k) {
          gsap.to(el, {
            autoAlpha: 0,
            y: -14,
            duration: 0.28,
            ease: "power1.in",
            overwrite: "auto",
          });
        } else {
          gsap.set(el, INIT_BY_KIND[kind]);
        }
        continue;
      }
      if (step >= k) {
        if (isMount) gsap.set(el, FINAL_BY_KIND[kind]);
        else if (k > prevStep.current)
          gsap.fromTo(el, INIT_BY_KIND[kind], {
            ...FINAL_BY_KIND[kind],
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
          });
        // else: sudah tampil → biarkan
      } else {
        gsap.set(el, INIT_BY_KIND[kind]);
      }
    }
    prevStep.current = step;
  }, [step, ref]);
}

/** Registrasi handler keyboard khusus section (1/2/3, A–E, B, F, R, dst). */
export function useSectionKeys(handler: KeyHandler): void {
  const { registerKeyHandler } = usePres();
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    const fn: KeyHandler = (k, e) => ref.current(k, e);
    registerKeyHandler(fn);
    return () => registerKeyHandler(null);
  }, [registerKeyHandler]);
}
