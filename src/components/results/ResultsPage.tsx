"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { QUESTIONS, type ResultsPayload } from "@/lib/questions";
import type { ResultsMap, TimelineMap, TimelinePayload } from "@/types/polling";
import ResultsHeader from "./ResultsHeader";
import ClassSummarySection from "./ClassSummarySection";
import QuestionDetailCard from "./QuestionDetailCard";
import ResultsFooter from "./ResultsFooter";

/**
 * Halaman arsip hasil polling (#/results) — dibuka SETELAH presentasi untuk
 * dokumentasi laporan: tabel ringkas per pertanyaan + unduhan CSV + cetak.
 * Tetap hidup secara real-time (socket + fallback HTTP) bila dibuka saat sesi
 * berjalan.
 */
export default function ResultsPage() {
  const [results, setResults] = useState<ResultsMap>({});
  const [timelines, setTimelines] = useState<TimelineMap>({});
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

      // Kurva tempo per pertanyaan
      const tls = await Promise.all(
        QUESTIONS.map(async (q) => {
          try {
            const r = await fetch(`/api/timeline?question=${q.id}`, {
              cache: "no-store",
            });
            return r.ok ? ((await r.json()) as TimelinePayload) : null;
          } catch {
            return null;
          }
        }),
      );
      const tmap: TimelineMap = {};
      tls.forEach((t, i) => {
        tmap[QUESTIONS[i].id] = t;
      });
      setTimelines(tmap);

      setUpdatedAt(new Date());
      setLoaded(true);
    } catch {
      /* diam — percobaan ulang di poll berikutnya */
    }
  }, []);

  // Muat awal + fallback HTTP 10 detik
  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    const iv = setInterval(() => void load(), 10000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [load]);

  // Real-time
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
      {/* Kepala */}
      <ResultsHeader
        totalAll={totalAll}
        synced={synced}
        devices={devices}
        updatedAt={updatedAt}
      />

      {/* Isi */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-10 sm:px-10">
        <ClassSummarySection results={results} timelines={timelines} />

        <div className="flex flex-col gap-8">
          {QUESTIONS.map((q) => (
            <QuestionDetailCard
              key={q.id}
              question={q}
              result={results[q.id]}
              loaded={loaded}
            />
          ))}
        </div>
      </main>

      {/* Tindakan + identitas */}
      <ResultsFooter />
    </div>
  );
}
