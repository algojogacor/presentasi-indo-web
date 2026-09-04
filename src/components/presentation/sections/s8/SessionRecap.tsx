import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { io } from "socket.io-client";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";
import { subscribeSession, getElapsedSeconds } from "../../session";

const pad2 = (n: number) => String(n).padStart(2, "0");

interface SessionRecapProps {
  detail: boolean;
}

export default function SessionRecap({ detail }: SessionRecapProps) {
  const [recap, setRecap] = useState<(ResultsPayload | null)[]>([null, null]);
  const [devices, setDevices] = useState(0);
  const elapsed = useSyncExternalStore(
    subscribeSession,
    getElapsedSeconds,
    () => 0,
  );

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
