import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { audio } from "@/lib/audio";
import type { ResultsPayload } from "@/lib/questions";
import type { Counts, TimelinePayload } from "@/types/polling";

interface UsePollingDataProps {
  qid: number;
  live: boolean;
  fallback: boolean;
  liveKey: string;
  hud: (msg: string, tone?: "ember" | "info") => void;
}

export function usePollingData({
  qid,
  live,
  fallback,
  liveKey,
  hud,
}: UsePollingDataProps) {
  const [counts, setCounts] = useState<Counts>({});
  const [total, setTotal] = useState(0);
  const [devices, setDevices] = useState(0);
  const [synced, setSynced] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [spark, setSpark] = useState<TimelinePayload | null>(null);

  const totalRef = useRef(0);
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);

  // Kurva tempo kedatangan suara
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

  const scheduleSpark = useCallback(
    (target: number, delay = 1400) => {
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
      sparkTimer.current = setTimeout(() => void fetchTimeline(target), delay);
    },
    [fetchTimeline],
  );

  // Muat kurva saat layar live aktif
  useEffect(() => {
    if (!live || !qid || fallback) return;
    const t = setTimeout(() => void fetchTimeline(qid), 0);
    return () => {
      clearTimeout(t);
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
    };
  }, [live, qid, fallback, fetchTimeline]);

  // Ambil hasil terkini dari server
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
        if (
          !firstLoad.current &&
          j.total > totalRef.current &&
          live &&
          !fallback
        ) {
          audio.chime();
        }
        firstLoad.current = false;
        setTotal(j.total);
        totalRef.current = j.total;
      } catch {
        /* diam — presenter tetap bisa lanjut manual */
      }
    },
    [live, fallback],
  );

  // Polling HTTP 3 detik
  useEffect(() => {
    if (!live || !qid || fallback) return;
    const t = setTimeout(() => void loadResults(qid), 0);
    const iv = setInterval(() => void loadResults(qid), 3000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [live, qid, fallback, loadResults]);

  // Socket real-time
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
        void loadResults(qid);
        scheduleSpark(qid);
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

  // Threshold: responden < 10 dalam 15 detik pertama
  useEffect(() => {
    if (!liveKey) return;
    const t = setTimeout(() => {
      if (totalRef.current < 10) setNotice(liveKey);
    }, 15000);
    return () => clearTimeout(t);
  }, [liveKey]);

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

  return {
    counts,
    setCounts,
    total,
    setTotal,
    devices,
    synced,
    notice,
    spark,
    resetPoll,
  };
}
