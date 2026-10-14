"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  BookOpen,
  Volume2,
  Clock,
  Layers,
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
} from "lucide-react";
import { SECTIONS, PresCtx, type PresApi } from "@/components/presentation/context";
import { SECTION_COMPONENTS } from "@/components/presentation/sections";
import { SPEAKER_NOTES, getSpeakerNote, type SpeakerNoteItem } from "@/data/speakerNotes";
import { Grain } from "@/components/presentation/atoms";

const pad2 = (n: number) => String(n).padStart(2, "0");

const FONT_CLASSES = {
  sm: "text-sm leading-relaxed",
  base: "text-base leading-relaxed md:text-lg md:leading-loose",
  lg: "text-lg leading-loose md:text-xl md:leading-loose",
  xl: "text-xl leading-loose md:text-2xl md:leading-loose font-medium",
};

export default function PresenterWorkspacePage() {
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedStep, setSelectedStep] = useState(0);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [mobileTab, setMobileTab] = useState<"script" | "slide">("script");

  // Timer Latihan / Stopwatch Mandiri
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Auto-scroll naskah ke atas saat ganti slide
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const maxSteps = SECTIONS[selectedSection]?.steps ?? 1;

  // Navigasi langkah independen (hanya lokal di halaman ini)
  const handlePrevStep = useCallback(() => {
    if (selectedStep > 0) {
      setSelectedStep((s) => s - 1);
    } else if (selectedSection > 0) {
      const prevSec = selectedSection - 1;
      setSelectedSection(prevSec);
      setSelectedStep(SECTIONS[prevSec].steps - 1);
    }
  }, [selectedSection, selectedStep]);

  const handleNextStep = useCallback(() => {
    if (selectedStep < maxSteps - 1) {
      setSelectedStep((s) => s + 1);
    } else if (selectedSection < SECTIONS.length - 1) {
      setSelectedSection((s) => s + 1);
      setSelectedStep(0);
    }
  }, [selectedSection, selectedStep, maxSteps]);

  // Lompat ke babak tertentu
  const handleSelectSection = (secIdx: number) => {
    setSelectedSection(secIdx);
    setSelectedStep(0);
  };

  // Keyboard shortcut lokal (ArrowLeft, ArrowRight, J, K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        handlePrevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStep, handlePrevStep]);

  // Scroll naskah ke atas saat langkah berubah
  useEffect(() => {
    if (scriptContainerRef.current) {
      scriptContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedSection, selectedStep]);

  // Dapatkan naskah & metadata untuk langkah aktif
  const currentNote: SpeakerNoteItem | null = useMemo(() => {
    return (
      getSpeakerNote(selectedSection, selectedStep) ?? {
        id: `s${selectedSection}_${selectedStep}`,
        section: selectedSection,
        step: selectedStep,
        actTitle: `BABAK ${pad2(selectedSection)} · ${SECTIONS[selectedSection]?.label ?? ""}`,
        stepTitle: `Langkah ${pad2(selectedStep + 1)}`,
        durationHint: "1 menit",
        keyMessage: "Sampaikan poin materi ini dengan jelas, terstruktur, dan percaya diri.",
        visualContext: "Visual slide ditampilkan di layar utama.",
        spokenScript: "Jelaskan konsep pada slide ini secara mendalam dengan mengacu pada struktur makalah yang telah dipersiapkan.",
        deliveryTips: ["Perhatikan tempo bicara dan tatap hadirin."],
      }
    );
  }, [selectedSection, selectedStep]);

  // Mock PresApi untuk pratinjau slide di dalam workspace
  // TIDAK mengubah state sesi live dan TIDAK memancarkan socket event
  const mockPresApi = useMemo<PresApi>(
    () => ({
      section: selectedSection,
      step: selectedStep,
      settled: true,
      setStep: (s) => setSelectedStep(s),
      goto: (sec, st = 0) => {
        setSelectedSection(sec);
        setSelectedStep(st);
      },
      registerKeyHandler: () => {},
      registerTimeline: () => {},
      hud: () => {},
    }),
    [selectedSection, selectedStep],
  );

  const CurrentSectionComp = SECTION_COMPONENTS[selectedSection] ?? SECTION_COMPONENTS[0];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${pad2(m)}:${pad2(s)}`;
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-[#F0EDE8] flex flex-col select-none">
      <Grain />

      {/* TOP HEADER: Branding & Global Tools */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0F]/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          {/* Logo & Judul */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-code text-xs text-mute hover:text-paper hover:bg-white/10 transition-colors"
              title="Buka Presentasi Utama"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Presentasi Utama</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E8A020]" />
                <span className="font-code text-[11px] uppercase tracking-wider text-[#E8A020] font-bold">
                  WORKSPACE PERSIAPAN PEMBICARA
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 font-code text-[10px] text-mute uppercase">
                  MODE MANDIRI
                </span>
              </div>
              <h1 className="font-display text-sm sm:text-base font-bold text-paper hidden sm:block">
                Anatomi Karya Tulis Ilmiah · Kelompok 6 PDB 93
              </h1>
            </div>
          </div>

          {/* Controls: Font Size, Rehearsal Stopwatch, Switchers */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Stopwatch Latihan Mandiri */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 font-code text-xs">
              <Clock className="w-3.5 h-3.5 text-ember" />
              <span className="text-ember font-bold tabular-nums min-w-[38px]">
                {formatTimer(timerSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="ml-1 text-mute hover:text-paper p-0.5"
                title={timerRunning ? "Jeda Stopwatch" : "Mulai Stopwatch"}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="text-mute hover:text-paper p-0.5"
                title="Reset Stopwatch"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/50 p-0.5 font-code text-xs">
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 rounded ${fontSize === "sm" ? "bg-white/20 text-paper font-bold" : "text-mute hover:text-paper"}`}
                title="Teks Kecil"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("base")}
                className={`px-2 py-0.5 rounded ${fontSize === "base" ? "bg-white/20 text-paper font-bold" : "text-mute hover:text-paper"}`}
                title="Teks Standar"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 rounded ${fontSize === "lg" ? "bg-white/20 text-paper font-bold" : "text-mute hover:text-paper"}`}
                title="Teks Besar"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize("xl")}
                className={`px-2 py-0.5 rounded ${fontSize === "xl" ? "bg-white/20 text-paper font-bold" : "text-mute hover:text-paper"}`}
                title="Teks Ekstra Besar (Teleprompter)"
              >
                XL
              </button>
            </div>
          </div>
        </div>

        {/* ACT TABS QUICK SELECTOR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none max-w-7xl mx-auto w-full">
          {SECTIONS.map((sec, idx) => {
            const isActive = idx === selectedSection;
            return (
              <button
                key={sec.label}
                type="button"
                onClick={() => handleSelectSection(idx)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 font-code text-[11px] sm:text-xs transition-all ${
                  isActive
                    ? "bg-[#E8A020] text-black font-bold shadow-[0_0_12px_rgba(232,160,32,0.35)]"
                    : "bg-white/5 text-mute hover:bg-white/10 hover:text-paper"
                }`}
              >
                <span className="opacity-75">{pad2(idx)}</span> · {sec.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* MOBILE TAB SWITCHER: Naskah vs Pratinjau Slide */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-[#0C0C12]">
        <button
          type="button"
          onClick={() => setMobileTab("script")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-code text-xs font-semibold border-b-2 transition-all ${
            mobileTab === "script"
              ? "border-[#E8A020] text-[#E8A020] bg-white/[0.02]"
              : "border-transparent text-mute hover:text-paper"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Naskah Pembicara</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("slide")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-code text-xs font-semibold border-b-2 transition-all ${
            mobileTab === "slide"
              ? "border-[#E8A020] text-[#E8A020] bg-white/[0.02]"
              : "border-transparent text-mute hover:text-paper"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Pratinjau Slide</span>
        </button>
      </div>

      {/* MAIN WORKSPACE CONTENT: Side-by-side on desktop, tabbed/stacked on mobile */}
      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 p-4 sm:p-6 overflow-hidden">
        {/* KOLOM KIRI: Slide Preview & Local Slide Controls (visible on desktop or if mobileTab === 'slide') */}
        <section
          className={`flex flex-col gap-4 overflow-hidden ${
            mobileTab === "slide" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Pratinjau Frame Slide */}
          <div className="relative rounded-2xl border border-white/15 bg-black overflow-hidden shadow-2xl aspect-[16/10] sm:aspect-[16/9] w-full flex flex-col">
            <PresCtx.Provider value={mockPresApi}>
              <div className="absolute inset-0 overflow-hidden pointer-events-auto">
                <CurrentSectionComp step={selectedStep} />
              </div>
            </PresCtx.Provider>

            {/* Overlay Indikator Slide */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none rounded-md bg-black/70 backdrop-blur px-2.5 py-1 font-code text-[11px] text-[#E8A020] border border-[#E8A020]/30">
              Pratinjau: Babak {pad2(selectedSection)} · Langkah {selectedStep + 1}/{maxSteps}
            </div>
          </div>

          {/* Navigator Langkah & Tombol Cepat */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-code text-[11px] text-mute uppercase tracking-wider block">
                  Navigasi Langkah Babak {pad2(selectedSection)}
                </span>
                <span className="font-display font-semibold text-sm text-paper">
                  {currentNote.stepTitle}
                </span>
              </div>

              {/* Step Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxSteps }).map((_, stIdx) => (
                  <button
                    key={stIdx}
                    type="button"
                    onClick={() => setSelectedStep(stIdx)}
                    className={`h-2.5 rounded-full transition-all ${
                      stIdx === selectedStep
                        ? "w-6 bg-[#E8A020]"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`Lompat ke Langkah ${stIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Tombol Sebelumnya & Berikutnya */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={selectedSection === 0 && selectedStep === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 font-code text-xs font-semibold text-paper hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.99] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya [← / K]</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  selectedSection === SECTIONS.length - 1 &&
                  selectedStep === maxSteps - 1
                }
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8A020] py-2.5 font-code text-xs font-bold text-black hover:bg-[#FFB740] disabled:opacity-30 disabled:pointer-events-none active:scale-[0.99] transition-all shadow-[0_0_15px_rgba(232,160,32,0.25)]"
              >
                <span>Berikutnya [→ / J]</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* KOLOM KANAN: Teleprompter Naskah Lisan & Catatan Pembicara (visible on desktop or if mobileTab === 'script') */}
        <section
          ref={scriptContainerRef}
          className={`flex flex-col gap-5 overflow-y-auto pr-1 lg:max-h-[calc(100vh-140px)] ${
            mobileTab === "script" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Card Header Langkah */}
          <div className="rounded-2xl border border-white/15 bg-[#101018] p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-code text-xs font-bold text-[#E8A020] uppercase tracking-wider">
                  {currentNote.actTitle}
                </span>
                <span className="text-mute font-code text-xs">•</span>
                <span className="font-code text-xs text-mute">
                  Langkah {selectedStep + 1} dari {maxSteps}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 px-3 py-1 font-code text-xs text-[#E8A020]">
                <Clock className="w-3.5 h-3.5 text-[#E8A020]" />
                <span>Durasi: {currentNote.durationHint}</span>
              </div>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-paper">
              {currentNote.stepTitle}
            </h2>

            {/* Inti Pesan (Key Message) */}
            <div className="rounded-xl border border-[#E8A020]/30 bg-[#E8A020]/[0.08] p-3.5 sm:p-4">
              <div className="flex items-center gap-2 font-code text-[11px] uppercase tracking-wider text-[#E8A020] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E8A020]" />
                <span>Pesan Kunci yang Harus Tersampaikan</span>
              </div>
              <p className="font-body text-xs sm:text-sm text-paper/90 leading-relaxed font-medium">
                {currentNote.keyMessage}
              </p>
            </div>
          </div>

          {/* TELEPROMPTER: Naskah Lisan Pembicara */}
          <div className="rounded-2xl border border-white/15 bg-[#12111A] p-5 sm:p-7 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-code text-xs uppercase tracking-wider text-paper/90 font-bold">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Naskah Lisan Pembicara (Bahasa Indonesia Natural)</span>
              </div>
              <span className="font-code text-[11px] text-mute">
                Ucapkan dengan artikulasi wajar & mengalir
              </span>
            </div>

            {/* Spoken Script Text */}
            <div className={`font-body text-paper/95 whitespace-pre-line tracking-wide ${FONT_CLASSES[fontSize]}`}>
              {currentNote.spokenScript}
            </div>
          </div>

          {/* Konteks Visual & Tips Gestur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Konteks Visual di Layar */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 font-code text-[11px] uppercase tracking-wider text-mute font-bold">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Apa yang Sedang Tampil di Layar</span>
              </div>
              <p className="font-body text-xs text-paper/80 leading-relaxed">
                {currentNote.visualContext}
              </p>
            </div>

            {/* Tips Intonasi & Gestur */}
            {currentNote.deliveryTips && currentNote.deliveryTips.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <div className="flex items-center gap-2 font-code text-[11px] uppercase tracking-wider text-mute font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tips Gestur & Intonasi</span>
                </div>
                <ul className="list-disc list-inside font-body text-xs text-paper/80 space-y-1">
                  {currentNote.deliveryTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar (if in script tab) */}
          <div className="lg:hidden sticky bottom-2 pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={selectedSection === 0 && selectedStep === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/90 py-3 font-code text-xs font-semibold text-paper shadow-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={
                selectedSection === SECTIONS.length - 1 &&
                selectedStep === maxSteps - 1
              }
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8A020] py-3 font-code text-xs font-bold text-black shadow-lg disabled:opacity-30"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
