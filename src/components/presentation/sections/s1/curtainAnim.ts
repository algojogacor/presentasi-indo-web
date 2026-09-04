import { gsap } from "@/lib/gsap";
import { REST_WAVE_SCALE, PEAK_WAVE_SCALE } from "@/data/video";

export function animateCurtainOpen(
  tl: gsap.core.Timeline,
  l: HTMLElement,
  r: HTMLElement,
  frame: HTMLElement,
  updateWave: (v: number) => void,
) {
  // Panel kiri bergerak membuka
  tl.to(
    l,
    {
      xPercent: -100,
      duration: 2.4,
      ease: "power3.inOut",
    },
    0,
  );

  // Panel kanan menyusul 0.1s kemudian
  tl.to(
    r,
    {
      xPercent: 100,
      duration: 2.4,
      ease: "power3.inOut",
    },
    0.1,
  );

  const wave = { val: REST_WAVE_SCALE };
  tl.to(
    wave,
    {
      val: PEAK_WAVE_SCALE,
      duration: 1.0,
      ease: "sine.out",
      onUpdate: () => updateWave(wave.val),
    },
    0,
  );
  tl.to(
    wave,
    {
      val: REST_WAVE_SCALE,
      duration: 1.4,
      ease: "sine.inOut",
      onUpdate: () => updateWave(wave.val),
    },
    1.0,
  );

  tl.fromTo(
    frame,
    { autoAlpha: 0, scale: 0.94 },
    { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
    0.8,
  );
}

export function animateCurtainClose(
  tl: gsap.core.Timeline,
  l: HTMLElement,
  r: HTMLElement,
  frame: HTMLElement,
  closing: HTMLElement,
  updateWave: (v: number) => void,
) {
  tl.to(frame, { autoAlpha: 0.25, scale: 0.975, duration: 0.6, ease: "power1.in" });

  // Panel kiri bergerak menutup
  tl.to(
    l,
    {
      xPercent: 0,
      duration: 2.4,
      ease: "power3.inOut",
    },
    "<0.05",
  );

  // Panel kanan menyusul 0.1s kemudian
  tl.to(
    r,
    {
      xPercent: 0,
      duration: 2.4,
      ease: "power3.inOut",
    },
    "<0.1",
  );

  const wave = { val: REST_WAVE_SCALE };
  tl.to(
    wave,
    {
      val: PEAK_WAVE_SCALE,
      duration: 1.0,
      ease: "sine.out",
      onUpdate: () => updateWave(wave.val),
    },
    "<",
  );
  tl.to(
    wave,
    {
      val: REST_WAVE_SCALE,
      duration: 1.4,
      ease: "sine.inOut",
      onUpdate: () => updateWave(wave.val),
    },
    ">",
  );

  tl.fromTo(
    closing,
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" },
    "-=0.7",
  );
}
