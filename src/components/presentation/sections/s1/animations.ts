import { gsap } from "@/lib/gsap";
import { audioManager } from "@/lib/audioManager";
import {
  REST_WAVE_SCALE,
  SEARCHLIGHT_BEAMS,
} from "@/data/video";
import {
  initSearchlights,
  startSearchlightOscillation,
  killSearchlights,
} from "./searchlightAnim";
import { animateCurtainOpen, animateCurtainClose } from "./curtainAnim";

export interface S1DOMElements {
  blackLayer: HTMLElement | null;
  searchlights: HTMLElement[];
  quote: HTMLElement | null;
  l: HTMLElement | null;
  r: HTMLElement | null;
  closing: HTMLElement | null;
  frame: HTMLElement | null;
  dispL: SVGElement | null;
  dispR: SVGElement | null;
}

export function queryS1Elements(root: HTMLElement): S1DOMElements {
  return {
    blackLayer: root.querySelector<HTMLElement>(".s1-black-layer"),
    searchlights: Array.from(root.querySelectorAll<HTMLElement>(".s1-searchlight")),
    quote: root.querySelector<HTMLElement>(".s1-quote"),
    l: root.querySelector<HTMLElement>(".s1-curtain-l"),
    r: root.querySelector<HTMLElement>(".s1-curtain-r"),
    closing: root.querySelector<HTMLElement>(".s1-closing"),
    frame: root.querySelector<HTMLElement>(".s1-frame"),
    dispL: root.querySelector<SVGElement>("#disp-l"),
    dispR: root.querySelector<SVGElement>("#disp-r"),
  };
}

export function setWaveScale(
  dispL: SVGElement | null,
  dispR: SVGElement | null,
  val: number,
) {
  dispL?.setAttribute("scale", String(val));
  dispR?.setAttribute("scale", String(val));
}

export function initS1State(root: HTMLElement | null, step: number) {
  if (!root) return;
  const { blackLayer, searchlights, quote, l, r, closing, frame } =
    queryS1Elements(root);

  if (step <= 1) {
    gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
    initSearchlights(searchlights, step);
    gsap.set(quote, { autoAlpha: step === 1 ? 1 : 0.52 });
    gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
  } else {
    gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
    gsap.set([l, r], {
      xPercent: (i: number) => (step >= 3 && step !== 4 ? (i === 0 ? -100 : 100) : 0),
      autoAlpha: 1,
    });
  }
  gsap.set(closing, { autoAlpha: step === 4 ? 1 : 0 });
  gsap.set(frame, { autoAlpha: 1, scale: 1 });
}

export function animateS1Step(
  root: HTMLElement | null,
  step: number,
  settled: boolean,
  registerTimeline: (tl: gsap.core.Timeline | null) => void,
) {
  if (!root) return;
  const {
    blackLayer,
    searchlights,
    quote,
    l,
    r,
    closing,
    frame,
    dispL,
    dispR,
  } = queryS1Elements(root);

  if (!blackLayer || !searchlights.length || !quote || !l || !r || !closing || !frame) {
    return;
  }

  const updateWave = (val: number) => setWaveScale(dispL, dispR, val);

  // Step 0: Layar hitam penuh (#0A0A0F) + quote redup, searchlight mati
  if (step === 0) {
    killSearchlights(searchlights);
    if (settled) {
      gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
      searchlights.forEach((el, i) => {
        const cfg = SEARCHLIGHT_BEAMS[i];
        if (!cfg) return;
        gsap.set(el, { autoAlpha: 0, rotation: cfg.rotFrom });
      });
      gsap.set(quote, { autoAlpha: 0.52 });
      gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
      gsap.set(closing, { autoAlpha: 0 });
      gsap.set(frame, { autoAlpha: 1, scale: 1 });
      updateWave(REST_WAVE_SCALE);
    } else {
      const tl = gsap.timeline();
      tl.to(blackLayer, { y: 0, autoAlpha: 1, duration: 0.4 });
      tl.to(searchlights, { autoAlpha: 0, duration: 0.4 }, "<");
      tl.to(quote, { autoAlpha: 0.52, duration: 0.4 }, "<");
      tl.set([l, r], { xPercent: 0, autoAlpha: 0 });
      tl.set(closing, { autoAlpha: 0 });
      registerTimeline(tl);
    }
  }
  // Step 1: 7 searchlight beams fade in staggered, lalu berosilasi asinkron
  else if (step === 1) {
    killSearchlights(searchlights);

    if (settled) {
      gsap.set(blackLayer, { y: 0, autoAlpha: 1 });
      searchlights.forEach((el, i) => {
        const cfg = SEARCHLIGHT_BEAMS[i];
        if (!cfg) return;
        const midRot = (cfg.rotFrom + cfg.rotTo) / 2;
        gsap.set(el, { autoAlpha: 1, rotation: midRot });
      });
      gsap.set(quote, { autoAlpha: 1 });
      gsap.set([l, r], { xPercent: 0, autoAlpha: 0 });
      gsap.set(closing, { autoAlpha: 0 });
      startSearchlightOscillation(searchlights);
    } else {
      audioManager.playSearchlight();
      const tl = gsap.timeline({
        onComplete: () => startSearchlightOscillation(searchlights),
      });
      tl.set(blackLayer, { y: 0, autoAlpha: 1 });

      searchlights.forEach((el, i) => {
        const cfg = SEARCHLIGHT_BEAMS[i];
        if (!cfg) return;
        gsap.set(el, { rotation: cfg.rotFrom, autoAlpha: 0 });
      });

      tl.to(
        searchlights,
        {
          autoAlpha: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power1.out",
        },
        0,
      );

      tl.to(
        quote,
        {
          autoAlpha: 1,
          duration: 1,
          ease: "power2.out",
        },
        0,
      );
      registerTimeline(tl);
    }
  }
  // Step 2: Layer hitam "runtuh" ke bawah (y: 110vh, 0.9s, power3.in) → tirai merah tertutup terlihat
  else if (step === 2) {
    killSearchlights(searchlights);
    if (settled) {
      gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
      gsap.set([l, r], { xPercent: 0, autoAlpha: 1 });
      gsap.set(closing, { autoAlpha: 0 });
      gsap.set(frame, { autoAlpha: 1, scale: 1 });
      updateWave(REST_WAVE_SCALE);
    } else {
      const tl = gsap.timeline();
      tl.set([l, r], { xPercent: 0, autoAlpha: 0 });
      tl.to(blackLayer, {
        y: "110vh",
        duration: 0.9,
        ease: "power3.in",
      });
      tl.to(
        [l, r],
        {
          autoAlpha: 1,
          duration: 0.45,
          ease: "power1.out",
        },
        "0.1",
      );
      tl.set(blackLayer, { autoAlpha: 0 });
      registerTimeline(tl);
    }
  }
  // Step 3: Tirai beludru membuka → YouTube aktif
  else if (step === 3) {
    killSearchlights(searchlights);
    if (settled) {
      gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
      gsap.set(l, { xPercent: -100, autoAlpha: 1 });
      gsap.set(r, { xPercent: 100, autoAlpha: 1 });
      gsap.set(closing, { autoAlpha: 0 });
      gsap.set(frame, { autoAlpha: 1, scale: 1 });
      updateWave(REST_WAVE_SCALE);
    } else {
      const tl = gsap.timeline();
      tl.set(blackLayer, { y: "110vh", autoAlpha: 0 });
      tl.set([l, r], { autoAlpha: 1 });
      tl.add(() => audioManager.playCurtain(), 0);
      animateCurtainOpen(tl, l, r, frame, updateWave);
      registerTimeline(tl);
    }
  }
  // Step 4: Tirai menutup kembali + kalimat penutup tampil
  else if (step === 4) {
    killSearchlights(searchlights);
    if (settled) {
      gsap.set(blackLayer, { y: "110vh", autoAlpha: 0 });
      gsap.set([l, r], { xPercent: 0, autoAlpha: 1 });
      gsap.set(closing, { autoAlpha: 1, y: 0 });
      gsap.set(frame, { autoAlpha: 1, scale: 1 });
      updateWave(REST_WAVE_SCALE);
    } else {
      const tl = gsap.timeline();
      animateCurtainClose(tl, l, r, frame, closing, updateWave);
      registerTimeline(tl);
    }
  }
}
