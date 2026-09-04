"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { PresCtx, SECTIONS } from "./context";
import { useIsoLayoutEffect } from "./hooks";
import { Grain } from "./atoms";
import MapOverlay from "./MapOverlay";
import HelpOverlay from "./HelpOverlay";
import NotesPanel from "./NotesPanel";
import { visitedActs } from "./session";
import {
  plannedElapsed,
  PLAN_TOTAL,
  TOTAL_STEPS,
  cumStepsBefore,
} from "./rehearsal";
import S0Opening from "./sections/S0Opening";
import S1Video from "./sections/S1Video";
import S2Latar from "./sections/S2Latar";
import S3Hakikat from "./sections/S3Hakikat";
import S4Anatomy from "./sections/S4Anatomy";
import S5Polling from "./sections/S5Polling";
import S6Battle from "./sections/S6Battle";
import S7Kaidah from "./sections/S7Kaidah";
import S8Closing from "./sections/S8Closing";
import PresenterHud from "./experience/PresenterHud";
import ProgressBar from "./experience/ProgressBar";
import RailTicks from "./experience/RailTicks";
import ResumeGate from "./experience/ResumeGate";
import { useExperienceKeyboard } from "./experience/useExperienceKeyboard";
import { usePresentationState } from "./experience/usePresentationState";

const SECTION_COMPONENTS = [
  S0Opening,
  S1Video,
  S2Latar,
  S3Hakikat,
  S4Anatomy,
  S5Polling,
  S6Battle,
  S7Kaidah,
  S8Closing,
];

export default function Experience() {
  const [mapOpen, setMapOpen] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [helpOn, setHelpOn] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);

  const {
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
    toggleContrast,
    toggleMute,
    hud,
    api,
  } = usePresentationState(mapOpen);

  // Fade masuk saat ganti babak
  useIsoLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (settled) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.55, ease: "power1.out" },
    );
  }, [section, settled]);

  // Keyboard navigation hook
  const { gShow } = useExperienceKeyboard({
    section,
    step,
    mapOpen,
    helpSheet,
    notesOpen,
    savedPos,
    advance,
    back,
    goto,
    resume,
    toggleContrast,
    toggleMute,
    hud,
    setHelpSheet,
    setMapOpen,
    setNotesOpen,
    setHelpOn,
    keyHandlerRef,
  });

  const SectionComp = SECTION_COMPONENTS[section];

  // Pita progres
  const posPct = Math.min(
    100,
    ((cumStepsBefore(section) + step) / TOTAL_STEPS) * 100,
  );
  const planDelta = elapsed - plannedElapsed(section, step);
  const planPct = Math.min(
    100,
    (plannedElapsed(section, step) / PLAN_TOTAL) * 100,
  );

  return (
    <PresCtx.Provider value={api}>
      <div className="fixed inset-0 overflow-hidden bg-base text-paper select-none">
        <div key={section} ref={sectionRef} className="absolute inset-0 opacity-0">
          <SectionComp step={step} />
        </div>

        <Grain />

        {/* Vignette sinematik — pinggir layar menggelap perlahan */}
        <div className="vignette" aria-hidden="true" />

        {/* Peta navigasi */}
        {mapOpen && (
          <MapOverlay
            current={section}
            visited={Array.from(visitedActs)}
            onJump={(n) => {
              setMapOpen(false);
              goto(n, 0);
            }}
          />
        )}

        {/* Lembar bantuan presenter */}
        {helpSheet && <HelpOverlay onClose={() => setHelpSheet(false)} />}

        {/* Catatan presenter per langkah */}
        {notesOpen && !helpSheet && !mapOpen && (
          <NotesPanel
            section={section}
            step={step}
            onClose={() => setNotesOpen(false)}
          />
        )}

        {/* Gerbang lanjut: posisi tersimpan dari refresh sebelumnya */}
        <ResumeGate savedPos={savedPos} section={section} step={step} />

        {/* Rel babak — 9 tick, babak aktif menyala amber */}
        <RailTicks section={section} />

        {/* Pita progres tepi-bawah */}
        <ProgressBar
          clockRunning={clockRunning}
          posPct={posPct}
          planPct={planPct}
          rehearsalOn={rehearsalOn}
        />

        {/* HUD Presenter — koordinat state, sangat redup, kiri bawah */}
        <PresenterHud
          huds={huds}
          section={section}
          step={step}
          gShow={gShow}
          mapOpen={mapOpen}
          helpSheet={helpSheet}
          notesOpen={notesOpen}
          clockRunning={clockRunning}
          elapsed={elapsed}
          rehearsalOn={rehearsalOn}
          remaining={remaining}
          planDelta={planDelta}
          contrast={contrast}
          muted={muted}
          helpOn={helpOn}
        />
      </div>
    </PresCtx.Provider>
  );
}
