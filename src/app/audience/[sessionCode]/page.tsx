"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  WifiOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Tv,
  Vote,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SECTIONS } from "@/components/presentation/context";
import {
  calculateCanvasScale,
  BASE_CANVAS_WIDTH,
  BASE_CANVAS_HEIGHT,
} from "@/lib/canvasScale";
import {
  getSyncSocket,
  joinAudienceSession,
  sendAudienceVote,
  type PublicSessionSnapshot,
  type SessionJoinResponse,
  type SessionVoteResponse,
} from "@/lib/syncSocket";
import { audio } from "@/lib/audio";
import { audioManager } from "@/lib/audioManager";
import { Grain } from "@/components/presentation/atoms";
import AudienceVotingCard from "@/components/presentation/audience/AudienceVotingCard";

const pad2 = (n: number) => String(n).padStart(2, "0");

type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "ended"
  | "error";

export default function AudienceViewPage() {
  const params = useParams<{ sessionCode: string }>();
  const rawCode = params?.sessionCode;
  const sessionCode = Array.isArray(rawCode) ? rawCode[0] : (rawCode ?? "");

  // Persistent Voter ID per device (disimpan di localStorage)
  const [voterId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("presentation_voter_id");
      if (!id) {
        id =
          "vtr_" +
          Math.random().toString(36).substring(2, 9) +
          Date.now().toString(36);
        localStorage.setItem("presentation_voter_id", id);
      }
      return id;
    }
    return "vtr_guest";
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [audienceCount, setAudienceCount] = useState<number>(1);
  const [sessionData, setSessionData] = useState<PublicSessionSnapshot>({
    code: sessionCode,
    stage: "lobby",
    section: 0,
    step: 0,
    revision: 0,
    updatedAt: Date.now(),
  });

  // State voting lokal: pilihan jawaban per pertanyaan
  const [myVotes, setMyVotes] = useState<Record<number, string>>({});
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteNotice, setVoteNotice] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Tab audiens saat sesi polling aktif: "voting" (lembar suara) atau "slide" (layar proyektor live)
  const [audienceTab, setAudienceTab] = useState<"slide" | "voting">("voting");
  const [isMuted, setIsMuted] = useState(false);

  const isMountedRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevPosRef = useRef<{
    stage?: string;
    section?: number;
    step?: number;
    pollingStatus?: string;
  } | null>(null);

  // Buka blokir Web Audio API pada sentuhan/tap pertama pengguna di HP
  useEffect(() => {
    const unlockAudio = () => {
      audio.init();
      audioManager.init();
      const ctx = audio.getContext();
      if (ctx && ctx.state === "suspended") {
        void ctx.resume();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Sambungkan ke gateway sinkronisasi WebSocket
  useEffect(() => {
    isMountedRef.current = true;
    if (!sessionCode) {
      setConnectionStatus("error");
      setErrorMessage("Kode sesi tidak ditemukan di URL");
      return;
    }

    const socket = getSyncSocket();

    const handleJoin = async () => {
      setConnectionStatus("connecting");
      try {
        const res: SessionJoinResponse = await joinAudienceSession(sessionCode, voterId);
        if (!isMountedRef.current) return;

        if (res.ok && res.session) {
          setSessionData(res.session);
          setAudienceCount(res.audienceCount ?? 1);
          if (res.myVotes) {
            setMyVotes(res.myVotes);
          }
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("error");
          setErrorMessage(res.error || "Sesi presentasi tidak ditemukan atau telah berakhir");
        }
      } catch {
        if (!isMountedRef.current) return;
        setConnectionStatus("error");
        setErrorMessage("Gagal menghubungkan ke server sinkronisasi");
      }
    };

    handleJoin();

    // Event listeners
    const onConnect = () => {
      if (!isMountedRef.current) return;
      setConnectionStatus("connected");
      // Ambil snapshot terbaru begitu tersambung kembali
      socket.emit(
        "session:join",
        { code: sessionCode, voterId },
        (res: SessionJoinResponse) => {
          if (res?.ok && res.session && isMountedRef.current) {
            setSessionData(res.session);
            if (typeof res.audienceCount === "number") {
              setAudienceCount(res.audienceCount);
            }
            if (res.myVotes) {
              setMyVotes((prev) => ({ ...prev, ...res.myVotes }));
            }
          }
        },
      );
    };

    const onDisconnect = () => {
      if (!isMountedRef.current) return;
      setConnectionStatus("disconnected");
    };

    const onReconnectAttempt = () => {
      if (!isMountedRef.current) return;
      setConnectionStatus("reconnecting");
    };

    const onSync = (snapshot: PublicSessionSnapshot) => {
      if (!isMountedRef.current) return;
      if (snapshot && snapshot.code === sessionCode) {
        // Mainkan SFX teatrikal panggung jika posisi slide presenter berubah
        const prev = prevPosRef.current;
        if (prev) {
          if (prev.stage !== snapshot.stage || prev.section !== snapshot.section) {
            audioManager.playWhoosh();
            audio.thump();
          } else if (prev.step !== snapshot.step) {
            if (snapshot.section === 1 && snapshot.step === 2) {
              audioManager.playCurtain();
            } else if (snapshot.section === 1 && snapshot.step === 1) {
              audioManager.playSearchlight();
            } else {
              audio.tick();
            }
          }

          // Deteksi pembukaan lembar kuis polling (chime)
          if (
            snapshot.polling &&
            snapshot.polling.status === "open" &&
            prev.pollingStatus !== "open"
          ) {
            audio.chime();
          }
        }

        prevPosRef.current = {
          stage: snapshot.stage,
          section: snapshot.section,
          step: snapshot.step,
          pollingStatus: snapshot.polling?.status,
        };

        setSessionData(snapshot);
        setConnectionStatus("connected");
      }
    };

    const onSessionPresence = (payload: { code: string; audienceCount: number }) => {
      if (!isMountedRef.current) return;
      if (payload && payload.code === sessionCode) {
        setAudienceCount(payload.audienceCount);
      }
    };

    const onSessionEnded = (payload: { code: string }) => {
      if (!isMountedRef.current) return;
      if (payload && payload.code === sessionCode) {
        setConnectionStatus("ended");
        setSessionData((prev) => ({ ...prev, stage: "ended" }));
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.on("session:sync", onSync);
    socket.on("session:presence", onSessionPresence);
    socket.on("session:ended", onSessionEnded);

    return () => {
      isMountedRef.current = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.off("session:sync", onSync);
      socket.off("session:presence", onSessionPresence);
      socket.off("session:ended", onSessionEnded);
    };
  }, [sessionCode, voterId]);

  // Handler kirim suara ke server
  const handleVote = useCallback(
    async (optionKey: string) => {
      const qid = sessionData.polling?.questionId;
      if (!qid || sessionData.polling?.status !== "open") {
        setVoteNotice({
          type: "error",
          msg: "Voting untuk pertanyaan ini sedang ditutup",
        });
        return;
      }

      setIsSubmittingVote(true);
      setVoteNotice(null);

      // Kunci idempoten per perangkat dan opsi untuk keamanan retry jaringan
      const idempotencyKey = `idem_${sessionCode}_q${qid}_${voterId}_${optionKey}`;

      try {
        const res: SessionVoteResponse = await sendAudienceVote(
          sessionCode,
          qid,
          optionKey,
          voterId,
          idempotencyKey,
        );

        if (res.ok) {
          setMyVotes((prev) => ({ ...prev, [qid]: optionKey }));
          audio.chime();
          setVoteNotice({
            type: "success",
            msg: `Pilihan Anda (Opsi ${optionKey}) berhasil tercatat di server!`,
          });
        } else {
          setVoteNotice({
            type: "error",
            msg: res.error || "Gagal mencatat suara. Silakan coba lagi.",
          });
        }
      } catch {
        setVoteNotice({
          type: "error",
          msg: "Koneksi terganggu saat mengirim suara. Coba kembali.",
        });
      } finally {
        setIsSubmittingVote(false);
      }
    },
    [sessionCode, sessionData.polling, voterId],
  );

  // Bersihkan notifikasi saat pertanyaan berganti
  useEffect(() => {
    setVoteNotice(null);
  }, [sessionData.polling?.questionId]);

  // Dynamic settled state: Beri kesempatan timeline GSAP berjalan saat ganti slide/step
  const [settled, setSettled] = useState(true);
  const prevSlidePosRef = useRef({
    section: sessionData.section,
    step: sessionData.step,
  });

  useEffect(() => {
    if (
      sessionData.section !== prevSlidePosRef.current.section ||
      sessionData.step !== prevSlidePosRef.current.step
    ) {
      prevSlidePosRef.current = {
        section: sessionData.section,
        step: sessionData.step,
      };
      setSettled(false);
      const timer = setTimeout(() => {
        setSettled(true);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [sessionData.section, sessionData.step]);

  // Sinkronisasi frame slide live (iframe) dengan state sesi terkini
  const syncIframe = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: "SLIDE_CHANGE",
        section: sessionData.section,
        step: sessionData.step,
        settled,
        isAudience: true,
        sessionCode,
      },
      "*",
    );
  }, [sessionData.section, sessionData.step, settled, sessionCode]);

  useEffect(() => {
    syncIframe();
  }, [syncIframe]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "PREVIEW_EMBED_READY") {
        syncIframe();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [syncIframe]);

  // Pantau ukuran viewport untuk perhitungan contain scale kanvas 16:9
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : BASE_CANVAS_WIDTH,
    height: typeof window !== "undefined" ? window.innerHeight : BASE_CANVAS_HEIGHT,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const scaleResult = useMemo(
    () =>
      calculateCanvasScale(viewport, {
        width: BASE_CANVAS_WIDTH,
        height: BASE_CANVAS_HEIGHT,
      }),
    [viewport],
  );

  // Cek apakah mode polling aktif (open atau closed)
  const isPollingActive =
    sessionData.stage === "live" &&
    sessionData.polling &&
    sessionData.polling.status !== "inactive" &&
    sessionData.polling.questionId !== null;

  // Saat polling aktif dan pengguna belum memilih, arahkan ke tab voting secara otomatis
  useEffect(() => {
    if (isPollingActive && sessionData.polling?.questionId) {
      const qid = sessionData.polling.questionId;
      if (!myVotes[qid]) {
        setAudienceTab("voting");
      }
    }
  }, [isPollingActive, sessionData.polling?.questionId, myVotes]);

  // 1. Tampilan Error / Kode Tidak Valid
  if (connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8] flex flex-col items-center justify-center p-6 text-center select-none">
        <Grain />
        <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-paper">
            Sesi Tidak Ditemukan
          </h1>
          <p className="font-body text-xs sm:text-sm text-mute leading-relaxed">
            {errorMessage || `Kode sesi "${sessionCode}" tidak aktif atau sudah berakhir.`}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 font-code text-xs font-semibold text-paper hover:bg-white/20 transition-all w-full"
            >
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Tampilan Sesi Telah Berakhir
  if (connectionStatus === "ended" || sessionData.stage === "ended") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8] flex flex-col items-center justify-center p-6 text-center select-none">
        <Grain />
        <div className="max-w-md w-full rounded-2xl border border-white/15 bg-white/[0.03] p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-paper">
            Presentasi Selesai
          </h1>
          <p className="font-body text-xs sm:text-sm text-mute leading-relaxed">
            Pemateri telah mengakhiri sesi presentasi ini. Terima kasih atas partisipasi dan perhatian Anda.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/makalah"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8A020] px-5 py-2.5 font-code text-xs font-bold text-black hover:bg-[#FFB740] transition-all w-full shadow-[0_0_20px_rgba(232,160,32,0.3)]"
            >
              <span>Baca Naskah Makalah Lengkap</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tampilan Ruang Tunggu Audiens (Lobby Stage)
  if (sessionData.stage === "lobby") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8] flex flex-col justify-between p-6 sm:p-10 select-none">
        <Grain />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-code text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              TERHUBUNG KE SESI
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-code text-xs text-mute">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{audienceCount} Audiens Terhubung</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="my-auto py-8 max-w-lg mx-auto w-full space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A020]/40 bg-[#E8A020]/10 px-4 py-1.5 font-code text-xs text-[#E8A020]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A020]" />
            <span>KODE SESI: {sessionCode}</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-paper leading-snug">
              Anatomi Karya Tulis Ilmiah
            </h1>
            <p className="font-body text-xs sm:text-sm text-mute">
              Kelompok 6 PDB 93 · Universitas Airlangga
            </p>
          </div>

          {/* Status Box */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A020] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E8A020]"></span>
              </span>
              <span className="font-code text-xs font-bold text-paper">
                Menunggu Pemateri Memulai Slide...
              </span>
            </div>
            <p className="font-body text-xs text-paper/70 leading-relaxed">
              Layar ponsel Anda akan otomatis menampilkan slide presentasi yang sama persis dengan layar proyektor secara real-time. Saat polling interaktif dibuka, lembar voting interaktif akan muncul langsung di ponsel Anda.
            </p>
          </div>

          {/* Agenda Ringkas Babak */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-left space-y-2">
            <span className="font-code text-[10px] text-mute uppercase tracking-widest block">
              Struktur Pembahasan (9 Babak)
            </span>
            <div className="grid grid-cols-2 gap-1.5 font-code text-[11px] text-paper/80">
              <div>00 · Ouverture</div>
              <div>01 · Pengantar</div>
              <div>02 · Latar Belakang</div>
              <div>03 · Hakikat & Karakter</div>
              <div>04 · Anatomi Theater</div>
              <div>05 · Live Polling Interaktif</div>
              <div>06 · Variasi KTI</div>
              <div>07 · Kaidah & Etika</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 text-center font-code text-[11px] text-mute">
          Audience View · Mode Sinkronisasi Real-Time & Live Polling
        </div>
      </div>
    );
  }

  // 4. Tampilan Live (Slide Mirroring + Live Polling Terintegrasi)
  return (
    <div className="fixed inset-0 overflow-hidden bg-base text-paper select-none flex flex-col">
      <Grain />

      {/* Floating Indicator Header */}
      <header className="fixed top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 z-50 pointer-events-none flex items-center justify-between gap-2">
        {/* Pill Status Babak & Langkah */}
        <div className="pointer-events-auto rounded-full border border-white/15 bg-black/80 backdrop-blur px-3 py-1 font-code text-[10px] sm:text-xs text-paper flex items-center gap-2 shadow-lg">
          <span className="text-[#E8A020] font-bold">
            ACT.{pad2(sessionData.section)}
          </span>
          <span className="text-mute">·</span>
          <span>
            {isPollingActive
              ? `POLLING 0${sessionData.polling?.questionId}`
              : SECTIONS[sessionData.section]?.label ?? "MATERI"}
          </span>
          <span className="text-mute">·</span>
          <span className="text-paper/75">
            STEP {sessionData.step + 1}/{SECTIONS[sessionData.section]?.steps ?? 1}
          </span>
        </div>

        {/* Indikator Status Koneksi & Audio */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`rounded-full border px-2.5 py-1 font-code text-[10px] flex items-center gap-1.5 backdrop-blur shadow-lg transition-colors ${
              isMuted
                ? "border-rose-500/40 bg-rose-950/80 text-rose-300"
                : "border-[#E8A020]/40 bg-black/80 text-[#E8A020]"
            }`}
            title={isMuted ? "Aktifkan Audio Panggung" : "Bisukan Audio Panggung"}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-rose-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-[#E8A020] animate-pulse" />
            )}
            <span className="hidden sm:inline">
              {isMuted ? "Audio Mati" : "Audio ON"}
            </span>
          </button>

          {connectionStatus === "connected" && (
            <div className="rounded-full border border-emerald-500/30 bg-emerald-950/80 backdrop-blur px-2.5 py-1 font-code text-[10px] text-emerald-400 flex items-center gap-1.5 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tersinkron</span>
            </div>
          )}

          {connectionStatus === "reconnecting" && (
            <div className="rounded-full border border-amber-500/30 bg-amber-950/80 backdrop-blur px-2.5 py-1 font-code text-[10px] text-[#E8A020] flex items-center gap-1.5 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-ping" />
              <span>Menyambung Ulang...</span>
            </div>
          )}

          {connectionStatus === "disconnected" && (
            <div className="rounded-full border border-rose-500/30 bg-rose-950/80 backdrop-blur px-2.5 py-1 font-code text-[10px] text-rose-400 flex items-center gap-1.5 shadow-lg">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>Terputus (Snapshot Terakhir)</span>
            </div>
          )}
        </div>
      </header>

      {/* Konten Polling Sheet (Tampil saat mode polling aktif dan tab voting dipilih) */}
      {isPollingActive && sessionData.polling?.questionId && audienceTab === "voting" && (
        <div className="relative flex-1 w-full h-full overflow-y-auto px-4 pt-16 sm:pt-20 pb-20 z-20">
          <AudienceVotingCard
            sessionCode={sessionCode}
            questionId={sessionData.polling.questionId}
            status={sessionData.polling.status === "open" ? "open" : "closed"}
            selectedOption={myVotes[sessionData.polling.questionId]}
            isSubmitting={isSubmittingVote}
            notice={voteNotice}
            onVote={handleVote}
          />
        </div>
      )}

      {/* Konten Slide Canvas Mirror (Selalu dipertahankan, hidden jika sedang di tab voting) */}
      <div
        className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-[#0A0A0F] ${
          isPollingActive && sessionData.polling?.questionId && audienceTab === "voting"
            ? "hidden"
            : "flex"
        }`}
      >
        {/* Proportional Scaling Canvas: 16:9 BASE_CANVAS_WIDTH x BASE_CANVAS_HEIGHT centered and letterboxed */}
        <div
          style={{
            width: `${BASE_CANVAS_WIDTH}px`,
            height: `${BASE_CANVAS_HEIGHT}px`,
            transform: `scale(${scaleResult.scale})`,
            transformOrigin: "center center",
            flexShrink: 0,
          }}
          className="relative overflow-hidden bg-base text-paper select-none shadow-2xl"
        >
          <iframe
            ref={iframeRef}
            src={`/slide-embed?section=${sessionData.section}&step=${sessionData.step}&audience=1&sessionCode=${sessionCode}`}
            title="Layar Presentasi Utama"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            className="w-full h-full border-0 select-none bg-[#0A0A0F] pointer-events-none"
            onLoad={() => syncIframe()}
          />
        </div>

        {/* Orientation Hint on Portrait Devices */}
        {scaleResult.isPortrait && !isPollingActive && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/90 backdrop-blur px-3.5 py-1.5 font-code text-[10.5px] text-paper shadow-2xl">
              <Smartphone className="w-3.5 h-3.5 text-[#E8A020] animate-pulse" />
              <span>Putar layar ke landscape untuk tampilan penuh</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Mode Switcher saat Sesi Polling Berlangsung: Audiens bebas melihat Slide Live vs Lembar Voting */}
      {isPollingActive && sessionData.polling?.questionId && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="flex items-center gap-1 p-1 rounded-full border border-white/20 bg-black/90 backdrop-blur-md shadow-2xl">
            <button
              type="button"
              onClick={() => setAudienceTab("slide")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-code text-[11px] sm:text-xs font-semibold transition-all ${
                audienceTab === "slide"
                  ? "bg-[#E8A020] text-black shadow-md font-bold"
                  : "text-mute hover:text-paper"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Layar Slide Live</span>
            </button>
            <button
              type="button"
              onClick={() => setAudienceTab("voting")}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-code text-[11px] sm:text-xs font-semibold transition-all ${
                audienceTab === "voting"
                  ? "bg-[#E8A020] text-black shadow-md font-bold"
                  : "text-mute hover:text-paper"
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Lembar Voting</span>
              {sessionData.polling.status === "open" &&
                !myVotes[sessionData.polling.questionId] && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
            </button>
          </div>
        </div>
      )}

      {/* Cinematic Vignette */}
      <div className="vignette pointer-events-none" aria-hidden="true" />
    </div>
  );
}
