"use client";

import { useEffect, useState } from "react";
import { QUESTIONS, type OptionKey } from "@/lib/questions";
import { LiveDot } from "@/components/presentation/atoms";

type VoteState = "idle" | "sending" | "done" | "error";

const storageKey = (qid: number) => `kti-vote-q${qid}`;

function QuestionCard({
  qid,
  onVoted,
}: {
  qid: number;
  onVoted?: () => void;
}) {
  const q = QUESTIONS.find((x) => x.id === qid)!;
  const [chosen, setChosen] = useState<OptionKey | null>(null);
  const [state, setState] = useState<VoteState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Blokir double submit via localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(qid));
      if (saved) setChosen(saved as OptionKey);
    } catch {
      /* private mode — biarkan memilih */
    }
  }, [qid]);

  // Total suara kelas — pemantauan hidup setelah menjawab
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  useEffect(() => {
    if (state !== "done") return;
    let stopped = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/results?question=${qid}`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { total: number };
        if (!stopped) setLiveTotal(j.total);
      } catch {
        /* diam — angka lama tetap tampil */
      }
    };
    void load();
    const iv = setInterval(load, 4000);
    return () => {
      stopped = true;
      clearInterval(iv);
    };
  }, [state, qid]);

  const submit = async (key: OptionKey) => {
    if (chosen || state === "sending") return;
    setChosen(key);
    setState("sending");
    setError(null);
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qid, option: key }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "Gagal mengirim suara");
      }
      try {
        window.localStorage.setItem(storageKey(qid), key);
      } catch {
        /* abaikan */
      }
      setState("done");
      onVoted?.();
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Gagal mengirim suara");
      setChosen(null);
    }
  };

  const locked = chosen !== null && state !== "error";

  return (
    <section
      className="border-t border-edge pt-7"
      aria-labelledby={`vq-${qid}`}
      data-testid={`vote-q${qid}`}
    >
      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
        PERTANYAAN 0{qid}
      </p>
      <h2
        id={`vq-${qid}`}
        className="mt-3 font-body text-[19px] font-semibold leading-snug text-paper"
      >
        {q.prompt}
      </h2>

      <div className="mt-5 space-y-3">
        {q.options.map((o) => {
          const isChosen = chosen === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => void submit(o.key)}
              disabled={locked || state === "sending"}
              aria-pressed={isChosen}
              className={`flex w-full items-center gap-4 rounded-[8px] border p-4 text-left transition-all duration-200 active:scale-[0.99] focus-visible:border-ember ${
                isChosen
                  ? "border-ember bg-ember/12"
                  : locked
                    ? "border-edge opacity-35"
                    : "border-edge hover:border-ember/60 bg-transparent"
              } ${locked || state === "sending" ? "cursor-default" : "cursor-pointer"}`}
              style={{ minHeight: 56 }}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center border font-code text-[12px] ${
                  isChosen
                    ? "border-ember bg-ember text-base"
                    : "border-edge text-ember"
                }`}
                aria-hidden
              >
                {o.key}
              </span>
              <span className="min-w-0 flex-1 font-body text-[16px] leading-snug text-paper/90">
                {o.label}
              </span>
              {isChosen && state === "done" && (
                <span className="ml-auto shrink-0 font-code text-[10px] tracking-[0.2em] text-ember">
                  TERCATAT
                </span>
              )}
            </button>
          );
        })}
      </div>

      {state === "sending" && (
        <p className="mt-4 font-code text-[11px] tracking-[0.2em] text-mute">
          MENGIRIM…
        </p>
      )}
      {state === "done" && (
        <div className="mt-5 border-l-2 border-ember pl-4">
          <p className="font-display text-[22px] italic text-paper">
            Suaramu tercatat.
          </p>
          {liveTotal !== null && (
            <p className="mt-1.5 font-code text-[10px] tracking-[0.18em] text-mute">
              <span key={liveTotal} className="count-flash">
                {liveTotal}
              </span>{" "}
              SUARA MASUK DARI SELURUH KELAS
            </p>
          )}
        </div>
      )}
      {state === "error" && (
        <div className="mt-4 border-l-2 border-wrong pl-4">
          <p className="font-body text-[14px] text-paper/80">
            {error ?? "Gagal mengirim suara."}
          </p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-2 font-code text-[11px] tracking-[0.2em] text-ember underline underline-offset-4"
          >
            COBA LAGI
          </button>
        </div>
      )}
    </section>
  );
}

/** Halaman voting audiens — mobile-first, ringan, satu klik, tanpa login. */
export default function VotingPage() {
  const [q2Open, setQ2Open] = useState(false);
  const [answered, setAnswered] = useState({ q1: false, q2: false });

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
      <header className="fixed inset-x-0 top-0 z-20 border-b border-edge bg-base/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2.5 font-code text-[10px] tracking-[0.25em] text-mute">
            <LiveDot />
            LIVE POLLING — ANATOMI KTI
          </span>
          <span className="font-code text-[9px] tracking-[0.15em] text-mute">
            KELOMPOK 6 · PDB 93
          </span>
        </div>
      </header>

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
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-edge bg-base/90 backdrop-blur-sm">
        <p
          className="mx-auto max-w-md px-5 py-3.5 font-code text-[9px] tracking-[0.2em] text-mute"
          style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
        >
          UNIVERSITAS AIRLANGGA · 2026 — SISI PENONTON
        </p>
      </footer>
    </div>
  );
}
