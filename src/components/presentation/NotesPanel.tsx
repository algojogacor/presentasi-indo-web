"use client";

import { useSyncExternalStore } from "react";
import { stepNote, NOTE_PLAN } from "@/lib/notes";
import {
  REHEARSAL_PLAN,
  PLAN_TOTAL,
  plannedElapsed,
  stepDuration,
  fmtDelta,
} from "./rehearsal";
import { subscribeSession, getClockRunning, getElapsedSeconds } from "./session";

const pad2 = (n: number) => String(n).padStart(2, "0");

const fmtDur = (sec: number) =>
  sec >= 60 ? `${Math.round(sec / 60)}′` : `${sec}″`;

/**
 * Panel catatan presenter — panduan penyampaian per langkah.
 * NON-MODAL: [N] membuka/menutup; navigasi tetap hidup saat panel terbuka
 * sehingga konten mengikuti posisi terkini secara langsung. [ESC] menutup.
 */
export default function NotesPanel({
  section,
  step,
  onClose,
}: {
  section: number;
  step: number;
  onClose: () => void;
}) {
  const note = stepNote(section, step);
  const act = NOTE_PLAN[section] ?? [];
  const dur = stepDuration(section, step);
  const actTotal = (REHEARSAL_PLAN[section] ?? []).reduce(
    (s, x) => s + x,
    0,
  );
  const next = act[step + 1] ?? null;
  const prev = step > 0 ? act[step - 1] : null;

  // Tempo hidup — jam sesi (store eksternal, detak 1 detik) dibandingkan
  // dengan jadwal rencana langkah ini: terlambat menyala ember.
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
  const planned = plannedElapsed(section, step);
  const delta = elapsed - planned;
  const planLeft = Math.max(0, PLAN_TOTAL - planned);

  return (
    <aside
      className="notes-panel pointer-events-none fixed bottom-[10vh] right-[6vw] z-[72] w-[21vw] min-w-[280px]"
      role="complementary"
      aria-label="Catatan presenter"
    >
      <div className="border border-edge/90 bg-base/92 backdrop-blur-[3px] p-4">
        {/* Kepala panel */}
        <div className="flex items-baseline justify-between gap-3 border-b border-edge pb-2">
          <p className="font-code text-[9px] tracking-[0.3em] text-ember">
            {`CATATAN · ACT.${pad2(section)} STEP.${pad2(step)}`}
          </p>
          <p className="font-code text-[9px] tracking-[0.18em] text-mute/80">
            {`RENCANA ${fmtDur(dur)} / ${fmtDur(actTotal)}`}
          </p>
        </div>

        {/* Strip tempo hidup — T+ aktual · selisih jadwal · sisa rencana */}
        {clockRunning && (
          <div
            className="mt-2 flex items-baseline justify-between gap-2 font-code text-[8.5px] tracking-[0.14em]"
            aria-label="Tempo sesi"
          >
            <span className="text-paper/70">
              {`T+${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)}`}
            </span>
            <span
              className={
                delta > 60
                  ? "text-ember/85"
                  : delta < -45
                    ? "text-paper/45"
                    : "text-paper/60"
              }
            >
              {`JADWAL ${fmtDelta(delta)}`}
            </span>
            <span className="text-mute/80">{`SISA ${fmtDur(planLeft)}`}</span>
          </div>
        )}

        {/* Isi — judul langkah + cue penyampaian */}
        <p className="mt-3 font-display text-[1.05vw] leading-snug text-paper">
          {note.t}
        </p>
        <p className="mt-2 font-body text-[0.86vw] leading-relaxed text-paper/65">
          {note.c}
        </p>

        {/* Konteks langkah sebelum/sesudah */}
        <div className="mt-3 space-y-1 border-t border-edge pt-2.5">
          {prev && (
            <p className="font-code text-[8.5px] leading-relaxed tracking-[0.12em] text-mute/55">
              {`← ${prev.t}`}
            </p>
          )}
          {next ? (
            <p className="font-code text-[8.5px] leading-relaxed tracking-[0.12em] text-mute/55">
              {`→ ${next.t}`}
            </p>
          ) : (
            <p className="font-code text-[8.5px] leading-relaxed tracking-[0.12em] text-mute/55">
              {`→ AKHIR BABAK — ${section < 8 ? "SPACE MASUK ACT BERIKUTNYA" : "KREDIT"}`}
            </p>
          )}
        </div>
      </div>

      {/* Kaki kecil — petunjuk interaksi (di luar kartu, tetap redup) */}
      <p className="mt-1.5 text-right font-code text-[8px] tracking-[0.22em] text-paper/35">
        [N] TUTUP · PANEL NON-MODAL
      </p>
      {/* Tombol sembunyi — klik nyata (bukan pointer-events-none) */}
      <button
        type="button"
        onClick={onClose}
        className="notes-close absolute -top-3 -right-3 h-7 w-7 border border-edge bg-base font-code text-[10px] text-mute transition-colors hover:border-ember/60 hover:text-ember focus-visible:border-ember/60 focus-visible:text-ember focus-visible:outline-1 focus-visible:outline-ember"
        aria-label="Tutup panel catatan presenter"
      >
        ×
      </button>
    </aside>
  );
}
