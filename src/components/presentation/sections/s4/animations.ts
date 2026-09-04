import { gsap } from "@/lib/gsap";
import { ZONE_META } from "@/data/anatomy";

export function animateSheetEnter(sheet: HTMLElement | null, settled: boolean) {
  if (!sheet) return;
  if (settled) {
    gsap.set(sheet, { y: 0, autoAlpha: 1 });
    return;
  }
  gsap.fromTo(
    sheet,
    { y: 44, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" },
  );
}

export function animatePanelTransition(panel: HTMLElement | null, settled: boolean) {
  if (!panel) return;
  if (settled) {
    gsap.set(panel, { autoAlpha: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    panel,
    { autoAlpha: 0, y: 14 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
    },
  );
}

export function animateRowStagger(panel: HTMLElement | null, settled: boolean) {
  const rows = panel?.querySelectorAll<HTMLElement>(".p-row");
  if (!rows || rows.length === 0) return;
  if (settled) {
    gsap.set(rows, { autoAlpha: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    rows,
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.07,
      delay: 0.12,
      ease: "power2.out",
      overwrite: "auto",
    },
  );
}

export function animateZonesAndBab(
  root: HTMLElement | null,
  part: number,
  bab: number,
  settled: boolean,
) {
  if (!root) return;
  root.querySelectorAll<HTMLElement>(".zone").forEach((z) => {
    const p = Number(z.dataset.part);
    const meta = ZONE_META[p];
    if (!meta) return;
    const isSel = p === part && part !== 0;
    gsap.to(z, {
      opacity: part === 0 ? 0.35 : isSel ? 1 : 0.18,
      y: part === 0 || isSel ? 0 : p === 1 ? -10 : p === 3 ? 10 : 0,
      scaleY: part === 0 || isSel ? 1 : 0.88,
      borderColor: isSel ? meta.rgba(0.55) : "rgba(255,255,255,0.07)",
      duration: settled ? 0 : 0.65,
      ease: "power3.inOut",
      transformOrigin:
        p === 1 ? "top center" : p === 3 ? "bottom center" : "center",
    });
    const label = z.querySelector<HTMLElement>(".z-label");
    if (label) {
      gsap.to(label, {
        color: isSel ? meta.hex : "#6B6B7A",
        opacity: part === 0 ? 0.75 : 1,
        duration: settled ? 0 : 0.5,
      });
    }
    z.querySelectorAll<HTMLElement>(".z-tag").forEach((t) =>
      gsap.to(t, { opacity: isSel ? 0.85 : 0, duration: settled ? 0 : 0.45 }),
    );
    z.querySelectorAll<HTMLElement>(".z-line, .z-block").forEach((b) =>
      gsap.to(b, { opacity: isSel ? 1 : 0.4, duration: settled ? 0 : 0.5 }),
    );
  });

  // Drill-down BAB: segmen terpilih melebar, sub-struktur terbuka
  root.querySelectorAll<HTMLElement>(".bab").forEach((b, i) => {
    const sel = part === 2 && bab === i;
    gsap.to(b, {
      flexGrow: sel ? 2.4 : 1,
      borderColor: sel ? "rgba(240,237,232,0.4)" : "rgba(255,255,255,0.05)",
      backgroundColor: sel ? "rgba(240,237,232,0.045)" : "rgba(240,237,232,0)",
      duration: settled ? 0 : 0.55,
      ease: "power2.inOut",
    });
    const sub = b.querySelector<HTMLElement>(".bab-sub");
    if (sub) {
      if (sel) {
        gsap.set(sub, { display: "flex" });
        gsap.fromTo(
          sub,
          { height: 0, autoAlpha: 0 },
          { height: "auto", autoAlpha: 1, duration: settled ? 0 : 0.5, ease: "power2.out" },
        );
      } else {
        gsap.to(sub, {
          height: 0,
          autoAlpha: 0,
          duration: settled ? 0 : 0.3,
          onComplete: () => gsap.set(sub, { display: "none" }),
        });
      }
    }
    const ttl = b.querySelector<HTMLElement>(".bab-title");
    if (ttl) {
      gsap.to(ttl, {
        autoAlpha: part === 2 ? (sel ? 1 : 0.6) : 0,
        duration: settled ? 0 : 0.4,
      });
    }
    const num = b.querySelector<HTMLElement>(".bab-num");
    if (num) {
      gsap.to(num, {
        color: sel ? "#FFB740" : "#6B6B7A",
        duration: settled ? 0 : 0.4,
      });
    }
  });
}
