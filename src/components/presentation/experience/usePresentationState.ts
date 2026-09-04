import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { audioManager } from "@/lib/audioManager";
import { SECTIONS, type PresApi } from "../context";
import {
  subscribeSession,
  getPosSnapshot,
  getClockRunning,
  getElapsedSeconds,
  savePos,
  startClock,
  visitedActs,
  getRehearsalOn,
  getRemainingSeconds,
  armStep,
  deferDeadline,
} from "../session";
import { stepDuration } from "../rehearsal";
import type { NavState } from "@/types/presentation";
import type { HudMessage } from "./PresenterHud";

const pad2 = (n: number) => String(n).padStart(2, "0");

export function usePresentationState(mapOpen: boolean) {
  const [nav, setNav] = useState<NavState>({
    section: 0,
    step: 0,
    settled: false,
  });
  const [contrast, setContrast] = useState(false);
  const [muted, setMuted] = useState(false);
  const [huds, setHuds] = useState<HudMessage[]>([]);

  // Sesi presenter (posisi tersimpan + jam)
  const savedPos = useSyncExternalStore(
    subscribeSession,
    getPosSnapshot,
    () => null,
  );
  const clockRunning = useSyncExternalStore(
    subscribeSession,
    getClockRunning,
    () => false,
  );
  const elapsed = useSyncExternalStore(
    subscribeSession,
    getElapsedSeconds,
    () => 0,
  );
  const rehearsalOn = useSyncExternalStore(
    subscribeSession,
    getRehearsalOn,
    () => false,
  );
  const remaining = useSyncExternalStore(
    subscribeSession,
    getRemainingSeconds,
    () => 0,
  );

  const keyHandlerRef = useRef<
    ((k: string, e: KeyboardEvent) => boolean | void) | null
  >(null);
  const activeTlRef = useRef<gsap.core.Timeline | null>(null);
  const hudSeq = useRef(0);
  const advanceRef = useRef<() => void>(() => {});

  const { section, step, settled } = nav;

  const hud = useCallback(
    (msg: string, tone: "info" | "ember" = "info") => {
      const id = ++hudSeq.current;
      setHuds((h) => [...h.slice(-2), { id, msg, tone }]);
      setTimeout(() => {
        setHuds((h) => h.filter((x) => x.id !== id));
      }, 2000);
    },
    [],
  );

  const goto = useCallback((s: number, st = 0) => {
    const target = Math.max(0, Math.min(SECTIONS.length - 1, s));
    const wasSeen = visitedActs.has(target);
    setNav((n) => {
      const targetStep = Math.max(
        0,
        Math.min(SECTIONS[target].steps - 1, st),
      );
      if (target === n.section) return { ...n, step: targetStep };
      audioManager.playWhoosh();
      if (n.section === 0) {
        audioManager.fadeOutDrone(1.2);
        audioManager.fadeOutOuverture(0.8);
      }
      visitedActs.add(n.section);
      return {
        section: target,
        step: targetStep,
        settled: wasSeen,
      };
    });
  }, []);

  const resume = useCallback(() => {
    if (!savedPos) return;
    visitedActs.add(savedPos.section);
    audio.tick();
    hud(
      `LANJUT — ACT.${pad2(savedPos.section)} // STEP.${pad2(savedPos.step)}`,
      "ember",
    );
    goto(savedPos.section, savedPos.step);
  }, [savedPos, goto, hud]);

  const setStep = useCallback((n2: number) => {
    setNav((n) => ({
      ...n,
      step: Math.max(0, Math.min(SECTIONS[n.section].steps - 1, n2)),
    }));
  }, []);

  const advance = useCallback(() => {
    const tl = activeTlRef.current;
    if (tl && tl.isActive()) {
      tl.progress(1);
      return;
    }
    const maxStep = SECTIONS[section].steps - 1;
    if (step < maxStep) {
      audio.tick();
      setNav((n) => ({ ...n, step: n.step + 1 }));
    } else if (section < SECTIONS.length - 1) {
      audio.tick();
      goto(section + 1, 0);
    } else {
      hud("AKHIR — [O] PETA · [G]+# LOMPAT BEBAS");
    }
  }, [section, step, goto, hud]);

  const back = useCallback(() => {
    if (step > 0) {
      audio.tick();
      setNav((n) => ({ ...n, step: n.step - 1 }));
    } else if (section > 0) {
      audio.tick();
      goto(section - 1, SECTIONS[section - 1].steps - 1);
    }
  }, [section, step, goto]);

  const toggleContrast = useCallback(() => {
    setContrast((c) => {
      const next = !c;
      document.documentElement.classList.toggle("contrast-boost", next);
      hud(
        next ? "CONTRAST BOOST — ON [C]" : "CONTRAST BOOST — OFF [C]",
        "ember",
      );
      return next;
    });
  }, [hud]);

  const toggleMute = useCallback(() => {
    audioManager.init();
    const m = audioManager.toggleMute();
    setMuted(m);
    hud(m ? "AUDIO — MUTED [M]" : "AUDIO — ON [M]", "ember");
  }, [hud]);

  // Persistensi posisi + mulai jam
  useEffect(() => {
    if (section === 0 && step === 0) return;
    startClock();
    savePos({ section, step });
    armStep(stepDuration(section, step));
  }, [section, step]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  // Auto-advance mode latihan
  useEffect(() => {
    if (!rehearsalOn) return;
    const iv = setInterval(() => {
      if (mapOpen) {
        deferDeadline(1000);
        return;
      }
      if (!getClockRunning()) return;
      if (getRemainingSeconds() > 0) return;
      const tl = activeTlRef.current;
      if (tl && tl.isActive()) {
        deferDeadline(1000);
        return;
      }
      armStep(9999);
      advanceRef.current();
    }, 1000);
    return () => clearInterval(iv);
  }, [rehearsalOn, mapOpen]);

  const api = useMemo<PresApi>(
    () => ({
      section,
      step,
      settled,
      setStep,
      goto,
      registerKeyHandler: (fn) => {
        keyHandlerRef.current = fn;
      },
      registerTimeline: (tl) => {
        activeTlRef.current = tl;
      },
      hud,
    }),
    [section, step, settled, setStep, goto, hud],
  );

  return {
    section,
    step,
    settled,
    savedPos,
    clockRunning,
    elapsed,
    rehearsalOn,
    remaining,
    contrast,
    muted,
    huds,
    keyHandlerRef,
    advance,
    back,
    goto,
    resume,
    setStep,
    toggleContrast,
    toggleMute,
    hud,
    api,
  };
}
