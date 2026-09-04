"use client";

import { useRef, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { usePres } from "../context";
import { useSectionKeys } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";
import { usePollingData } from "./s5/usePollingData";
import ScoreboardOverlay from "./s5/ScoreboardOverlay";
import PollingOptionsGrid from "./s5/PollingOptionsGrid";
import PollingResultBars from "./s5/PollingResultBars";
import PollingQrBox from "./s5/PollingQrBox";
import PollingIntro from "./s5/PollingIntro";

/**
 * Section 5 — Sesi Interaktif (Live Polling).
 * Step 0: kalimat pemantik · 1: Q1 live · 2: Q1 reveal · 3: Q2 live · 4: Q2 reveal.
 * F = fallback manual (klik opsi) · R = reset polling.
 */
export default function S5Polling({ step }: { step: number }) {
  const { setStep, hud, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);

  const qid = step === 1 || step === 2 ? 1 : step === 3 || step === 4 ? 2 : 0;
  const live = step === 1 || step === 3;
  const revealed = step === 2 || step === 4;
  const liveKey = live && qid ? `q${qid}` : "";

  const [fallback, setFallback] = useState(false);
  const [scoreFor, setScoreFor] = useState<{ qid: number; step: number } | null>(null);
  const [manual, setManual] = useState<{ qid: number; option: string } | null>(null);

  const {
    counts,
    total,
    devices,
    synced,
    notice,
    spark,
    resetPoll,
  } = usePollingData({
    qid,
    live,
    fallback,
    liveKey,
    hud,
  });

  const question = QUESTIONS.find((q) => q.id === qid) ?? QUESTIONS[0];
  const manualChoice = manual && qid > 0 && manual.qid === qid ? manual.option : null;
  const scoreOpen =
    !!scoreFor &&
    revealed &&
    total > 0 &&
    scoreFor.qid === qid &&
    scoreFor.step === step;

  // Reveal — mayoritas kelas & statistik jawaban benar
  const maxCount =
    qid > 0 ? Math.max(0, ...question.options.map((o) => counts[o.key] ?? 0)) : 0;
  const winners =
    maxCount > 0
      ? question.options
          .filter((o) => (counts[o.key] ?? 0) === maxCount)
          .map((o) => o.key)
      : [];
  const correctKey = question.options.find((o) => o.correct)?.key;
  const correctCount = correctKey ? (counts[correctKey] ?? 0) : 0;
  const correctPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const verdict =
    total === 0
      ? null
      : correctPct >= 80
        ? "Hampir seluruh ruangan sudah sejalan dengan teorinya."
        : correctPct >= 50
          ? "Mayoritas di jalur — sisanya bagian menarik untuk dibedah."
          : correctPct > 0
            ? "Yang benar justru minoritas — mari lihat kenapa."
            : "Seluruh kelas terpesona jebakan — momen bedah paling bagus.";

  useSectionKeys((key) => {
    if (key === "p") {
      if (!revealed) {
        hud("PAPAN SKOR — TERSEDIA SAAT PEMBAHASAN TERBUKA");
      } else if (total === 0) {
        hud("PAPAN SKOR MENUNGGU — BELUM ADA SUARA");
      } else if (scoreOpen) {
        setScoreFor(null);
        hud("PAPAN SKOR — TERTUTUP [P]", "ember");
      } else {
        setScoreFor({ qid, step });
        hud("PAPAN SKOR — TAMPIL [P]", "ember");
      }
      return true;
    }
    if (key === "f") {
      setFallback((f) => {
        const nf = !f;
        hud(
          nf
            ? "FALLBACK AKTIF — KLIK OPSI DI LAYAR"
            : "POLLING LIVE DIAKTIFKAN KEMBALI",
          "ember",
        );
        return nf;
      });
      return true;
    }
    if (key === "r") {
      void resetPoll();
      return true;
    }
    if (key === "e") {
      const a = document.createElement("a");
      a.href = "/api/export";
      a.rel = "noopener";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      hud("EKSPOR CSV — HASIL POLLING DIUNDUH", "ember");
      return true;
    }
    return false;
  });

  const choose = (key: string) => {
    if (!live || !fallback || manualChoice) return;
    setManual({ qid, option: key });
    setStep(step + 1);
  };

  return (
    <div ref={root} className="absolute inset-0 px-[7vw]">
      <Kicker act="05">SESI INTERAKTIF</Kicker>
      <BigNumeral>05</BigNumeral>

      {/* ---- Step 0 — kalimat pemantik ---- */}
      {step === 0 && <PollingIntro settled={settled} />}

      {/* ---- Papan skor [P] — peringkat opsi pada langkah reveal ---- */}
      {qid > 0 && scoreOpen && (
        <ScoreboardOverlay
          qid={qid}
          question={question}
          counts={counts}
          total={total}
          maxCount={maxCount}
          correctPct={correctPct}
          correctCount={correctCount}
          verdict={verdict}
        />
      )}

      {/* ---- Pertanyaan live / reveal (tampilan standar) ---- */}
      {qid > 0 && !scoreOpen && (
        <div className="absolute inset-0 flex flex-col px-[8vw] pt-[12vh] pb-[8vh]">
          <div className="flex items-baseline gap-4">
            <span className="font-code text-[10px] tracking-[0.3em] text-ember">
              PERTANYAAN 0{qid}
            </span>
            <span className="font-code text-[10px] tracking-[0.2em] text-mute">
              {live ? "BUKA /VOTING DI HP-MU" : "HASIL & PEMBAHASAN"}
            </span>
          </div>
          <h2 className="mt-3 max-w-[62vw] font-display text-[2.5vw] leading-[1.15] text-paper">
            {question.prompt}
          </h2>

          <PollingOptionsGrid
            question={question}
            revealed={revealed}
            winners={winners}
            manualChoice={manualChoice}
            live={live}
            fallback={fallback}
            onChoose={choose}
          />

          {/* Statistik benar — angka besar momen reveal */}
          {revealed && total > 0 && (
            <div
              key={`stat-${qid}-${total}`}
              className="reveal-stat mt-[2.4vh] flex items-baseline gap-[1.4vw]"
            >
              <span
                className="font-display text-[4vw] leading-none text-ember"
                aria-label={`${correctPct} persen kelas menjawab benar`}
              >
                {correctPct}%
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-code text-[10px] tracking-[0.25em] text-mute">
                  KELAS MENJAWAB BENAR · {correctCount}/{total} SUARA
                </span>
                <span className="font-display italic text-[1.25vw] leading-snug text-paper/80">
                  {verdict}
                </span>
              </div>
            </div>
          )}

          {/* Pembahasan saat reveal */}
          {revealed && (
            <div
              key={`expl-${qid}`}
              className="fade-slide-in mt-[2.6vh] max-w-[56vw] border-l-2 border-ember pl-[1.4vw]"
            >
              <p className="font-code text-[10px] tracking-[0.3em] text-ember">
                MENGAPA —
              </p>
              <p className="mt-2 font-body text-[1.15vw] leading-relaxed text-paper/85">
                {question.answerNote}
              </p>
            </div>
          )}

          {/* Baris bawah: QR + hasil live */}
          <div className="mt-auto flex items-end justify-between">
            <PollingQrBox qid={qid} revealed={revealed} />

            <PollingResultBars
              question={question}
              counts={counts}
              total={total}
              revealed={revealed}
              winners={winners}
              live={live}
              devices={devices}
              synced={synced}
              fallback={fallback}
              spark={spark}
            />
          </div>
        </div>
      )}

      {/* Notifikasi threshold di area HUD presenter */}
      {notice === liveKey && live && !fallback && (
        <div className="absolute bottom-[7vh] left-[6vw] z-30 border border-ember/40 bg-base/85 px-4 py-2.5 font-code text-[10px] tracking-[0.18em] text-ember">
          RESPONDEN &lt; 10 — FALLBACK TERSEDIA [ F ]
        </div>
      )}
    </div>
  );
}
