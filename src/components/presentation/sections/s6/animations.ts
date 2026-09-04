import { gsap } from "@/lib/gsap";

export function animateBattleCards(
  root: HTMLElement | null,
  selIdx: number,
  compare: boolean,
  settled: boolean,
) {
  if (!root) return;
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".battle-card"));

  cards.forEach((el, i) => {
    let xPct: number;
    let scale: number;
    let opacity: number;
    let z = 1;
    if (compare) {
      xPct = (i - 1.5) * 112 - 50;
      scale = 0.86;
      opacity = 1;
    } else if (selIdx >= 0) {
      if (i === selIdx) {
        xPct = -50;
        scale = 1.42;
        opacity = 1;
        z = 10;
      } else {
        const d = i - selIdx;
        const mag = Math.min(Math.abs(d), 2.2) * 108;
        xPct = (d < 0 ? -mag : mag) - 50;
        scale = 0.55;
        opacity = 0.28;
      }
    } else {
      xPct = (i - 1.5) * 108 - 50;
      scale = 1;
      opacity = 1;
    }
    gsap.to(el, {
      xPercent: xPct,
      yPercent: -50,
      scale,
      opacity,
      zIndex: z,
      duration: settled ? 0 : 0.85,
      ease: "power3.inOut",
      overwrite: "auto",
    });

    const rows = el.querySelectorAll<HTMLElement>(".card-row");
    const note = el.querySelector<HTMLElement>(".card-note");
    const showRows = compare || selIdx >= 0;
    if (settled) {
      gsap.set(rows, { autoAlpha: showRows ? 1 : 0, y: 0 });
      if (note) gsap.set(note, { autoAlpha: selIdx === i ? 1 : 0 });
      return;
    }
    if (showRows) {
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06, delay: 0.3, overwrite: "auto" },
      );
    } else {
      gsap.to(rows, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    }
    if (note) {
      gsap.to(note, {
        autoAlpha: selIdx === i ? 1 : 0,
        duration: settled ? 0 : 0.4,
        delay: 0.35,
      });
    }
  });
}
