"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Download, Printer, Presentation, Smartphone } from "lucide-react";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";

type ResultsMap = Record<number, ResultsPayload>;

const pad2 = (n: number) => String(n).padStart(2, "0");

const fmtClock = (d: Date) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

/**
 * Halaman arsip hasil polling (#/results) — dibuka SETELAH presentasi untuk
 * dokumentasi laporan: tabel ringkas per pertanyaan + unduhan CSV + cetak.
 * Tetap hidup secara real-time (socket + fallback HTTP) bila dibuka saat sesi
 * berjalan.
 */
export default function ResultsPage() {
  const [results, setResults] = useState<ResultsMap>({});
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [devices, setDevices] = useState(0);
  const [synced, setSynced] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const rs = await Promise.all(
        QUESTIONS.map(async (q) => {
          const r = await fetch(`/api/results?question=${q.id}`, {
            cache: "no-store",
          });
          return r.ok ? ((await r.json()) as ResultsPayload) : null;
        }),
      );
      const map: ResultsMap = {};
      rs.forEach((r, i) => {
        if (r) map[QUESTIONS[i].id] = r;
      });
      setResults(map);
      setUpdatedAt(new Date());
      setLoaded(true);
    } catch {
      /* diam — percobaan ulang di poll berikutnya */
    }
  }, []);

  // Muat awal + fallback HTTP 10 detik (socket tetap jalur utama).
  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    const iv = setInterval(() => void load(), 10000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [load]);

  // Real-time: suara baru / reset → muat ulang; presence → jumlah perangkat.
  useEffect(() => {
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
    sock.on("vote:new", () => {
      if (!disposed) void load();
    });
    sock.on("votes:reset", () => {
      if (!disposed) void load();
    });
    return () => {
      disposed = true;
      setSynced(false);
      setDevices(0);
      sock.disconnect();
    };
  }, [load]);

  const totalAll = QUESTIONS.reduce(
    (s, q) => s + (results[q.id]?.total ?? 0),
    0,
  );

  return (
    <div className="rpage flex min-h-screen flex-col bg-base text-paper">
      {/* ---------- Kepala ---------- */}
      <header className="mx-auto w-full max-w-4xl px-6 pt-12 pb-8 sm:px-10">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-ember/70" />
          <p className="font-code text-[10px] tracking-[0.35em] text-ember">
            ARSIP HASIL
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h1 className="font-display text-4xl leading-none sm:text-5xl">
            Hasil Live Polling
          </h1>
          <div className="flex items-center gap-3 font-code text-[10px] tracking-[0.2em] text-mute">
            <span className="dot-live inline-block" aria-hidden />
            <span>
              {totalAll} SUARA TOTAL
              {synced ? " · SYNC" : ""}
              {devices > 0 ? ` · ${devices} PERANGKAT` : ""}
            </span>
          </div>
        </div>
        <p className="mt-3 font-code text-[10px] tracking-[0.28em] text-mute/70">
          KELOMPOK 6 · PDB 93 · UNIVERSITAS AIRLANGGA · 2026
          {updatedAt && ` · DIPERBARUI ${fmtClock(updatedAt)}`}
        </p>
      </header>

      {/* ---------- Isi: satu kartu per pertanyaan ---------- */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-10 sm:px-10">
        <div className="flex flex-col gap-8">
          {QUESTIONS.map((q) => {
            const r = results[q.id];
            const total = r?.total ?? 0;
            const correctKey = q.options.find((o) => o.correct)?.key;
            const maxCount =
              r && total > 0
                ? Math.max(0, ...r.options.map((o) => o.count))
                : 0;
            const correctCount =
              r?.options.find((o) => o.key === correctKey)?.count ?? 0;
            const correctPct =
              total > 0 ? Math.round((correctCount / total) * 100) : 0;
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
            return (
              <section
                key={q.id}
                className="rcard border border-edge bg-surface/60 p-6 sm:p-8"
                aria-label={`Hasil pertanyaan ${q.id}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-code text-[10px] tracking-[0.3em] text-ember">
                    {`PERTANYAAN 0${q.id}`}
                  </span>
                  <span className="font-code text-[10px] tracking-[0.2em] text-mute/70">
                    {`${total} SUARA`}
                  </span>
                </div>
                <h2 className="mt-3 max-w-2xl font-display text-2xl leading-snug sm:text-[1.7rem]">
                  {q.prompt}
                </h2>

                {total === 0 ? (
                  <p className="mt-6 border-l-2 border-edge pl-4 font-display text-lg italic text-mute/80">
                    {loaded
                      ? "Belum ada suara untuk pertanyaan ini."
                      : "Memuat hasil…"}
                  </p>
                ) : (
                  <>
                    <div className="mt-6 flex flex-col gap-3">
                      {q.options.map((o) => {
                        const count =
                          r?.options.find((x) => x.key === o.key)?.count ?? 0;
                        const pct =
                          total > 0 ? Math.round((count / total) * 100) : 0;
                        const isWinner = count === maxCount && count > 0;
                        const tag =
                          o.correct && isWinner
                            ? "JAWABAN · MAYORITAS"
                            : o.correct
                              ? "JAWABAN"
                              : isWinner
                                ? "MAYORITAS KELAS"
                                : null;
                        return (
                          <div
                            key={o.key}
                            className="flex items-center gap-3 sm:gap-4"
                          >
                            <span
                              className={`w-5 font-code text-xs ${
                                isWinner && !o.correct
                                  ? "text-paper/80"
                                  : "text-ember"
                              }`}
                            >
                              {o.key}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                                <span
                                  className={`truncate font-body text-sm sm:text-[0.95rem] ${
                                    isWinner && !o.correct
                                      ? "text-paper/85"
                                      : "text-paper/80"
                                  }`}
                                >
                                  {o.label}
                                </span>
                                <span className="flex shrink-0 items-baseline gap-2 font-code text-[10px] tracking-[0.15em]">
                                  {tag && (
                                    <span
                                      className={
                                        isWinner && !o.correct
                                          ? "text-paper/70"
                                          : "text-ember"
                                      }
                                    >
                                      {tag}
                                    </span>
                                  )}
                                  <span className="text-paper/70">{`${
                                    count
                                  } · ${pct}%`}</span>
                                </span>
                              </div>
                              <div className="rbar-track h-[10px] bg-white/6">
                                <div
                                  className={`rbar-fill pollbar h-full ${
                                    isWinner
                                      ? "pollbar-winner"
                                      : o.correct
                                        ? "pollbar-correct"
                                        : "bg-ember/45"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-baseline gap-5 border-t border-edge pt-5">
                      <span className="font-display text-5xl leading-none text-ember">
                        {`${correctPct}%`}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-code text-[10px] tracking-[0.25em] text-mute">
                          {`KELAS MENJAWAB BENAR · ${correctCount}/${total} SUARA`}
                        </span>
                        <span className="font-display text-base italic text-paper/75">
                          {verdict}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 border-l-2 border-ember/70 pl-4">
                      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
                        MENGAPA —
                      </p>
                      <p className="mt-1.5 max-w-2xl font-body text-sm leading-relaxed text-paper/80">
                        {q.answerNote}
                      </p>
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* ---------- Kaki: tindakan + identitas ---------- */}
      <footer className="mt-auto border-t border-edge bg-surface/40">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <div className="no-print flex flex-wrap gap-3">
            <a
              href="/api/export"
              className="flex items-center gap-2 border border-ember/60 px-4 py-2.5 font-code text-[10px] tracking-[0.22em] text-ember transition-colors hover:bg-ember/10 focus-visible:bg-ember/10 focus-visible:outline-1 focus-visible:outline-ember"
              download
            >
              <Download className="h-4 w-4" aria-hidden />
              UNDUH CSV
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-edge px-4 py-2.5 font-code text-[10px] tracking-[0.22em] text-paper/80 transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:text-ember focus-visible:outline-1 focus-visible:outline-ember"
            >
              <Printer className="h-4 w-4" aria-hidden />
              CETAK / PDF
            </button>
          </div>
          <div className="no-print flex flex-wrap gap-3 font-code text-[10px] tracking-[0.22em]">
            <a
              href="#/"
              className="flex items-center gap-2 border border-edge px-4 py-2.5 text-mute transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:outline-1 focus-visible:outline-ember"
            >
              <Presentation className="h-4 w-4" aria-hidden />
              PRESENTASI
            </a>
            <a
              href="#/voting"
              className="flex items-center gap-2 border border-edge px-4 py-2.5 text-mute transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:outline-1 focus-visible:outline-ember"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              VOTING
            </a>
          </div>
          <p className="w-full font-code text-[9px] tracking-[0.28em] text-mute/50 sm:w-auto">
            ANATOMI KARYA TULIS ILMIAH — KEL6 · PDB 93 · 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
