"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { io } from "socket.io-client";
import { gsap } from "@/lib/gsap";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { usePres } from "../context";
import { Kicker } from "../atoms";
import {
  subscribeSession,
  getElapsedSeconds,
} from "../session";

const pad2 = (n: number) => String(n).padStart(2, "0");

const SIMPULAN = [
  "Karya ilmiah merupakan uraian atau penjabaran hasil temuan berdasarkan data primer dan data sekunder yang bertujuan untuk memecahkan masalah tertentu dengan metode ilmiah yang dapat dipertanggungjawabkan.",
  "Struktur anatomi umum karya ilmiah terbagi menjadi tiga bagian utama, yaitu bagian awal (preliminaries meliputi judul, pengesahan, kata pengantar, abstrak, daftar isi), bagian inti (body text yang terdiri atas pendahuluan, kajian pustaka, metode penelitian, hasil dan pembahasan, serta penutup), dan bagian akhir (postliminaries mencakup daftar pustaka dan lampiran).",
  "Penerapan struktur karya ilmiah memiliki fleksibilitas sesuai wadah publikasinya, mulai dari struktur sederhana pada makalah kuliah, struktur IMRaD pada artikel jurnal, hingga struktur terpaut pada proposal Program Kreativitas Mahasiswa.",
  "Keberhasilan penyusunan karya ilmiah berpijak pada keharmonisan logika antar bab, penerapan kaidah kebahasaan baku berdasarkan aturan EYD Edisi V, pembentukan kalimat efektif, serta kepatuhan mutlak terhadap etika sitasi bebas plagiarisme.",
];

const SIMPULAN_METAS = [
  {
    num: "01",
    tag: "HAKIKAT & METODE",
    sub: "Data Primer & Sekunder · Pemecahan Masalah Teruji",
  },
  {
    num: "02",
    tag: "TIGA RONGGA ANATOMI",
    sub: "Preliminaries · Body Text (5 Bab) · Postliminaries",
  },
  {
    num: "03",
    tag: "FLEKSIBILITAS WADAH",
    sub: "Makalah Kuliah · Format IMRaD · Proposal PKM",
  },
  {
    num: "04",
    tag: "KAIDAH & INTEGRITAS",
    sub: "Logika Antarbab · Kaidah EYD V · Bebas Plagiarisme",
  },
];

const AMBIENT_WORDS: {
  t: string;
  x: string;
  y: string;
  s: string;
  d: string;
  r?: string;
}[] = [
  { t: "preliminaries", x: "5%", y: "16%", s: "3.2vw", d: "16s", r: "-5deg" },
  { t: "IMRAD", x: "78%", y: "11%", s: "5vw", d: "13s", r: "4deg" },
  { t: "verifikatif", x: "66%", y: "72%", s: "2.6vw", d: "18s" },
  { t: "abstrak", x: "10%", y: "78%", s: "4vw", d: "14s" },
  { t: "objektif", x: "40%", y: "7%", s: "2.2vw", d: "17s" },
  { t: "tinjauan pustaka", x: "26%", y: "88%", s: "20s" },
  { t: "daftar pustaka", x: "80%", y: "42%", s: "2vw", d: "15s" },
  { t: "sistematis", x: "46%", y: "56%", s: "6vw", d: "22s", r: "3deg" },
];

/**
 * Rekap sesi hidup di layar tanya jawab — suara terekam (dua pertanyaan),
 * perangkat tersambung, dan durasi sesi. [V] membuka rincian per pertanyaan
 * (ketepatan kelas + jawaban mayoritas). Tetap sinkron lewat socket +
 * fallback HTTP 5 dtk. Layak jadi "penutup" yang hidup selama diskusi.
 */
function SessionRecap({ detail }: { detail: boolean }) {
  const [recap, setRecap] = useState<(ResultsPayload | null)[]>([
    null,
    null,
  ]);
  const [devices, setDevices] = useState(0);
  const elapsed = useSyncExternalStore(
    subscribeSession,
    getElapsedSeconds,
    () => 0,
  );

  // Muat hasil per pertanyaan — dipakai muat awal, fallback HTTP, dan socket.
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
      setRecap(rs);
    } catch {
      /* diam — statistik opsional */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    const iv = setInterval(() => void load(), 5000);
    let disposed = false;
    let sock: ReturnType<typeof io> | null = null;
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
      sock.on("presence", (p: { count: number }) => {
        if (!disposed) setDevices(p.count);
      });
      sock.on("disconnect", () => {
        if (!disposed) setDevices(0);
      });
      sock.on("vote:new", () => {
        if (!disposed) void load();
      });
      sock.on("votes:reset", () => {
        if (!disposed) void load();
      });
    } catch {
      sock = null;
    }
    return () => {
      disposed = true;
      clearTimeout(t);
      clearInterval(iv);
      sock?.disconnect();
    };
  }, [load]);

  const totalAll = recap.reduce((s, r) => s + (r?.total ?? 0), 0);
  const loaded = recap.some((r) => r !== null);

  const parts = [
    `SESI T+${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)}`,
    loaded ? `${totalAll} SUARA TEREKAM` : null,
    devices > 0 ? `${devices} PERANGKAT TERHUBUNG` : null,
  ].filter(Boolean);

  return (
    <div className="fade-slide-in absolute bottom-[6.5vh] left-1/2 z-30 w-[64vw] max-w-[820px] -translate-x-1/2 text-center pointer-events-auto">
      {detail && (
        <div
          className="mb-4 grid grid-cols-2 gap-4 text-left"
          data-testid="rekap-detail"
        >
          {QUESTIONS.map((q, i) => {
            const r = recap[i];
            const total = r?.total ?? 0;
            const correctKey = q.options.find((o) => o.correct)?.key;
            const counts = new Map(
              (r?.options ?? []).map((o) => [o.key, o.count] as const),
            );
            const correctCount =
              correctKey !== undefined ? (counts.get(correctKey) ?? 0) : 0;
            const correctPct =
              total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const maxCount = Math.max(
              0,
              ...(r?.options.map((o) => o.count) ?? [0]),
            );
            const winners =
              maxCount > 0
                ? (r?.options ?? []).filter((o) => o.count === maxCount)
                : [];
            const winnerText =
              total === 0
                ? "MENUNGGU SUARA"
                : winners.length > 1
                  ? `SERI — ${winners.map((w) => w.key).join(" / ")}`
                  : `${winners[0]?.key ?? ""} — ${winners[0]?.label ?? ""}`;
            return (
              <div
                key={q.id}
                className="rekap-card fade-slide-in border border-edge/90 bg-base/88 backdrop-blur-[3px] p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-code text-[9px] tracking-[0.28em] text-ember">
                    {`PERTANYAAN 0${q.id}`}
                  </span>
                  <span className="font-code text-[9px] tracking-[0.18em] text-mute/80">
                    {`${total} SUARA`}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-3">
                  <span
                    className="font-display text-[2.3vw] leading-none text-ember"
                    aria-label={`${correctPct} persen kelas menjawab benar`}
                  >
                    {total > 0 ? `${correctPct}%` : "—"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-code text-[8.5px] tracking-[0.2em] text-mute">
                      KETEPATAN KELAS
                    </p>
                    <p className="truncate font-body text-[0.92vw] text-paper/80">
                      {winnerText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-center gap-3 font-code text-[10px] tracking-[0.24em] text-mute">
        <span className="dot-live inline-block" aria-hidden />
        <span>{parts.join(" · ")}</span>
      </div>
      <p className="mt-2 font-code text-[9px] tracking-[0.22em] text-mute/50">
        {`[V] ${detail ? "RINGKAS" : "RINCIAN"} · ARSIP LENGKAP → /#/RESULTS`}
      </p>
    </div>
  );
}

/**
 * Section 8 — Penutup.
 * Step 0–3: empat simpulan (eksekutif, terpusat elegan dengan stepper 4 poin).
 * Step 4: kalimat pembuka kembali — kata "sudah" bernasib ember di tengah layar.
 * Step 5: kredit, terima kasih, tanya jawab — kalimat pembuka mengecil naik ke atas,
 *         disertai kartu terima kasih dan rekapitulasi sesi hidup di bawah.
 */
export default function S8Closing({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<HTMLDivElement>(null);
  const { hud } = usePres();
  const [recapDetail, setRecapDetail] = useState(false);

  // [V] — rekap sesi: rincian per pertanyaan di layar tanya jawab (step 5).
  useSectionKeys((key) => {
    if (key === "v") {
      setRecapDetail((d) => {
        hud(
          d ? "REKAP SESI — RINGKAS [V]" : "REKAP SESI — RINCIAN [V]",
          "ember",
        );
        return !d;
      });
      return true;
    }
    return false;
  });

  // Kalimat callback (Hanya aktif eksklusif di Step 4):
  // step < 4: tersembunyi di bawah (autoAlpha 0, y: 24)
  // step === 4: terpusat anggun di tengah panggung
  // step >= 5: menghilang halus ke atas (autoAlpha 0, y: -24), memberi ruang penuh bagi kartu penutup
  useIsoLayoutEffect(() => {
    const el = callbackRef.current;
    if (!el) return;
    if (step === 4) {
      gsap.to(el, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        y: step < 4 ? 24 : -24,
        scale: 0.95,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  }, [step]);

  return (
    <div ref={root} className="absolute inset-0" data-testid="penutup">
      {/* Latar hidup — kata-kata anatomis mengapung nyaris tak terlihat */}
      {AMBIENT_WORDS.map((w) => (
        <span
          key={w.t}
          aria-hidden
          className="ambient-word font-display italic"
          style={
            {
              left: w.x,
              top: w.y,
              fontSize: w.s,
              "--dur": w.d,
              "--rot": w.r ?? "0deg",
            } as React.CSSProperties
          }
        >
          {w.t}
        </span>
      ))}

      <Kicker act="08">PENUTUP</Kicker>

      {/* Simpulan — 4 poin dari Bab 3.1 Makalah (Step 0–3) */}
      {step <= 3 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[10vw] select-none z-10">
          {/* Stepper Indikator 4 Poin Simpulan */}
          <div className="mb-[4.5vh] flex flex-wrap items-center justify-center gap-2.5">
            {SIMPULAN_METAS.map((m, i) => {
              const isActive = step === i;
              const isPast = step > i;
              return (
                <div
                  key={m.num}
                  className={`flex items-center gap-2 px-3.5 py-1.5 border transition-all duration-300 ${
                    isActive
                      ? "border-ember/80 bg-ember/10 text-ember shadow-[0_0_15px_rgba(232,160,32,0.15)]"
                      : isPast
                        ? "border-edge/90 bg-surface/70 text-paper/70"
                        : "border-edge/30 bg-transparent text-mute/35"
                  }`}
                >
                  <span
                    className={`font-code text-[10px] font-bold ${
                      isActive
                        ? "text-ember"
                        : isPast
                          ? "text-paper/70"
                          : "text-mute/40"
                    }`}
                  >
                    {m.num}
                  </span>
                  <span className="font-code text-[9.5px] tracking-[0.16em] uppercase">
                    {m.tag}
                  </span>
                  {isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember animate-pulse ml-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Kotak Simpulan Aktif */}
          <div
            key={step}
            className="fade-slide-in flex flex-col items-center text-center max-w-[72vw]"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 border border-edge/60 bg-surface/40 font-code text-[9px] tracking-[0.3em] text-ember uppercase">
              <span>SIMPULAN EKSEKUTIF</span>
              <span>·</span>
              <span>POIN {SIMPULAN_METAS[step]?.num ?? "01"} / 04</span>
            </div>

            <p className="font-display italic text-[2.2vw] leading-[1.38] text-paper max-w-[68vw]">
              &ldquo;{SIMPULAN[step]}&rdquo;
            </p>

            <div className="mt-[3.5vh] flex items-center gap-3 font-code text-[10px] tracking-[0.22em] text-mute/80">
              <span className="w-8 h-[1px] bg-ember/40" />
              <span>{SIMPULAN_METAS[step]?.sub.toUpperCase()}</span>
              <span className="w-8 h-[1px] bg-ember/40" />
            </div>
          </div>

          {/* Navigasi Petunjuk Bawah */}
          <p className="absolute bottom-[6vh] font-code text-[9.5px] tracking-[0.25em] text-mute/50">
            {`SIMPULAN 0${step + 1} / 04 · TEKAN [SPACE] UNTUK LANJUT`}
          </p>
        </div>
      )}

      {/* Callback kalimat pembuka — "sudah" bernasib ember (Step 4 & 5) */}
      <div
        ref={callbackRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-[12vw] pointer-events-none z-10"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        <div className="s8-callback max-w-[72vw] text-center">
          <p className="font-display italic text-[3.4vw] leading-[1.24] text-paper">
            &ldquo;Setiap karya ilmiah punya tubuh. Hari ini kita{" "}
            <span className="text-ember font-normal">sudah</span> bedah
            anatominya.&rdquo;
          </p>
          <p className="mt-5 font-code text-[10px] tracking-[0.35em] text-mute/70 uppercase">
            Kilas Balik Premis Pembuka · Universitas Airlangga
          </p>
        </div>
      </div>

      {/* Kredit & tanya jawab (Step 5) */}
      {step >= 5 && (
        <div className="fade-slide-in absolute inset-0 flex flex-col items-center justify-center px-[12vw] z-20 pointer-events-none">
          <div className="pointer-events-auto border border-edge/80 bg-surface/80 backdrop-blur-[6px] px-14 py-8 text-center max-w-[56vw] shadow-2xl">
            <p className="font-code text-[11px] tracking-[0.45em] text-ember uppercase">
              Kelompok 6 · PDB 93
            </p>
            <h2 className="mt-3 font-display text-[4.4vw] leading-none text-paper">
              Terima kasih.
            </h2>
            <p className="mt-4 font-body text-[1.18vw] text-paper/85">
              Ruang diskusi dan tanya jawab dibuka — silakan.
            </p>
            <div className="mt-6 pt-4 border-t border-edge/60 flex items-center justify-center gap-4 font-code text-[10px] tracking-[0.28em] text-mute">
              <span>UNIVERSITAS AIRLANGGA</span>
              <span>·</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      )}

      {/* Rekap sesi hidup selama tanya jawab (step 5) — [V] buka rincian */}
      {step >= 5 && <SessionRecap detail={recapDetail} />}
    </div>
  );
}
