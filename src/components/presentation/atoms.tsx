"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Kicker editorial kiri-atas: — ACT 04 · ANATOMY THEATER */
export function Kicker({
  act,
  children,
  className,
}: {
  act: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-[5vh] left-[6vw] z-10 flex items-center gap-3",
        className,
      )}
    >
      <span aria-hidden className="h-px w-8 bg-ember/70" />
      <span className="font-code text-[10px] tracking-[0.35em] text-mute">
        ACT {act} · {children}
      </span>
    </div>
  );
}

/** Numeral babak raksasa di latar — kedalaman editorial, nyaris tak terlihat. */
export function BigNumeral({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "big-numeral pointer-events-none absolute right-[2vw] bottom-[-7vw] z-0 font-display font-semibold leading-none text-paper opacity-[0.028] select-none",
        className,
      )}
      style={{ fontSize: "30vw" }}
    >
      {children}
    </div>
  );
}

/** Pecah teks menjadi span per karakter (untuk animasi naik bertopeng). */
export function SplitChars({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)}>
      {words.map((w, wi) => (
        <span key={wi}>
          <span className="inline-block overflow-hidden whitespace-nowrap align-baseline">
            {Array.from(w).map((c, ci) => (
              <span
                key={ci}
                data-char
                className="inline-block will-change-transform"
              >
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** Grain noise latar — feTurbulence SVG, di atas segalanya, tak bisa diklik. */
export function Grain() {
  return (
    <svg className="grain" aria-hidden="true" focusable="false">
      <filter id="grainF">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grainF)" />
    </svg>
  );
}

/** Dot merah siaran langsung. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("dot-live", className)}
      style={{ display: "inline-block" }}
    />
  );
}
