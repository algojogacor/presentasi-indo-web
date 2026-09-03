"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { gsap } from "@/lib/gsap";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral, LiveDot } from "../atoms";

type Counts = Record<string, number>;

const INTRO_LINE = "Sekarang kita test instingnya…";

/**
 * Section 5 — Sesi Interaktif (Live Polling).
 * Step 0: kalimat pemantik · 1: Q1 live · 2: Q1 reveal · 3: Q2 live · 4: Q2 reveal.
 * F = fallback manual (klik opsi) · R = reset polling.
 */
export default function S5Polling({ step }: { step: number }) {
  const { setStep, hud, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const qrImgRef = useRef<HTMLImageElement>(null);

  const qid = step === 1 || step === 2 ? 1 : step === 3 || step === 4 ? 2 : 0;
  const live = step === 1 || step === 3;
  const revealed = step === 2 || step === 4;
  const liveKey = live && qid ? `q${qid}` : "";

  const [counts, setCounts] = useState<Counts>({});
  const [total, setTotal] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [manual, setManual] = useState<{ qid: number; option: string } | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const totalRef = useRef(0);
  const [synced, setSynced] = useState(false);
  const question = QUESTIONS.find((q) => q.id === qid) ?? QUESTIONS[0];
  const manualChoice = manual && qid > 0 && manual.qid === qid ? manual.option : null;

  // QR menuju halaman voting — set src lewat DOM agar bebas hydration mismatch.
  // Bergantung pada qid karena elemen img hanya ada saat pertanyaan tampil.
  useEffect(() => {
    if (qid === 0) return;
    const url = `${window.location.origin}/#/voting`;
    if (qrImgRef.current)
      qrImgRef.current.src = `/api/qr?data=${encodeURIComponent(url)}`;
  }, [qid]);

  // Ambil hasil terkini dari server — dipakai polling 3 detik DAN pemicu socket.
  const loadResults = useCallback(
    async (target: number) => {
      try {
        const r = await fetch(`/api/results?question=${target}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as ResultsPayload;
        const map: Counts = {};
        for (const o of j.options) map[o.key] = o.count;
        setCounts(map);
        setTotal(j.total);
        totalRef.current = j.total;
      } catch {
        /* diam — presenter tetap bisa lanjut manual */
      }
    },
    [],
  );

  // Polling HTTP 3 detik — fallback yang selalu jalan saat layar live aktif.
  useEffect(() => {
    if (!live || !qid || fallback) return;
    // Muat awal ditunda satu microtask — pemisah async yang disukai React.
    const t = setTimeout(() => void loadResults(qid), 0);
    const iv = setInterval(() => void loadResults(qid), 3000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [live, qid, fallback, loadResults]);

  // Socket real-time: suara baru → refresh instan (tanpa menunggu polling).
  // Progressive enhancement — jika mini-service tidak terjangkau, indikator
  // SYNC tidak menyala dan polling 3 detik tetap bekerja seperti biasa.
  useEffect(() => {
    if (!live || !qid || fallback) return;
    let disposed = false;
    let sock: Socket;
    try {
      sock = io("/?XTransformPort=3030", {
        path: "/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 4,
        reconnectionDelay: 2000,
        timeout: 4000,
        forceNew: true,
      });
    } catch {
      return;
    }
    sock.on("connect", () => {
      if (!disposed) setSynced(true);
    });
    sock.on("disconnect", () => {
      if (!disposed) setSynced(false);
    });
    sock.on(
      "vote:new",
      (p: { question: number; total: number | null }) => {
        if (disposed || p.question !== qid) return;
        void loadResults(qid); // tarik angka final dari sumber kebenaran
      },
    );
    sock.on("votes:reset", () => {
      if (disposed) return;
      setCounts({});
      setTotal(0);
      totalRef.current = 0;
      setNotice(null);
    });
    return () => {
      disposed = true;
      setSynced(false);
      sock.disconnect();
    };
  }, [live, qid, fallback, loadResults]);

  // Threshold: responden < 10 dalam 15 detik pertama → notifikasi fallback.
  // Notice disimpan dengan kunci liveKey agar otomatis "kedaluwarsa" saat ganti pertanyaan.
  useEffect(() => {
    if (!liveKey) return;
    const t = setTimeout(() => {
      if (totalRef.current < 10) setNotice(liveKey);
    }, 15000);
    return () => clearTimeout(t);
  }, [liveKey]);

  // Intro typewriter (TextPlugin)
  useIsoLayoutEffect(() => {
    if (step !== 0) return;
    const el = introRef.current;
    if (!el) return;
    if (settled) {
      el.textContent = INTRO_LINE;
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    const tl = gsap.timeline();
    tl.set(el, { text: "" });
    tl.to(el, {
      text: { value: INTRO_LINE, delimiter: "" },
      duration: 1.4,
      ease: "none",
    });
    return () => {
      tl.kill();
    };
     
  }, [step]);

  const resetPoll = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
      setCounts({});
      setTotal(0);
      totalRef.current = 0;
      setNotice(null);
      hud("POLLING DI-RESET — SUARA DIHAPUS", "ember");
    } catch {
      hud("RESET GAGAL — SERVER TIDAK MERESPON");
    }
  };

  useSectionKeys((key) => {
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
    return false;
  });

  const choose = (key: string) => {
    if (!live || !fallback || manualChoice) return;
    setManual({ qid, option: key });
    setStep(step + 1);
  };

  const pct = (key: string) => {
    const c = counts[key] ?? 0;
    return total > 0 ? Math.round((c / total) * 100) : 0;
  };

  return (
    <div ref={root} className="absolute inset-0 px-[7vw]">
      <Kicker act="05">SESI INTERAKTIF</Kicker>
      <BigNumeral>05</BigNumeral>

      {/* ---- Step 0 — kalimat pemantik ---- */}
      {step === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            ref={introRef}
            className="font-display italic text-[3.2vw] text-paper"
            aria-label={INTRO_LINE}
          />
          <p className="mt-6 font-code text-[10px] tracking-[0.4em] text-mute">
            TANPA GOOGLE · TANPA BUKU — INSTING SAJA · [SPACE]
          </p>
        </div>
      )}

      {/* ---- Pertanyaan live / reveal ---- */}
      {qid > 0 && (
        <div className="absolute inset-0 flex flex-col px-0 pt-[13vh] pb-[10vh]">
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

          <div className="mt-[3.2vh] grid max-w-[56vw] grid-cols-2 gap-[1.1vw]">
            {question.options.map((o) => {
              const isCorrect = revealed && o.correct;
              const isManual = manualChoice === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => choose(o.key)}
                  disabled={!live || !fallback || !!manualChoice}
                  className={`group flex items-start gap-[0.9vw] border p-[1.1vw] text-left transition-all duration-300 ${
                    isCorrect
                      ? "border-ember bg-ember/10"
                      : revealed
                        ? "border-edge opacity-35"
                        : "border-edge hover:border-ember/50"
                  } ${isManual ? "ring-1 ring-ember" : ""} ${
                    live && fallback && !manualChoice
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                  aria-label={`Opsi ${o.key}: ${o.label}`}
                >
                  <span className="pt-[0.35vw] font-code text-[11px] text-ember">
                    {o.key}
                  </span>
                  <span className="font-body text-[1.25vw] leading-snug text-paper/90">
                    {o.label}
                  </span>
                  {isCorrect && (
                    <span className="ml-auto font-code text-[9px] tracking-[0.25em] text-ember">
                      JAWABAN
                    </span>
                  )}
                </button>
              );
            })}
          </div>

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
            <div className={revealed ? "invisible" : ""}>
              <div className="relative">
                <img
                  ref={qrImgRef}
                  alt="QR code menuju halaman voting"
                  className="h-[13vh] w-[13vh]"
                  width={160}
                  height={160}
                  data-testid="poll-qr"
                />
                {/* Bingkai bidik — bracket sudut amber */}
                <span
                  aria-hidden
                  className="absolute -top-1 -left-1 h-3 w-3 border-t border-l border-ember/60"
                />
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 h-3 w-3 border-t border-r border-ember/60"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-ember/60"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-ember/60"
                />
              </div>
              <p className="mt-2 font-code text-[9px] tracking-[0.2em] text-mute">
                PINDAI → /VOTING
              </p>
            </div>

            <div className="w-[32vw]">
              <div className="mb-3 flex items-center gap-2.5">
                <LiveDot />
                <span className="font-code text-[10px] tracking-[0.2em] text-mute">
                  {live ? "LIVE" : "FINAL"} ·{" "}
                  <span key={total} className="count-flash">
                    {total}
                  </span>{" "}
                  RESPONDEN
                </span>
                {synced && live && (
                  <span className="font-code text-[9px] tracking-[0.25em] text-ember/80">
                    · SYNC
                  </span>
                )}
                {fallback && (
                  <span className="font-code text-[9px] tracking-[0.2em] text-ember">
                    FALLBACK MANUAL
                  </span>
                )}
              </div>
              {live && total === 0 && !fallback && (
                <p className="mb-3 font-code text-[10px] tracking-[0.22em] text-mute/70 animate-pulse">
                  MENUNGGU SUARA PERTAMA…
                </p>
              )}
              {question.options.map((o) => (
                <div key={o.key} className="mb-[0.9vh] flex items-center gap-3">
                  <span className="w-4 font-code text-[10px] text-mute">
                    {o.key}
                  </span>
                  <div className="h-[10px] flex-1 bg-white/6">
                    <div
                      className={`pollbar h-full ${revealed && o.correct ? "bg-ember" : "bg-ember/45"}`}
                      style={{ width: `${pct(o.key)}%` }}
                      data-testid={`pollbar-${o.key}`}
                    />
                  </div>
                  <span className="w-[4.5vw] text-right font-code text-[10px] text-paper/70">
                    {counts[o.key] ?? 0} · {pct(o.key)}%
                  </span>
                </div>
              ))}
            </div>
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
