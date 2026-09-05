"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ShareButton from "./ShareButton";
import QuestionCard from "./QuestionCard";
import VotingHeader from "./VotingHeader";
import VotingFooter from "./VotingFooter";

/** Halaman voting audiens — mobile-first, ringan, satu klik, tanpa login. */
export default function VotingPage() {
  const [q2Open, setQ2Open] = useState(false);
  const [answered, setAnswered] = useState({ q1: false, q2: false });
  const [online, setOnline] = useState(0);
  const [resetTick, setResetTick] = useState(0);
  const [showResetNotice, setShowResetNotice] = useState(false);

  useEffect(() => {
    let disposed = false;
    let sock: ReturnType<typeof io> | null = null;
    try {
      sock = io("/?XTransformPort=3030", {
        path: "/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 2500,
        timeout: 5000,
        forceNew: true,
      });
      sock.on("presence", (p: { count: number }) => {
        if (!disposed) setOnline(p.count);
      });
      sock.on("votes:reset", () => {
        if (disposed) return;
        try {
          window.localStorage.removeItem("kti-vote-q1");
          window.localStorage.removeItem("kti-vote-q2");
        } catch {
          /* abaikan */
        }
        setResetTick((t) => t + 1);
        setQ2Open(false);
        setAnswered({ q1: false, q2: false });
        setShowResetNotice(true);
      });
      sock.on("disconnect", () => {
        if (!disposed) setOnline(0);
      });
    } catch {
      sock = null;
    }
    return () => {
      disposed = true;
      sock?.disconnect();
    };
  }, []);

  // Notifikasi auto-tutup setelah 4 detik
  useEffect(() => {
    if (!showResetNotice) return;
    const t = setTimeout(() => setShowResetNotice(false), 4000);
    return () => clearTimeout(t);
  }, [showResetNotice]);

  // Pertanyaan kedua terbuka setelah pertanyaan pertama dijawab;
  // kartu penyelesaian muncul saat keduanya terekam.
  useEffect(() => {
    const check = () => {
      let complete = false;
      try {
        const hasQ1 = !!window.localStorage.getItem("kti-vote-q1");
        const hasQ2 = !!window.localStorage.getItem("kti-vote-q2");
        setQ2Open(hasQ1);
        setAnswered((a) =>
          a.q1 === hasQ1 && a.q2 === hasQ2 ? a : { q1: hasQ1, q2: hasQ2 },
        );
        complete = hasQ1 && hasQ2;
      } catch {
        /* abaikan */
      }
      return complete;
    };
    if (check()) return;
    const iv = setInterval(() => {
      if (check()) clearInterval(iv);
    }, 1500);
    return () => clearInterval(iv);
  }, [resetTick]);

  return (
    <div className="min-h-dvh bg-base text-paper">
      {/* Header */}
      <VotingHeader online={online} />

      {/* Banner notifikasi reset */}
      {showResetNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fade-slide-in fixed top-20 left-1/2 z-50 flex w-[90vw] max-w-sm -translate-x-1/2 items-center justify-between rounded-[8px] border border-ember/60 bg-base/95 px-4 py-3 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
            <span className="font-code text-[11px] tracking-[0.18em] text-ember">
              SESI DIRESET OLEH PRESENTER
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowResetNotice(false)}
            className="font-code text-[10px] text-mute hover:text-paper"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      <main className="mx-auto max-w-md px-5 pt-20 pb-16">
        <p className="font-display text-[30px] italic leading-tight text-paper">
          Dua pertanyaan.
        </p>
        <p className="mt-2 font-body text-[15px] leading-relaxed text-mute">
          Satu suara untuk masing-masing. Tanpa login, tanpa data pribadi —
          jawabanmu tampil langsung di layar presentasi.
        </p>

        <div className="mt-9 space-y-10">
          <QuestionCard
            key={`q1-${resetTick}`}
            qid={1}
            onVoted={() => setQ2Open(true)}
          />
          {q2Open ? (
            <QuestionCard key={`q2-${resetTick}`} qid={2} />
          ) : (
            <p className="border-t border-edge pt-7 font-code text-[10px] tracking-[0.25em] text-mute">
              PERTANYAAN 02 TERBUKA SETELAH KAMU MENJAWAB PERTANYAAN 01
            </p>
          )}
        </div>

        {answered.q1 && answered.q2 && (
          <div className="fade-slide-in mt-10 border-t border-edge pt-7">
            <p className="font-display text-[26px] italic text-paper">
              Dua jawaban. Terekam.
            </p>
            <p className="mt-2 font-body text-[14px] leading-relaxed text-mute">
              Pantau layar presentasi — jawabanmu akan tampil saat pembahasan
              dibuka.
            </p>
            <ShareButton />
          </div>
        )}
      </main>

      {/* Footer */}
      <VotingFooter />
    </div>
  );
}
