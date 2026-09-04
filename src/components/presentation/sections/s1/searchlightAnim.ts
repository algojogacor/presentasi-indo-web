import { gsap } from "@/lib/gsap";
import { SEARCHLIGHT_BEAMS } from "@/data/video";

export function initSearchlights(searchlights: HTMLElement[], step: number) {
  searchlights.forEach((el, i) => {
    const cfg = SEARCHLIGHT_BEAMS[i];
    if (!cfg) return;
    const midRot = (cfg.rotFrom + cfg.rotTo) / 2;
    gsap.set(el, {
      autoAlpha: step === 1 ? 1 : 0,
      rotation: step === 1 ? midRot : cfg.rotFrom,
    });
  });
}

export function startSearchlightOscillation(searchlights: HTMLElement[]) {
  searchlights.forEach((el, i) => {
    const cfg = SEARCHLIGHT_BEAMS[i];
    if (!cfg) return;
    gsap.fromTo(
      el,
      { rotation: cfg.rotFrom },
      {
        rotation: cfg.rotTo,
        duration: cfg.dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
    );
  });
}

export function killSearchlights(searchlights: HTMLElement[]) {
  gsap.killTweensOf(searchlights);
}
