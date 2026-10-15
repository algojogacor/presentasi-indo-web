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
  const { setStep, hud, settled, sessionCode } = usePres();
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
    sessionCode,
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
    <div ref={root} className="absolute inset-0 px-6 sm:px-[8vw]">
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
        <div className="absolute inset-0 flex flex-col justify-between px-6 sm:px-[8vw] pt-12 md:pt-[10vh] pb-8 md:pb-[5vh] overflow-y-auto">
          {/* Bagian Atas: Header, Prompt Pertanyaan, dan Grid 4 Opsi */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-4">
              <span className="font-code text-xs sm:text-sm tracking-[0.3em] text-ember font-medium">
                PERTANYAAN 0{qid}
              </span>
              <span className="font-code text-xs sm:text-sm tracking-[0.2em] text-mute/85">
                {live ? "VOTING OTOMATIS AKTIF DI HP ANDA" : "HASIL & PEMBAHASAN"}
              </span>
            </div>
            <h2 className="mt-2 sm:mt-2.5 max-w-full md:max-w-[70vw] font-display text-[clamp(1.5rem,2.5vw,2.9rem)] leading-[1.2] text-paper">
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
          </div>

          {/* Bagian Bawah: QR Code (saat Live) / Pembahasan Akademik (saat Reveal) di Kiri + Chart Hasil di Kanan */}
          <div className="mt-4 md:mt-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 pt-2 pb-1">
            {/* Sisi Kiri Bawah: QR Code saat Live, atau Pembahasan & Stat saat Reveal */}
            <div className="w-full md:max-w-[46vw] shrink-0">
              {live && <PollingQrBox qid={qid} revealed={false} />}

              {revealed && (
                <div key={`expl-${qid}`} className="fade-slide-in flex flex-col gap-2">
                  {/* Statistik benar — angka besar momen reveal jika ada responden */}
                  {total > 0 && (
                    <div
                      key={`stat-${qid}-${total}`}
                      className="reveal-stat flex items-baseline gap-3 mb-0.5"
                    >
                      <span
                        className="font-display text-[clamp(2.2rem,3.4vw,3.6rem)] leading-none text-ember font-bold"
                        aria-label={`${correctPct} persen kelas menjawab benar`}
                      >
                        {correctPct}%
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-code text-[10.5px] sm:text-xs tracking-[0.2em] text-mute/85 font-medium">
                          KELAS MENJAWAB BENAR · {correctCount}/{total} SUARA
                        </span>
                        <span className="font-display italic text-xs sm:text-sm leading-snug text-paper/90">
                          {verdict}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Uraian Pembahasan Akademik Makalah */}
                  <div className="border-l-2 border-ember pl-3.5 sm:pl-4 py-0.5">
                    <p className="font-code text-xs sm:text-sm tracking-[0.3em] text-ember font-medium">
                      MENGAPA —
                    </p>
                    <p className="mt-1 font-body text-xs sm:text-sm md:text-[1.12vw] leading-relaxed text-paper/90">
                      {question.answerNote}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sisi Kanan Bawah: Chart Hasil Suara (Live / Final) */}
            <div className="w-full md:w-[36vw] shrink-0">
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
        </div>
      )}
    </div>
  );
}
