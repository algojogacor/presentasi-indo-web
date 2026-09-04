import { gsap } from "@/lib/gsap";
import { SEARCHLIGHT_BEAMS } from "@/data/video";

export function initSearchlights(searchlights: HTMLElement[]) {
  searchlights.forEach((el, i) => {
    const cfg = SEARCHLIGHT_BEAMS[i];
    if (!cfg) return;
    gsap.set(el, {
      autoAlpha: 0,
      rotation: cfg.rotFrom,
      y: 20,
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
