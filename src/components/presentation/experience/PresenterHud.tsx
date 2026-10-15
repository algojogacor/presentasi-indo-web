import { SECTIONS } from "../context";
import { fmtDelta } from "../rehearsal";

const pad2 = (n: number) => String(n).padStart(2, "0");

export interface HudMessage {
  id: number;
  msg: string;
  tone: "info" | "ember";
}

interface PresenterHudProps {
  huds: HudMessage[];
  section: number;
  step: number;
  gShow: boolean;
  mapOpen: boolean;
  helpSheet: boolean;
  notesOpen: boolean;
  bibOpen?: boolean;
  clockRunning: boolean;
  elapsed: number;
  rehearsalOn: boolean;
  remaining: number;
  planDelta: number;
  contrast: boolean;
  muted: boolean;
  helpOn: boolean;
  sessionCode?: string;
  audienceCount?: number;
  onOpenLobby?: () => void;
}

export default function PresenterHud({
  huds,
  section,
  step,
  gShow,
  mapOpen,
  helpSheet,
  notesOpen,
  bibOpen,
  clockRunning,
  elapsed,
  rehearsalOn,
  remaining,
  planDelta,
  contrast,
  muted,
  helpOn,
  sessionCode,
  audienceCount = 0,
  onOpenLobby,
}: PresenterHudProps) {
  return (
    <div className="pointer-events-none fixed bottom-2 left-3 sm:bottom-2.5 sm:left-6 md:left-[3vw] z-[70] select-none font-code text-[10px] sm:text-[11px] tracking-wider text-mute/80 flex items-center gap-x-2 sm:gap-x-2.5 max-w-[65vw] overflow-x-hidden">
      {/* Floating Toast Notification saat aksi hotkey (muncul di atas bar horizontal) */}
      {huds.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1.5 flex flex-col gap-1 pointer-events-none">
          {huds.map((h) => (
            <div
              key={h.id}
              className={`px-2 py-0.5 rounded text-[10px] font-code backdrop-blur shadow-lg ${
                h.tone === "ember"
                  ? "bg-amber-950/90 text-ember border border-amber-500/30 font-bold animate-pulse"
                  : "bg-black/85 text-paper border border-white/15"
              }`}
            >
              {h.msg}
            </div>
          ))}
        </div>
      )}

      {/* Floating Keyboard Shortcuts Guide saat tombol [?] aktif */}
      {helpOn && (
        <div className="absolute bottom-full left-0 mb-6 hidden md:block text-[9px] tracking-[0.2em] text-paper/50 bg-black/90 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 shadow-xl">
          [SPACE] LANJUT · [P] PUSTAKA · [L] LAMPIRAN · [G]+# LOMPAT · [O] PETA · [N] CATATAN · [T] LATIHAN · [?] BANTUAN
        </div>
      )}

      {/* 1. Sesi & Jumlah Audiens Terhubung */}
      {sessionCode && (
        <div className="text-emerald-400 font-semibold flex items-center gap-1.5 pointer-events-auto shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SESI {sessionCode}</span>
          <span className="text-white/20">·</span>
          <span>{audienceCount} AUDIENS</span>
          {onOpenLobby && (
            <button
              type="button"
              onClick={onOpenLobby}
              className="ml-0.5 text-paper/70 hover:text-ember underline text-[9px] uppercase tracking-wider"
              title="Kembali ke layar QR Lobi"
            >
              [LOBI QR]
            </button>
          )}
        </div>
      )}

      {sessionCode && <span className="text-white/20 shrink-0">·</span>}

      {/* 2. Indikator Babak & Langkah Aktif (ACT // STEP) */}
      <div className="shrink-0 flex items-center gap-1">
        <span className="text-[#E8A020] font-semibold">{`ACT.${pad2(section)}`}</span>
        <span className="text-white/30">//</span>
        <span>{`STEP.${pad2(step)}/${pad2(SECTIONS[section].steps - 1)}`}</span>
        {gShow && <span className="text-amber-400 font-bold"> // G→_</span>}
        {mapOpen && <span className="text-amber-300"> // PETA</span>}
        {helpSheet && <span className="text-amber-300"> // BANTUAN</span>}
        {notesOpen && <span className="text-amber-300"> // CATATAN</span>}
        {bibOpen && <span className="text-amber-300"> // PUSTAKA</span>}
      </div>

      {/* 3. Waktu Berjalan (Stopwatch / Elapsed Time) */}
      {clockRunning && (
        <>
          <span className="text-white/20 shrink-0">·</span>
          <div className={`shrink-0 ${elapsed >= 50 * 60 ? "text-ember/90 font-bold" : "text-paper/70"}`}>
            {`T+${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)} / 60:00`}
          </div>
        </>
      )}

      {/* 4. Indikator Rehearsal Timer (jika mode latihan menyala) */}
      {rehearsalOn && clockRunning && (
        <>
          <span className="text-white/20 shrink-0">·</span>
          <div className={`shrink-0 ${remaining <= 10 ? "text-ember/85 font-semibold" : "text-paper/60"}`}>
            {`REHEARSAL ${pad2(remaining)}S`}
          </div>
          <div
            className={`shrink-0 ${
              planDelta > 60
                ? "text-ember/85"
                : planDelta < -45
                  ? "text-paper/55"
                  : "text-paper/45"
            }`}
          >
            {`(${fmtDelta(planDelta)})`}
          </div>
        </>
      )}

      {/* 5. Lampu Status Fitur (Contrast, Mute, Note, Bib) */}
      {(contrast || muted || notesOpen || bibOpen) && (
        <>
          <span className="text-white/20 shrink-0">·</span>
          <div className="flex items-center gap-1 shrink-0">
            {contrast && <span className="hud-lamp">C+</span>}
            {muted && <span className="hud-lamp">MUTE</span>}
            {notesOpen && <span className="hud-lamp">NOTE</span>}
            {bibOpen && <span className="hud-lamp">PUSTAKA</span>}
          </div>
        </>
      )}
    </div>
  );
}
