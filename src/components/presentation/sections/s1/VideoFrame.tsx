"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Volume2 } from "lucide-react";
import { LiveDot } from "../../atoms";
import { usePres } from "../../context";
import {
  getSyncSocket,
  sendPresenterMediaUpdate,
  type MediaPlaybackState,
} from "@/lib/syncSocket";

const VIDEO_ID = "E6pPlIvlrPs";
const SECTION_ID = 1;

interface VideoFrameProps {
  step: number;
}

// Global script loader helper untuk YouTube IFrame API
function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const win = window as any;
  if (win.YT && win.YT.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
    }

    const prevOnReady = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      prevOnReady?.();
      resolve();
    };

    const interval = setInterval(() => {
      if (win.YT && win.YT.Player) {
        clearInterval(interval);
        resolve();
      }
    }, 150);
  });
}

export default function VideoFrame({ step }: VideoFrameProps) {
  const { isAudience, sessionCode, presenterToken } = usePres();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [showUnblockPrompt, setShowUnblockPrompt] = useState(false);
  const [lastMediaState, setLastMediaState] = useState<MediaPlaybackState | null>(null);

  const isVideoActive = step >= 2 && step <= 3;

  // Inisialisasi YouTube Player saat step >= 2
  useEffect(() => {
    if (!isVideoActive) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      setPlayerReady(false);
      return;
    }

    let isMounted = true;

    loadYouTubeIframeApi().then(() => {
      if (!isMounted || !containerRef.current) return;
      const win = window as any;
      if (!win.YT || !win.YT.Player) return;

      const playerDiv = document.createElement("div");
      playerDiv.id = "s1-yt-player-target";
      playerDiv.className = "absolute inset-0 h-full w-full";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(playerDiv);

      const player = new win.YT.Player(playerDiv, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: isAudience ? 0 : 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: () => {
            if (!isMounted) return;
            playerRef.current = player;
            setPlayerReady(true);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            const playerState = event.data;
            // Hanya presenter yang mengirim event update ke server
            if (!isAudience && sessionCode && presenterToken) {
              const time = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
              if (playerState === win.YT.PlayerState.PLAYING) {
                sendPresenterMediaUpdate(sessionCode, presenterToken, {
                  mediaId: VIDEO_ID,
                  section: SECTION_ID,
                  status: "playing",
                  currentTime: time,
                  timestamp: Date.now(),
                });
                // Heartbeat sinkronisasi waktu setiap 4 detik untuk koreksi drift
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                heartbeatRef.current = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                    sendPresenterMediaUpdate(sessionCode, presenterToken, {
                      mediaId: VIDEO_ID,
                      section: SECTION_ID,
                      status: "playing",
                      currentTime: playerRef.current.getCurrentTime(),
                      timestamp: Date.now(),
                    });
                  }
                }, 4000);
              } else if (playerState === win.YT.PlayerState.PAUSED) {
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                sendPresenterMediaUpdate(sessionCode, presenterToken, {
                  mediaId: VIDEO_ID,
                  section: SECTION_ID,
                  status: "paused",
                  currentTime: time,
                  timestamp: Date.now(),
                });
              } else if (playerState === win.YT.PlayerState.ENDED) {
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                sendPresenterMediaUpdate(sessionCode, presenterToken, {
                  mediaId: VIDEO_ID,
                  section: SECTION_ID,
                  status: "ended",
                  currentTime: time,
                  timestamp: Date.now(),
                });
              }
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, [isVideoActive, isAudience, sessionCode, presenterToken]);

  // Audience View: Dengarkan sinkronisasi media dari presenter
  useEffect(() => {
    if (!isAudience || !isVideoActive) return;

    const socket = getSyncSocket();
    const handleMediaSync = (media: MediaPlaybackState | null) => {
      setLastMediaState(media);
      const player = playerRef.current;
      if (!player || !playerReady) return;

      if (!media || media.section !== SECTION_ID) {
        try {
          player.pauseVideo();
        } catch {}
        return;
      }

      if (media.status === "playing") {
        const elapsed = Math.max(0, (Date.now() - media.timestamp) / 1000);
        const targetTime = media.currentTime + elapsed;
        try {
          const currentTime = player.getCurrentTime();
          // Koreksi drift bertahap jika selisih > 2.5 detik
          if (Math.abs(currentTime - targetTime) > 2.5) {
            player.seekTo(targetTime, true);
          }
          player.playVideo();
          // Jika video tidak berputar karena proteksi autoplay browser HP
          setTimeout(() => {
            if (playerRef.current) {
              const state = playerRef.current.getPlayerState?.();
              if (state !== 1 && state !== 3) {
                setShowUnblockPrompt(true);
              } else {
                setShowUnblockPrompt(false);
              }
            }
          }, 600);
        } catch {
          setShowUnblockPrompt(true);
        }
      } else if (media.status === "paused") {
        try {
          player.pauseVideo();
          const currentTime = player.getCurrentTime();
          if (Math.abs(currentTime - media.currentTime) > 1.0) {
            player.seekTo(media.currentTime, true);
          }
          setShowUnblockPrompt(false);
        } catch {}
      } else if (media.status === "ended") {
        try {
          player.pauseVideo();
        } catch {}
      }
    };

    socket.on("session:media_sync", handleMediaSync);

    // Terapkan jika sudah ada state yang diterima sebelumnya
    if (lastMediaState) {
      handleMediaSync(lastMediaState);
    }

    return () => {
      socket.off("session:media_sync", handleMediaSync);
    };
  }, [isAudience, isVideoActive, playerReady, lastMediaState]);

  // Tombol aksi satu kali untuk membuka blokir autoplay browser HP
  const handleUnblockAutoplay = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      try {
        player.playVideo();
        player.unMute();
        if (lastMediaState && lastMediaState.status === "playing") {
          const elapsed = Math.max(0, (Date.now() - lastMediaState.timestamp) / 1000);
          player.seekTo(lastMediaState.currentTime + elapsed, true);
        }
      } catch {}
    }
    setShowUnblockPrompt(false);
  }, [lastMediaState]);

  return (
    <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
      <div className="s1-frame relative w-[92vw] sm:w-[85vw] md:w-[min(62vw,148vh)]">
        <div className="absolute -top-7 left-0 flex items-center gap-2 font-code text-[10px] tracking-[0.35em] text-mute">
          <LiveDot />
          <span>GUEST LECTURER</span>
        </div>

        <div className="relative aspect-video w-full overflow-hidden border border-ember/60 bg-black shadow-2xl">
          {isVideoActive ? (
            <div ref={containerRef} className="absolute inset-0 h-full w-full" />
          ) : null}

          {/* Prompt Unblock Autoplay untuk HP Audiens */}
          {isAudience && isVideoActive && showUnblockPrompt && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
              <button
                onClick={handleUnblockAutoplay}
                type="button"
                className="flex items-center gap-3 rounded-full border border-amber-400/50 bg-[#E8A020] px-5 py-3 font-code text-xs font-bold text-black shadow-[0_0_30px_rgba(232,160,32,0.4)] transition-transform active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Ketuk Layar untuk Sinkronkan Video</span>
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-6">
          <div>
            <p className="font-body text-[clamp(0.85rem,1.05vw,1.15rem)] leading-snug text-paper">
              Prof. Wisnu Jatmiko — Guru Besar Fasilkom UI
            </p>
            <p className="mt-1 font-code text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.22em] text-mute">
              SERI METODOLOGI PENELITIAN &amp; PENULISAN ARTIKEL ILMIAH
            </p>
          </div>
          <div className="text-left sm:text-right font-code text-[9px] sm:text-[10px] leading-[1.6] sm:leading-[1.8] tracking-[0.12em] text-mute">
            <p>BAB 5 · PART 1 — PENTINGNYA MENULIS</p>
            <p>LAB1231 FASILKOM UI · 04:41 · 1080p</p>
          </div>
        </div>
      </div>
    </div>
  );
}
