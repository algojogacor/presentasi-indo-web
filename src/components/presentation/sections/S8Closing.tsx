"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { io } from "socket.io-client";
import { gsap } from "@/lib/gsap";
import { useStepReveal, useIsoLayoutEffect } from "../hooks";
import { Kicker } from "../atoms";
import {
  subscribeSession,
  getElapsedSeconds,
} from "../session";

const pad2 = (n: number) => String(n).padStart(2, "0");

const SIMPULAN = [
  "KTI adalah tubuh gagasan — struktur adalah fungsi, bukan formalitas.",
  "Bagian awal membuka jalan, bagian inti membawa argumen, bagian akhir menutup bukti.",
  "Makalah, artikel, skripsi, dan proposal PKM adalah satu anatomi yang beradaptasi pada habitat berbeda.",
  "Kaidah kebahasaan adalah sistem sarafnya — presisi bahasa mencerminkan presisi berpikir.",
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
  { t: "tinjauan pustaka", x: "26%", y: "88%", s: "2.8vw", d: "20s" },
  { t: "daftar pustaka", x: "80%", y: "42%", s: "2vw", d: "15s" },
  { t: "sistematis", x: "46%", y: "56%", s: "6vw", d: "22s", r: "3deg" },
];

/**
 * Statistik hidup di layar tanya jawab — suara terekam (dua pertanyaan),
 * perangkat tersambung, dan durasi sesi. Tetap sinkron lewat socket +
 * fallback HTTP 5 dtk. Layak jadi "penutup" yang hidup selama diskusi.
 */
function QaStats() {
  const [votes, setVotes] = useState<number | null>(null);
  const [devices, setDevices] = useState(0);
  const elapsed = useSyncExternalStore(
    subscribeSession,
    getElapsedSeconds,
    () => 0,
  );

  // Muat total suara (Q1+Q2) — dipakai muat awal, fallback HTTP, dan socket.
  const load = useCallback(async () => {
    try {
      const rs = await Promise.all(
        [1, 2].map(async (q) => {
          const r = await fetch(`/api/results?question=${q}`, {
            cache: "no-store",
          });
          return r.ok ? (await r.json()).total : 0;
        }),
      );
      setVotes(rs[0] + rs[1]);
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

  const parts = [
    `SESI T+${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)}`,
    votes !== null ? `${votes} SUARA TEREKAM` : null,
    devices > 0 ? `${devices} PERANGKAT TERHUBUNG` : null,
  ].filter(Boolean);

  return (
    <div className="fade-slide-in absolute bottom-[13vh] left-1/2 z-10 w-[64vw] max-w-[820px] -translate-x-1/2 text-center">
      <div className="flex items-center justify-center gap-3 font-code text-[10px] tracking-[0.24em] text-mute">
        <span className="dot-live inline-block" aria-hidden />
        <span>{parts.join(" · ")}</span>
      </div>
      <p className="mt-2 font-code text-[9px] tracking-[0.22em] text-mute/50">
        ARSIP LENGKAP → /#/RESULTS
      </p>
    </div>
  );
}

/**
 * Section 8 — Penutup.
 * Step 0–3: empat simpulan (besar, eksklusif — simpulan lalu mengecil jadi daftar redup).
 * Step 4: kalimat pembuka kembali — kata "sudah" amber.
 * Step 5: kredit, terima kasih, tanya jawab — latar tetap hidup + statistik sesi.
 */
export default function S8Closing({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  useStepReveal(root, step);

  // Kalimat callback mengecil naik saat kredit muncul
  useIsoLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".s8-callback");
    if (!el) return;
    if (step >= 5) {
      gsap.to(el, {
        y: "-26vh",
        scale: 0.65,
        autoAlpha: 0.4,
        duration: 0.8,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(el, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" });
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

      {/* Simpulan — satu per satu, momen */}
      {step <= 3 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[11vw]">
          <div className="mb-[3.5vh] space-y-2">
            {SIMPULAN.slice(0, step).map((s, i) => (
              <p
                key={i}
                data-step={i}
                className="text-center font-code text-[10px] tracking-[0.14em] text-mute/80"
              >
                {s}
              </p>
            ))}
          </div>
          {SIMPULAN.map((s, i) => (
            <p
              key={i}
              data-step={i}
              data-exclusive
              className="max-w-[66vw] text-center font-display italic text-[3.1vw] leading-[1.22] text-paper"
            >
              {s}
            </p>
          ))}
        </div>
      )}

      {/* Callback kalimat pembuka — "sudah" bernasib amber */}
      <div className="absolute inset-0 flex items-center justify-center px-[12vw]">
        <p
          data-step="4"
          className="s8-callback max-w-[70vw] text-center font-display italic text-[3.4vw] leading-[1.2] text-paper"
        >
          Setiap karya ilmiah punya tubuh. Hari ini kita{" "}
          <span className="text-ember">sudah</span> bedah anatominya.
        </p>
      </div>

      {/* Kredit & tanya jawab */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[12vw] pt-[6vh]">
        <div data-step="5" className="text-center">
          <p className="font-code text-[11px] tracking-[0.5em] text-ember">
            KELOMPOK 6 — PDB 93
          </p>
          <p className="mt-[2.5vh] font-display text-[5.2vw] leading-none text-paper">
            Terima kasih.
          </p>
          <p className="mt-[2.5vh] font-body text-[1.2vw] text-paper/75">
            Ruang tanya jawab dibuka — silakan.
          </p>
          <p className="mt-[3vh] font-code text-[10px] tracking-[0.3em] text-mute">
            UNIVERSITAS AIRLANGGA · 2026
          </p>
        </div>
      </div>

      {/* Statistik hidup selama tanya jawab (step 5) */}
      {step >= 5 && <QaStats />}
    </div>
  );
}
