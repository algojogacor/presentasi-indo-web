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
  // Presence — berapa perangkat kelas tersambung
  const [online, setOnline] = useState(0);

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

  // Pertanyaan kedua terbuka setelah pertanyaan pertama dijawab;
  // kartu penyelesaian muncul saat keduanya terekam.
  useEffect(() => {
    const check = () => {
      let complete = false;
      try {
        const hasQ1 = !!window.localStorage.getItem("kti-vote-q1");
        const hasQ2 = !!window.localStorage.getItem("kti-vote-q2");
        if (hasQ1) setQ2Open(true);
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
  }, []);

  return (
    <div className="min-h-dvh bg-base text-paper">
      {/* Header */}
      <VotingHeader online={online} />

      <main className="mx-auto max-w-md px-5 pt-20 pb-16">
        <p className="font-display text-[30px] italic leading-tight text-paper">
          Dua pertanyaan.
        </p>
        <p className="mt-2 font-body text-[15px] leading-relaxed text-mute">
          Satu suara untuk masing-masing. Tanpa login, tanpa data pribadi —
          jawabanmu tampil langsung di layar presentasi.
        </p>

        <div className="mt-9 space-y-10">
          <QuestionCard qid={1} onVoted={() => setQ2Open(true)} />
          {q2Open ? (
            <QuestionCard qid={2} />
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
