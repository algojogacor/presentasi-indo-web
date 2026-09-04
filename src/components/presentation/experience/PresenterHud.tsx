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
  clockRunning: boolean;
  elapsed: number;
  rehearsalOn: boolean;
  remaining: number;
  planDelta: number;
  contrast: boolean;
  muted: boolean;
  helpOn: boolean;
}

export default function PresenterHud({
  huds,
  section,
  step,
  gShow,
  mapOpen,
  helpSheet,
  notesOpen,
  clockRunning,
  elapsed,
  rehearsalOn,
  remaining,
  planDelta,
  contrast,
  muted,
  helpOn,
}: PresenterHudProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-5 left-6 z-[70] border-l border-edge/70 pl-3 font-code text-[10px] leading-[1.8] tracking-[0.14em]"
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
        {helpSheet ? " // BANTUAN" : ""}
        {notesOpen ? " // CATATAN" : ""}
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
      {(contrast || muted) && (
        <div className="mt-0.5 flex gap-1.5">
          {contrast && <span className="hud-lamp">C+</span>}
          {muted && <span className="hud-lamp">MUTE</span>}
          {notesOpen && <span className="hud-lamp">NOTE</span>}
        </div>
      )}
      {helpOn && (
        <div className="text-[9px] tracking-[0.2em] text-paper/30">
          [SPACE] LANJUT · [G]+# LOMPAT · [O] PETA · [N] CATATAN · [T] LATIHAN · [?] BANTUAN · [H] SEMBUNYI
        </div>
      )}
    </div>
  );
}
