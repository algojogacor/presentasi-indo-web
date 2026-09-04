import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { QUESTIONS, type OptionKey } from "@/lib/questions";
import type { VoteState } from "@/types/polling";

const storageKey = (qid: number) => `kti-vote-q${qid}`;

interface QuestionCardProps {
  qid: number;
  onVoted?: () => void;
}

export default function QuestionCard({ qid, onVoted }: QuestionCardProps) {
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

  // Total suara kelas
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [peers, setPeers] = useState(0);
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
    const iv = setInterval(() => void load(), 8000);

    let sock: ReturnType<typeof io> | null = null;
    try {
      sock = io("/?XTransformPort=3030", {
        path: "/",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 5000,
        forceNew: true,
      });
      sock.on(
        "vote:new",
        (p: { question: number; total: number | null }) => {
          if (stopped || p.question !== qid) return;
          if (typeof p.total === "number") setLiveTotal(p.total);
          else void load();
        },
      );
      sock.on("votes:reset", () => {
        if (!stopped) setLiveTotal(0);
      });
      sock.on("presence", (p: { count: number }) => {
        if (!stopped) setPeers(p.count);
      });
    } catch {
      sock = null;
    }

    return () => {
      stopped = true;
      clearInterval(iv);
      sock?.disconnect();
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
              {peers > 0 && (
                <span className="text-paper/55"> · {peers} TERHUBUNG</span>
              )}
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
