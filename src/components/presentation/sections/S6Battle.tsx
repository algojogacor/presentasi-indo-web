"use client";

import { useRef } from "react";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";
import { CARDS } from "@/data/battle";
import BattleCard from "./s6/BattleCard";
import { animateBattleCards } from "./s6/animations";

/**
 * Section 6 — Battle Cards.
 * Step 0: empat kartu sejajar · 1–4: spotlight satu kartu · 5: mode komparasi [B].
 */
export default function S6Battle({ step }: { step: number }) {
  const { setStep, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);

  const selIdx = step >= 1 && step <= 4 ? step - 1 : -1;
  const compare = step === 5;

  useSectionKeys((key) => {
    if (key === "b") {
      setStep(compare ? 0 : 5);
      return true;
    }
    const n = Number(key);
    if (n >= 1 && n <= 4) {
      setStep(n);
      return true;
    }
    return false;
  });

  useIsoLayoutEffect(() => {
    animateBattleCards(root.current, selIdx, compare, settled);
  }, [step, selIdx, compare, settled]);

  return (
    <div ref={root} className="absolute inset-0" data-testid="battle-cards">
      <Kicker act="06">VARIASI JENIS KTI</Kicker>
      <BigNumeral>06</BigNumeral>

      {compare && (
        <p className="fade-slide-in absolute top-[5vh] right-[6vw] z-10 font-code text-[10px] tracking-[0.3em] text-mute">
          MODE KOMPARASI — PERBEDAAN KUNCI DI-TANDAI
        </p>
      )}

      <div className="absolute inset-0 pt-[16vh]">
        {CARDS.map((c, i) => (
          <BattleCard
            key={c.title}
            card={c}
            index={i}
            compare={compare}
          />
        ))}
      </div>

      <p className="absolute right-[6vw] bottom-[6vh] font-code text-[9px] tracking-[0.25em] text-mute">
        [1–4] SPOTLIGHT · [B] KOMPARASI · [SPACE] BERURUTAN
      </p>
    </div>
  );
}
