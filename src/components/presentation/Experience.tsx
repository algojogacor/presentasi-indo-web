"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { audio } from "@/lib/audio";
import { PresCtx, SECTIONS, type PresApi } from "./context";
import { useIsoLayoutEffect } from "./hooks";
import { Grain } from "./atoms";
import MapOverlay from "./MapOverlay";
import ActCard from "./ActCard";
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
  setRehearsal,
  armStep,
  deferDeadline,
} from "./session";
import {
  stepDuration,
  plannedElapsed,
  PLAN_TOTAL,
  TOTAL_STEPS,
  cumStepsBefore,
  fmtDelta,
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

interface NavState {
  section: number;
  step: number;
  /** Section ini pernah dilihat sebelumnya → remount = settle instan. */
  settled: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Experience() {
  const [nav, setNav] = useState<NavState>({
    section: 0,
    step: 0,
    settled: false,
  });
  const [gShow, setGShow] = useState(false); // kosmetik HUD "// G→_" saja
  const [contrast, setContrast] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [helpOn, setHelpOn] = useState(true);
  // Sesi presenter (posisi tersimpan + jam) — store eksternal modul
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
  // Mode latihan — auto-advance + patokan waktu (store eksternal, runtime saja)
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
  const [huds, setHuds] = useState<
    { id: number; msg: string; tone: "info" | "ember" }[]
  >([]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const keyHandlerRef = useRef<
    ((k: string, e: KeyboardEvent) => boolean | void) | null
  >(null);
  const activeTlRef = useRef<gsap.core.Timeline | null>(null);
  const hudSeq = useRef(0);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // G+digit dibaca dari ref — kebal terhadap staleness closure bila kedua
  // tombol datang hampir bersamaan (state belum ter-flush antar keydown).
  const gArmedRef = useRef(false);
  // advance terbaru untuk interval auto-advance (bebas stale closure)
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
    const wasSeen = visitedActs.has(target); // ditentukan SEBELUM menandai kedatangan
    setNav((n) => {
      const targetStep = Math.max(
        0,
        Math.min(SECTIONS[target].steps - 1, st),
      );
      if (target === n.section) return { ...n, step: targetStep };
      visitedActs.add(n.section); // babak yang ditinggalkan → "pernah dilihat"
      return {
        section: target,
        step: targetStep,
        settled: wasSeen,
      };
    });
  }, []);

  // Lanjut dari posisi tersimpan (refresh tak sengaja) — settle instan, tanpa replay
  const resume = useCallback(() => {
    if (!savedPos) return;
    visitedActs.add(savedPos.section); // ditandai dulu → goto melihat "pernah dilihat"
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
      tl.progress(1); // Space memotong timeline yang sedang berjalan
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
    audio.init();
    const m = audio.toggleMute();
    setMuted(m);
    hud(m ? "AUDIO — MUTED [M]" : "AUDIO — ON [M]", "ember");
  }, [hud]);

  // Persistensi posisi + mulai jam — menulis ke store eksternal (bukan setState)
  // + pasang tenggat auto-advance untuk langkah baru (no-op bila latihan mati).
  useEffect(() => {
    if (section === 0 && step === 0) return; // gerbang awal tidak disimpan
    startClock();
    savePos({ section, step });
    armStep(stepDuration(section, step));
  }, [section, step]);

  // Advance terbaru selalu tersedia bagi interval auto-advance (ref diperbarui
  // di efek, bukan saat render — patuh aturan react-hooks/refs).
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  // Auto-advance mode latihan: satu detak per detik, tenggat disimpan di store
  // sesi. Peta terbuka / animasi aktif → tenggat ditunda, tidak dipotong.
  useEffect(() => {
    if (!rehearsalOn) return;
    const iv = setInterval(() => {
      if (mapOpen) {
        deferDeadline(1000);
        return;
      }
      if (!getClockRunning()) return; // belum melewati gerbang
      if (getRemainingSeconds() > 0) return;
      const tl = activeTlRef.current;
      if (tl && tl.isActive()) {
        deferDeadline(1000);
        return;
      }
      armStep(9999); // cadangan bila advance mentok di posisi akhir
      advanceRef.current(); // → efek [section,step] memasang durasi baru
    }, 1000);
    return () => clearInterval(iv);
  }, [rehearsalOn, mapOpen]);

  // Fade masuk saat ganti babak (remount karena key)
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
     
  }, [section]);

  // ---- Keyboard: satu-satunya antarmuka kontrol presenter ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const k = e.key;
      if (k === " " || k === "ArrowRight" || k === "ArrowLeft")
        e.preventDefault();
      audio.init();

      // [O] / [Tab] — peta navigasi (daftar isi babak)
      if (k === "Tab" || k.toLowerCase() === "o") {
        e.preventDefault();
        audio.tick();
        setMapOpen((m) => !m);
        return;
      }
      if (mapOpen) {
        if (k === "Escape") setMapOpen(false);
        else if (/^[0-9]$/.test(k)) {
          const n = Number(k);
          if (n < SECTIONS.length) {
            audio.tick();
            setMapOpen(false);
            goto(n, 0);
          }
        }
        return; // peta terbuka → tombol lain tidak menyentuh babak
      }

      // Shift+S — lewati section video
      if (e.shiftKey && (k === "S" || k === "s")) {
        if (section === 1) {
          hud("SKIP — MENUJU LATAR BELAKANG", "ember");
          audio.tick();
          goto(2, 0);
        }
        return;
      }

      // Mode jump G + angka — ref agar kekal dua keydown berurutan cepat
      if (gArmedRef.current) {
        if (/^[0-9]$/.test(k)) {
          const n = Number(k);
          if (n < SECTIONS.length) {
            audio.tick();
            hud(`ACT.${pad2(n)} — ${SECTIONS[n].label}`, "ember");
            goto(n, 0);
          } else {
            hud("BABAK DI LUAR JANGKAUAN");
          }
        }
        gArmedRef.current = false;
        setGShow(false);
        if (gTimer.current) clearTimeout(gTimer.current);
        return;
      }

      if (k === " " || k === "ArrowRight") {
        advance();
        return;
      }
      if (k === "ArrowLeft") {
        back();
        return;
      }
      const lk = k.toLowerCase();
      if (lk === "l" && savedPos && section === 0 && step === 0) {
        resume();
        return;
      }
      if (lk === "h") {
        setHelpOn((h) => !h);
        return;
      }
      if (lk === "g") {
        gArmedRef.current = true;
        setGShow(true);
        hud("G → [0–8] PILIH BABAK", "ember");
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          gArmedRef.current = false;
          setGShow(false);
        }, 1400);
        return;
      }
      // [T] — mode latihan: auto-advance + patokan waktu per babak
      if (lk === "t") {
        const next = !getRehearsalOn();
        setRehearsal(next, stepDuration(section, step));
        audio.tick();
        hud(
          next
            ? "REHEARSAL ON — AUTO-ACTIVE · RENCANA 53 MENIT [T]"
            : "REHEARSAL OFF — KONTROL MANUAL [T]",
          next ? "ember" : "info",
        );
        return;
      }
      if (lk === "c") {
        toggleContrast();
        return;
      }
      if (lk === "m") {
        toggleMute();
        return;
      }
      // Tombol khusus section (1/2/3, A–E, B, F, R)
      keyHandlerRef.current?.(lk, e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    section,
    step,
    mapOpen,
    savedPos,
    advance,
    back,
    goto,
    hud,
    resume,
    toggleContrast,
    toggleMute,
  ]);

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

  const statusParts = [
    contrast ? "CONTRAST+" : null,
    muted ? "MUTE" : null,
  ].filter(Boolean) as string[];

  const SectionComp = SECTION_COMPONENTS[section];

  // Pita progres: posisi aktual (langkah) vs posisi rencana (waktu latihan)
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

        {/* Kartu babak — kilasan judul saat memasuki babak yang belum pernah dilihat */}
        {!settled && <ActCard key={`ac-${section}`} section={section} />}

        <Grain />

        {/* Vignette sinematik — pinggir layar menggelap perlahan */}
        <div className="vignette" aria-hidden="true" />

        {/* Peta navigasi — daftar isi presentasi itu sendiri */}
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

        {/* Gerbang lanjut: posisi tersimpan dari refresh sebelumnya */}
        {savedPos && section === 0 && step === 0 && (
          <div className="pointer-events-none fixed bottom-[15vh] left-1/2 z-[70] -translate-x-1/2 text-center font-code text-[10px] tracking-[0.22em] text-paper/40">
            {`POSISI TERSIMPAN — [L] LANJUT ACT.${pad2(savedPos.section)} // STEP.${pad2(savedPos.step)}`}
          </div>
        )}

        {/* Rel babak — 9 tick, babak aktif menyala amber */}
        <div
          className="pointer-events-none fixed right-6 bottom-5 z-[70] flex items-end gap-[3px]"
          aria-hidden="true"
        >
          {SECTIONS.map((_, i) => (
            <span
              key={i}
              className={
                i === section
                  ? "h-[10px] w-[3px] bg-ember"
                  : visitedActs.has(i)
                    ? "h-[6px] w-[3px] bg-paper/30"
                    : "h-[6px] w-[3px] bg-white/12"
              }
            />
          ))}
        </div>

        {/* Pita progres tepi-bawah — posisi aktual (amber) + penanda rencana
            (belah ketupat) saat mode latihan. Hanya tampil setelah gerbang. */}
        {clockRunning && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[68] h-[3px]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-white/7" />
            {SECTIONS.slice(1).map((_, i) => (
              <span
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white/15"
                style={{
                  left: `${(cumStepsBefore(i + 1) / TOTAL_STEPS) * 100}%`,
                }}
              />
            ))}
            <div
              className="ribbon-fill absolute inset-y-0 left-0 bg-ember/65"
              style={{ width: `${posPct}%` }}
            />
            {rehearsalOn && (
              <span className="plan-dot" style={{ left: `${planPct}%` }} />
            )}
          </div>
        )}

        {/* HUD Presenter — koordinat state, sangat redup, kiri bawah */}
        <div
          className="pointer-events-none fixed bottom-5 left-6 z-[70] font-code text-[10px] leading-[1.8] tracking-[0.14em]"
          style={{ color: "var(--hud)" }}
          aria-hidden="true"
        >
          {huds.map((h) => (
            <div
              key={h.id}
              className={`hud-msg ${h.tone === "ember" ? "text-ember/80" : ""}`}
            >
              {h.msg}
            </div>
          ))}
          <div>
            {`ACT.${pad2(section)} // STEP.${pad2(step)}/${pad2(
              SECTIONS[section].steps - 1,
            )}`}
            {gShow ? " // G→_" : ""}
            {mapOpen ? " // PETA" : ""}
          </div>
          {clockRunning && (
            <div className={elapsed >= 50 * 60 ? "text-ember/75" : undefined}>
              {`T+${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)} / 60:00`}
            </div>
          )}
          {rehearsalOn && clockRunning && (
            <div className={remaining <= 10 ? "text-ember/85" : undefined}>
              {`REHEARSAL · AUTO ${pad2(remaining)}S`}
            </div>
          )}
          {rehearsalOn && clockRunning && (
            <div
              className={
                planDelta > 60
                  ? "text-ember/85"
                  : planDelta < -45
                    ? "text-paper/55"
                    : "text-paper/45"
              }
            >
              {`RENCANA ${fmtDelta(planDelta)} · ${
                planDelta > 60
                  ? "TERLAMBAT"
                  : planDelta < -45
                    ? "LEBIH CEPAT"
                    : "SESUAI JADWAL"
              }`}
            </div>
          )}
          {statusParts.length > 0 ? <div>{statusParts.join(" · ")}</div> : null}
          {helpOn && (
            <div className="text-[9px] tracking-[0.2em] text-paper/30">
              [SPACE] LANJUT · [G]+# LOMPAT · [O] PETA · [T] LATIHAN · [C] KONTRAS · [M] BISU · [H] SEMBUNYI
            </div>
          )}
        </div>
      </div>
    </PresCtx.Provider>
  );
}
