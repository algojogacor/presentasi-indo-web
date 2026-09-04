import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "../../hooks";

export const INTRO_LINE = "Sekarang kita test instingnya…";

interface PollingIntroProps {
  settled: boolean;
}

export default function PollingIntro({ settled }: PollingIntroProps) {
  const introRef = useRef<HTMLParagraphElement>(null);

  useIsoLayoutEffect(() => {
    const el = introRef.current;
    if (!el) return;
    if (settled) {
      el.textContent = INTRO_LINE;
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    const tl = gsap.timeline();
    tl.set(el, { text: "" });
    tl.to(el, {
      text: { value: INTRO_LINE, delimiter: "" },
      duration: 1.4,
      ease: "none",
    });
    return () => {
      tl.kill();
    };
  }, [settled]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <p
        ref={introRef}
        className="font-display italic text-[3.2vw] text-paper"
        aria-label={INTRO_LINE}
      />
      <p className="mt-6 font-code text-[10px] tracking-[0.4em] text-mute">
        TANPA GOOGLE · TANPA BUKU — INSTING SAJA · [SPACE]
      </p>
    </div>
  );
}
