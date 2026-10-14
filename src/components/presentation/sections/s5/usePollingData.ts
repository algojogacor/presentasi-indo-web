import { useCallback, useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { audio } from "@/lib/audio";
import { getSyncSocket } from "@/lib/syncSocket";
import type { ResultsPayload } from "@/lib/questions";
import type { Counts, TimelinePayload } from "@/types/polling";

interface UsePollingDataProps {
  qid: number;
  live: boolean;
  fallback: boolean;
  liveKey: string;
  hud: (msg: string, tone?: "ember" | "info") => void;
  sessionCode?: string;
}

export function usePollingData({
  qid,
  live,
  fallback,
  liveKey,
  hud,
  sessionCode,
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

  // Ambil hasil terkini dari server (hanya jika mode tanpa sesi aktif)
  const loadResults = useCallback(
    async (target: number) => {
      if (sessionCode) return; // Mode sesi mengandalkan socket room session:poll_results
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
    [live, fallback, sessionCode],
  );

  // Polling HTTP 3 detik (hanya fallback jika sesi sync tidak digunakan)
  useEffect(() => {
    if (!live || !qid || fallback || sessionCode) return;
    const t = setTimeout(() => void loadResults(qid), 0);
    const iv = setInterval(() => void loadResults(qid), 3000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [live, qid, fallback, loadResults, sessionCode]);

  // Socket real-time (menggunakan koneksi gateway sinkronisasi)
  useEffect(() => {
    if (!live || !qid || fallback) return;
    let disposed = false;
    const sock = getSyncSocket();

    if (sock.connected) {
      setSynced(true);
    }

    const onConnect = () => {
      if (!disposed) setSynced(true);
    };

    const onDisconnect = () => {
      if (!disposed) {
        setSynced(false);
        setDevices(0);
      }
    };

    const onPresence = (p: { count: number }) => {
      if (!disposed && !sessionCode) setDevices(p.count);
    };

    const onSessionPresence = (p: { code: string; audienceCount: number }) => {
      if (!disposed && (!sessionCode || p.code === sessionCode)) {
        setDevices(p.audienceCount);
      }
    };

    const onVoteNew = (p: { question: number; total: number | null }) => {
      if (disposed || p.question !== qid) return;
      if (!sessionCode) {
        void loadResults(qid);
      }
      scheduleSpark(qid);
    };

    const onSessionPollResults = (res: {
      question: number;
      total: number;
      options: { key: string; count: number }[];
    }) => {
      if (disposed || res?.question !== qid) return;
      const map: Counts = {};
      for (const o of res.options) map[o.key] = o.count;
      setCounts(map);
      setTotal(res.total);
      totalRef.current = res.total;
      audio.chime();
      scheduleSpark(qid);
    };

    const onVotesReset = () => {
      if (disposed) return;
      setCounts({});
      setTotal(0);
      totalRef.current = 0;
      setNotice(null);
      setSpark(null);
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("presence", onPresence);
    sock.on("session:presence", onSessionPresence);
    sock.on("vote:new", onVoteNew);
    sock.on("session:poll_results", onSessionPollResults);
    sock.on("votes:reset", onVotesReset);

    return () => {
      disposed = true;
      setSynced(false);
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("presence", onPresence);
      sock.off("session:presence", onSessionPresence);
      sock.off("vote:new", onVoteNew);
      sock.off("session:poll_results", onSessionPollResults);
      sock.off("votes:reset", onVotesReset);
    };
  }, [live, qid, fallback, loadResults, scheduleSpark, sessionCode]);

  // Threshold: responden < 10 dalam 15 detik pertama
  useEffect(() => {
    if (!liveKey) return;
    const t = setTimeout(() => {
      if (totalRef.current < 10) setNotice(liveKey);
    }, 15000);
    return () => clearTimeout(t);
  }, [liveKey]);

  const resetPoll = async () => {
    if (sessionCode) {
      const sock = getSyncSocket();
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("presentation_presenter_token") ||
            localStorage.getItem("presentation_presenter_token") ||
            ""
          : "";
      sock.emit("session:poll_reset", { code: sessionCode, presenterToken: token });
      setCounts({});
      setTotal(0);
      totalRef.current = 0;
      setNotice(null);
      hud("POLLING SESI INI DI-RESET", "ember");
      return;
    }

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
