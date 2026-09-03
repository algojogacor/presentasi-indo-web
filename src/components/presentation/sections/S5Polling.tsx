"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { gsap } from "@/lib/gsap";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral, LiveDot } from "../atoms";

type Counts = Record<string, number>;

interface TimelinePoint {
  t: number; // detik sejak suara pertama
  c: number; // jumlah suara kumulatif
}

interface TimelinePayload {
  question: number;
  total: number;
  firstAt: string | null;
  lastAt: string | null;
  span: number;
  points: TimelinePoint[];
}

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
  // Papan skor [P] — konteks pembukaan disimpan (qid + langkah), bukan boolean:
  // tampil hanya selama konteks itu masih berlaku. Menavigasi meninggalkan
  // reveal → konteks kedaluwarsa sendiri, tanpa efek/reset-state.
  const [scoreFor, setScoreFor] = useState<{ qid: number; step: number } | null>(
    null,
  );
  const [manual, setManual] = useState<{ qid: number; option: string } | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [devices, setDevices] = useState(0);
  const [spark, setSpark] = useState<TimelinePayload | null>(null);
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalRef = useRef(0);
  const [synced, setSynced] = useState(false);
  const question = QUESTIONS.find((q) => q.id === qid) ?? QUESTIONS[0];
  const manualChoice = manual && qid > 0 && manual.qid === qid ? manual.option : null;
  const scoreOpen =
    !!scoreFor &&
    revealed &&
    total > 0 &&
    scoreFor.qid === qid &&
    scoreFor.step === step;

  // Reveal — mayoritas kelas & statistik jawaban benar (dihitung saat render,
  // otomatis ikut bergerak bila suara masih masuk setelah reveal).
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

  // QR menuju halaman voting — set src lewat DOM agar bebas hydration mismatch.
  // Bergantung pada qid karena elemen img hanya ada saat pertanyaan tampil.
  useEffect(() => {
    if (qid === 0) return;
    const url = `${window.location.origin}/#/voting`;
    if (qrImgRef.current)
      qrImgRef.current.src = `/api/qr?data=${encodeURIComponent(url)}`;
  }, [qid]);

  // Kurva tempo kedatangan suara — endpoint terpisah, kontrak results tak tersentuh.
  const fetchTimeline = useCallback(async (target: number) => {
    try {
      const r = await fetch(`/api/timeline?question=${target}`, {
        cache: "no-store",
      });
      if (!r.ok) return;
      setSpark((await r.json()) as TimelinePayload);
    } catch {
      /* diam — grafik tempo opsional */
    }
  }, []);

  // Debounce: suara beruntun dalam hitungan ratus milidetik hanya menarik
  // satu refresh kurva (angka responden tetap instan lewat loadResults).
  const scheduleSpark = useCallback(
    (target: number, delay = 1400) => {
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
      sparkTimer.current = setTimeout(() => void fetchTimeline(target), delay);
    },
    [fetchTimeline],
  );

  // Muat kurva saat layar live aktif + bersihkan timer saat berganti.
  useEffect(() => {
    if (!live || !qid || fallback) return;
    const t = setTimeout(() => void fetchTimeline(qid), 0);
    return () => {
      clearTimeout(t);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
    };
  }, [live, qid, fallback, fetchTimeline]);

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
      if (!disposed) {
        setSynced(false);
        setDevices(0);
      }
    });
    sock.on("presence", (p: { count: number }) => {
      if (!disposed) setDevices(p.count);
    });
    sock.on(
      "vote:new",
      (p: { question: number; total: number | null }) => {
        if (disposed || p.question !== qid) return;
        void loadResults(qid); // tarik angka final dari sumber kebenaran
        scheduleSpark(qid); // kurva tempo — debounced
      },
    );
    sock.on("votes:reset", () => {
      if (disposed) return;
      setCounts({});
      setTotal(0);
      totalRef.current = 0;
      setNotice(null);
      setSpark(null);
    });
    return () => {
      disposed = true;
      setSynced(false);
      setDevices(0);
      sock.disconnect();
    };
  }, [live, qid, fallback, loadResults, scheduleSpark]);

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
      // Unduh hasil polling sebagai CSV — lampiran siap untuk laporan.
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

  const pct = (key: string) => {
    const c = counts[key] ?? 0;
    return total > 0 ? Math.round((c / total) * 100) : 0;
  };

  // Kurva tempo kedatangan suara — dihitung ringan saat render (≤ 120 titik).
  let sparkLine: string | null = null;
  let sparkArea = "";
  let sparkLast: { x: number; y: number } = { x: 0, y: 38 };
  let sparkSpanLabel = "";
  if (live && !fallback && spark && spark.points.length > 0) {
    const span = Math.max(1, spark.span);
    const tot = Math.max(1, spark.total);
    const xy: [number, number][] = [
      { t: 0, c: 0 },
      ...spark.points,
    ].map((p) => [
      Math.min(320, (p.t / span) * 320),
      40 - Math.min(38, (p.c / tot) * 36) - 2,
    ]);
    sparkLine = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const [lx, ly] = xy[xy.length - 1];
    sparkLast = { x: lx, y: ly };
    sparkArea = `M0,40 ${xy
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ")} L${lx.toFixed(1)},40 Z`;
    sparkSpanLabel = `${Math.floor(span / 60)}:${String(
      Math.round(span % 60),
    ).padStart(2, "0")}`;
  }

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

      {/* ---- Papan skor [P] — peringkat opsi pada langkah reveal ---- */}
      {qid > 0 && scoreOpen && (
        <div
          className="fade-slide-in absolute inset-0 flex flex-col px-0 pt-[13vh] pb-[10vh]"
          data-testid="scoreboard"
          aria-label={`Papan skor pertanyaan ${qid}`}
        >
          <div className="flex items-baseline gap-4">
            <span className="font-code text-[10px] tracking-[0.3em] text-ember">
              {`PERTANYAAN 0${qid}`}
            </span>
            <span className="font-code text-[10px] tracking-[0.2em] text-mute">
              PAPAN SKOR · FINAL
            </span>
          </div>
          <h2 className="mt-3 max-w-[62vw] font-display text-[2.5vw] leading-[1.15] text-paper">
            {question.prompt}
          </h2>

          <div className="mt-[3vh] max-w-[58vw] border-t border-edge">
            {[...question.options]
              .sort(
                (a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0),
              )
              .map((o, i) => {
                const c = counts[o.key] ?? 0;
                const rel = maxCount > 0 ? (c / maxCount) * 100 : 0;
                const isFirst = i === 0;
                return (
                  <div
                    key={o.key}
                    className="score-row flex items-center gap-[1.4vw] border-b border-edge py-[1.35vh]"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <span
                      className={`w-[3.6vw] shrink-0 text-right font-display leading-none ${
                        isFirst ? "text-[3vw] text-ember" : "text-[2.1vw] text-paper/30"
                      }`}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                        <span
                          className={`min-w-0 truncate font-body text-[1.25vw] ${
                            o.correct
                              ? "text-paper"
                              : isFirst
                                ? "text-paper/85"
                                : "text-paper/55"
                          }`}
                        >
                          <span className="mr-2 font-code text-[11px] text-ember">
                            {o.key}
                          </span>
                          {o.label}
                        </span>
                        <span
                          className={`shrink-0 font-code text-[10px] tracking-[0.18em] ${
                            o.correct || isFirst ? "text-ember" : "text-paper/55"
                          }`}
                        >
                          {`${c} SUARA · ${pct(o.key)}%${
                            o.correct ? " · KUNCI" : isFirst ? " · MAYORITAS" : ""
                          }`}
                        </span>
                      </div>
                      <div className="mt-[0.6vh] h-[12px] max-w-[42vw] bg-white/6">
                        <div
                          className={`score-bar h-full ${
                            isFirst
                              ? "score-bar-first"
                              : o.correct
                                ? "pollbar-correct"
                                : "bg-ember/40"
                          }`}
                          style={{ width: `${rel}%` }}
                          data-testid={`scorebar-${o.key}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="reveal-stat mt-[2.6vh] flex items-baseline gap-[1.4vw]">
            <span
              className="font-display text-[4vw] leading-none text-ember"
              aria-label={`${correctPct} persen kelas menjawab benar`}
            >
              {correctPct}%
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-code text-[10px] tracking-[0.25em] text-mute">
                {`KETEPATAN KELAS · ${correctCount}/${total} SUARA`}
              </span>
              <span className="font-display italic text-[1.25vw] leading-snug text-paper/80">
                {verdict}
              </span>
            </div>
          </div>

          <p className="mt-auto font-code text-[10px] tracking-[0.4em] text-mute">
            [P] KEMBALI KE PEMBAHASAN · [SPACE] LANJUT
          </p>
        </div>
      )}

      {/* ---- Pertanyaan live / reveal (tampilan standar) ---- */}
      {qid > 0 && !scoreOpen && (
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
              const isWinner = revealed && winners.includes(o.key);
              const isManual = manualChoice === o.key;
              const tag =
                isCorrect && isWinner
                  ? "JAWABAN · MAYORITAS"
                  : isCorrect
                    ? "JAWABAN"
                    : isWinner
                      ? "MAYORITAS KELAS"
                      : null;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => choose(o.key)}
                  disabled={!live || !fallback || !!manualChoice}
                  className={`group flex items-start gap-[0.9vw] border p-[1.1vw] text-left transition-all duration-300 ${
                    isCorrect
                      ? "border-ember bg-ember/10"
                      : isWinner
                        ? "border-paper/55 bg-paper/8"
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
                  <span
                    className={`pt-[0.35vw] font-code text-[11px] ${
                      isWinner && !isCorrect ? "text-paper/80" : "text-ember"
                    }`}
                  >
                    {o.key}
                  </span>
                  <span
                    className={`font-body text-[1.25vw] leading-snug ${
                      isWinner && !isCorrect
                        ? "text-paper/85"
                        : "text-paper/90"
                    }`}
                  >
                    {o.label}
                  </span>
                  {tag && (
                    <span
                      className={`ml-auto font-code text-[9px] tracking-[0.25em] ${
                        isWinner && !isCorrect
                          ? "text-paper/70"
                          : "text-ember"
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

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
                {live && devices > 0 && (
                  <span className="font-code text-[9px] tracking-[0.25em] text-paper/60">
                    · {devices} PERANGKAT
                  </span>
                )}
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
              {question.options.map((o) => {
                const isWinner = revealed && winners.includes(o.key);
                const isCorrect = revealed && o.correct;
                return (
                  <div key={o.key} className="mb-[0.9vh] flex items-center gap-3">
                    <span
                      className={`w-4 font-code text-[10px] ${
                        isWinner && !isCorrect ? "text-paper/75" : "text-mute"
                      }`}
                    >
                      {o.key}
                    </span>
                    <div className="h-[10px] flex-1 bg-white/6">
                      <div
                        className={`pollbar h-full ${
                          isWinner
                            ? "pollbar-winner"
                            : isCorrect
                              ? "pollbar-correct"
                              : "bg-ember/45"
                        }`}
                        style={{ width: `${pct(o.key)}%` }}
                        data-testid={`pollbar-${o.key}`}
                      />
                    </div>
                    <span
                      className={`w-[4.5vw] text-right font-code text-[10px] ${
                        isWinner ? "text-paper/85" : "text-paper/70"
                      }`}
                    >
                      {counts[o.key] ?? 0} · {pct(o.key)}%
                    </span>
                  </div>
                );
              })}
              {sparkLine && (
                <div className="mt-[1.1vh]" data-testid="poll-spark">
                  <svg
                    viewBox="0 0 320 40"
                    className="h-[40px] w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d={sparkArea} fill="rgba(232,160,32,0.10)" />
                    <polyline
                      points={sparkLine}
                      fill="none"
                      stroke="#E8A020"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="spark-curve"
                    />
                    <circle
                      cx={sparkLast.x}
                      cy={sparkLast.y}
                      r="2.5"
                      fill="#E8A020"
                    />
                  </svg>
                  <p className="mt-1 font-code text-[9px] tracking-[0.22em] text-mute/70">
                    {`TEMPO SUARA · ${spark?.total ?? 0} DALAM ${sparkSpanLabel}`}
                  </p>
                </div>
              )}
              <p className="mt-[0.8vh] font-code text-[9px] tracking-[0.22em] text-mute/60">
                {revealed && total > 0 ? "[P] PAPAN SKOR · " : ""}
                [F] FALLBACK · [R] RESET · [E] EKSPOR CSV
              </p>
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
