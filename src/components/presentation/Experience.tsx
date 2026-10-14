"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { gsap } from "@/lib/gsap";
import { PresCtx, SECTIONS } from "./context";
import { useIsoLayoutEffect } from "./hooks";
import { Grain } from "./atoms";
import MapOverlay from "./MapOverlay";
import HelpOverlay from "./HelpOverlay";
import NotesPanel from "./NotesPanel";
import BibliographyModal from "./BibliographyModal";
import LobbyScreen from "./LobbyScreen";
import { visitedActs } from "./session";
import {
  plannedElapsed,
  PLAN_TOTAL,
  TOTAL_STEPS,
  cumStepsBefore,
} from "./rehearsal";
import { SECTION_COMPONENTS } from "./sections";
import PresenterHud from "./experience/PresenterHud";
import ProgressBar from "./experience/ProgressBar";
import RailTicks from "./experience/RailTicks";
import ResumeGate from "./experience/ResumeGate";
import MobileNav from "./experience/MobileNav";
import { useTouchSwipe } from "./experience/useTouchSwipe";
import { useExperienceKeyboard } from "./experience/useExperienceKeyboard";
import { usePresentationState } from "./experience/usePresentationState";
import {
  getSyncSocket,
  initPresenterSession,
  sendPresenterUpdate,
  type SessionCreateResponse,
} from "@/lib/syncSocket";

export default function Experience() {
  const [stage, setStage] = useState<"lobby" | "live">("lobby");

  // Bersihkan stage lama dari sessionStorage agar QR screen selalu tampil saat buka / reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("presentation_stage");
    }
  }, []);

  const [sessionCode, setSessionCode] = useState<string>("");
  const [presenterToken, setPresenterToken] = useState<string>("");
  const [audienceCount, setAudienceCount] = useState<number>(0);

  const [mapOpen, setMapOpen] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [bibOpen, setBibOpen] = useState(false);
  const [helpOn, setHelpOn] = useState(false);

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

  // Inisialisasi & langganan sesi presenter
  useEffect(() => {
    let isMounted = true;
    const storedCode =
      typeof window !== "undefined"
        ? localStorage.getItem("presentation_session_code")
        : null;
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("presentation_presenter_token")
        : null;

    initPresenterSession(storedCode, storedToken).then((res) => {
      if (!isMounted) return;
      if (res.ok && res.session) {
        setSessionCode(res.session.code);
        const token = res.presenterToken || storedToken || "";
        setPresenterToken(token);
        setAudienceCount(res.audienceCount ?? 0);
        localStorage.setItem("presentation_session_code", res.session.code);
        if (token) {
          localStorage.setItem("presentation_presenter_token", token);
        }
      }
    });

    const socket = getSyncSocket();
    const onSessionPresence = (payload: { code: string; audienceCount: number }) => {
      if (payload && (!sessionCode || payload.code === sessionCode)) {
        setAudienceCount(payload.audienceCount);
      }
    };

    socket.on("session:presence", onSessionPresence);

    return () => {
      isMounted = false;
      socket.off("session:presence", onSessionPresence);
    };
  }, [sessionCode]);

  // Siarkan perubahan slide aktif ke audiens jika dalam mode live
  useEffect(() => {
    if (stage === "live" && sessionCode && presenterToken) {
      sendPresenterUpdate(sessionCode, presenterToken, {
        stage: "live",
        section,
        step,
      });
    }
  }, [stage, section, step, sessionCode, presenterToken]);

  // Mulai presentasi dari lobi (dari awal: Babak 0 Langkah 0)
  const handleStart = useCallback(() => {
    setStage("live");
    goto(0, 0);
    if (sessionCode && presenterToken) {
      sendPresenterUpdate(sessionCode, presenterToken, {
        stage: "live",
        section: 0,
        step: 0,
      });
    }
    hud("PRESENTASI DIMULAI — ACT.00 OUVERTURE", "ember");
  }, [goto, sessionCode, presenterToken, hud]);

  // Lanjutkan presentasi ke posisi tersimpan sebelumnya
  const handleResume = useCallback(() => {
    if (!savedPos) {
      handleStart();
      return;
    }
    setStage("live");
    goto(savedPos.section, savedPos.step);
    if (sessionCode && presenterToken) {
      sendPresenterUpdate(sessionCode, presenterToken, {
        stage: "live",
        section: savedPos.section,
        step: savedPos.step,
      });
    }
    hud(
      `MELANJUTKAN KE ACT.${String(savedPos.section).padStart(2, "0")} · STEP.${String(savedPos.step + 1).padStart(2, "0")}`,
      "ember",
    );
  }, [savedPos, handleStart, goto, sessionCode, presenterToken, hud]);

  // Kembali ke lobi (QR Screen)
  const handleOpenLobby = useCallback(() => {
    setStage("lobby");
    if (sessionCode && presenterToken) {
      sendPresenterUpdate(sessionCode, presenterToken, {
        stage: "lobby",
        section,
        step,
      });
    }
    hud("KEMBALI KE LOBI QR AUDIENS", "info");
  }, [section, step, sessionCode, presenterToken, hud]);

  // Buat sesi baru jika diminta presenter
  const handleNewSession = useCallback(async () => {
    try {
      const socket = getSyncSocket();
      socket.emit("session:create", {}, (res: SessionCreateResponse) => {
        if (res?.ok && res.session) {
          setSessionCode(res.session.code);
          const token = res.presenterToken || "";
          setPresenterToken(token);
          setAudienceCount(0);
          localStorage.setItem("presentation_session_code", res.session.code);
          if (token) {
            localStorage.setItem("presentation_presenter_token", token);
          }
          hud(`SESI BARU: ${res.session.code}`, "ember");
        }
      });
    } catch (err) {
      console.error("Gagal membuat sesi baru:", err);
    }
  }, [hud]);

  // Keyboard shortcut di lobi (Space, Enter, ArrowRight memulai presentasi)
  useEffect(() => {
    if (stage !== "lobby") return;
    const onLobbyKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener("keydown", onLobbyKey);
    return () => window.removeEventListener("keydown", onLobbyKey);
  }, [stage, handleStart]);

  // Handlers untuk navigasi saat di slide pertama
  const handleBack = useCallback(() => {
    if (section === 0 && step === 0) {
      handleOpenLobby();
      return;
    }
    back();
  }, [section, step, handleOpenLobby, back]);

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
    disabled: stage === "lobby",
    section,
    step,
    mapOpen,
    helpSheet,
    notesOpen,
    bibOpen,
    savedPos,
    advance,
    back: handleBack,
    goto,
    resume,
    toggleContrast,
    toggleMute,
    hud,
    setHelpSheet,
    setMapOpen,
    setNotesOpen,
    setBibOpen,
    setHelpOn,
    keyHandlerRef,
  });

  // Swipe gesture navigation for touch devices
  useTouchSwipe({
    onSwipeLeft: advance,
    onSwipeRight: handleBack,
    disabled: stage === "lobby" || mapOpen || helpSheet || notesOpen || bibOpen,
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

  const presApi = useMemo<PresApi>(
    () => ({
      ...api,
      sessionCode,
    }),
    [api, sessionCode],
  );

  return (
    <PresCtx.Provider value={presApi}>
      <div className="fixed inset-0 overflow-hidden bg-base text-paper select-none">
        {/* Layar Pembuka Lobi & QR Code Audiens */}
        {stage === "lobby" && (
          <LobbyScreen
            sessionCode={sessionCode}
            audienceCount={audienceCount}
            onStart={handleStart}
            onNewSession={handleNewSession}
            savedPos={savedPos}
            onResume={handleResume}
          />
        )}

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
            onClose={() => setMapOpen(false)}
          />
        )}

        {/* Lembar bantuan presenter */}
        {helpSheet && <HelpOverlay onClose={() => setHelpSheet(false)} />}

        {/* Catatan presenter per langkah */}
        {notesOpen && !helpSheet && !mapOpen && !bibOpen && (
          <NotesPanel
            section={section}
            step={step}
            onClose={() => setNotesOpen(false)}
          />
        )}

        {/* Modal Daftar Pustaka Ilmiah (Shortcut [P]) */}
        <BibliographyModal
          isOpen={bibOpen}
          onClose={() => setBibOpen(false)}
          currentSection={section}
        />

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
          bibOpen={bibOpen}
          clockRunning={clockRunning}
          elapsed={elapsed}
          rehearsalOn={rehearsalOn}
          remaining={remaining}
          planDelta={planDelta}
          contrast={contrast}
          muted={muted}
          helpOn={helpOn}
          sessionCode={sessionCode}
          audienceCount={audienceCount}
          onOpenLobby={handleOpenLobby}
        />

        {/* Kontrol Navigasi Layar Sentuh & Tombol Mobile */}
        <MobileNav
          section={section}
          step={step}
          onAdvance={advance}
          onBack={handleBack}
          onOpenMap={() => setMapOpen((m) => !m)}
          onOpenBib={() => setBibOpen((b) => !b)}
          onOpenLobby={handleOpenLobby}
        />
      </div>
    </PresCtx.Provider>
  );
}
