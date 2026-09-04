import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";
import { SECTIONS } from "../context";
import { getRehearsalOn, setRehearsal } from "../session";
import { stepDuration } from "../rehearsal";

const pad2 = (n: number) => String(n).padStart(2, "0");

interface UseExperienceKeyboardProps {
  section: number;
  step: number;
  mapOpen: boolean;
  helpSheet: boolean;
  notesOpen: boolean;
  savedPos: { section: number; step: number } | null;
  advance: () => void;
  back: () => void;
  goto: (s: number, st?: number) => void;
  resume: () => void;
  toggleContrast: () => void;
  toggleMute: () => void;
  hud: (msg: string, tone?: "info" | "ember") => void;
  setHelpSheet: React.Dispatch<React.SetStateAction<boolean>>;
  setMapOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHelpOn: React.Dispatch<React.SetStateAction<boolean>>;
  keyHandlerRef: React.MutableRefObject<
    ((k: string, e: KeyboardEvent) => boolean | void) | null
  >;
}

export function useExperienceKeyboard({
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
}: UseExperienceKeyboardProps) {
  const [gShow, setGShow] = useState(false);
  const gArmedRef = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (k === " " || k === "ArrowRight" || k === "ArrowLeft") {
        e.preventDefault();
      }
      audio.init();

      // Izinkan handler section (misal Section 0 Step 0) mencegat tombol sebelum aksi global
      if (keyHandlerRef.current?.(k, e)) {
        return;
      }

      // [?] / [F1] — lembar bantuan lengkap
      if (k === "?" || k === "F1") {
        e.preventDefault();
        setHelpSheet((h) => !h);
        audio.tick();
        return;
      }
      if (helpSheet) {
        if (k === "Escape" || k === "?") setHelpSheet(false);
        return;
      }

      // [O] / [Tab] — peta navigasi
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
        return;
      }

      // [Esc] — tutup panel catatan presenter
      if (k === "Escape" && notesOpen) {
        setNotesOpen(false);
        return;
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

      // Mode jump G + angka
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
      // [N] — catatan presenter
      if (lk === "n") {
        audio.tick();
        setNotesOpen((v) => !v);
        hud(
          notesOpen ? "CATATAN PRESENTER — DITUTUP [N]" : "CATATAN PRESENTER — AKTIF [N]",
          "ember",
        );
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
      // [T] — mode latihan
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
      // Tombol khusus section
      keyHandlerRef.current?.(lk, e);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    section,
    step,
    mapOpen,
    helpSheet,
    notesOpen,
    savedPos,
    advance,
    back,
    goto,
    hud,
    resume,
    toggleContrast,
    toggleMute,
    setHelpSheet,
    setMapOpen,
    setNotesOpen,
    setHelpOn,
    keyHandlerRef,
  ]);

  return { gShow };
}
