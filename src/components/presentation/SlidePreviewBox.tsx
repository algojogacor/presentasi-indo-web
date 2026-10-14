"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, X, Monitor, Smartphone, RefreshCw } from "lucide-react";

interface SlidePreviewBoxProps {
  section: number;
  step: number;
  maxSteps: number;
}

export default function SlidePreviewBox({
  section,
  step,
  maxSteps,
}: SlidePreviewBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Ukuran kanvas virtual
  const V_WIDTH = viewMode === "desktop" ? 1280 : 390;
  const V_HEIGHT = viewMode === "desktop" ? 720 : 700;

  // Ukuran kanvas virtual untuk modal zoom
  const MODAL_V_WIDTH = 1280;
  const MODAL_V_HEIGHT = 720;
  const [modalScale, setModalScale] = useState(1);

  // ResizeObserver untuk menghitung faktor skala iframe secara otomatis & responsif
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(el);
    window.addEventListener("resize", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Hitung modal scale saat modal dibuka atau jendela di-resize
  useEffect(() => {
    if (!isModalOpen) return;

    const updateModalScale = () => {
      const maxW = Math.min(window.innerWidth * 0.9, 1340);
      const maxH = Math.min(window.innerHeight * 0.85, 800);
      const s = Math.min(maxW / MODAL_V_WIDTH, maxH / MODAL_V_HEIGHT);
      setModalScale(s);
    };

    updateModalScale();
    window.addEventListener("resize", updateModalScale);
    return () => window.removeEventListener("resize", updateModalScale);
  }, [isModalOpen]);

  // Kirim event postMessage ke iframe saat section atau step berubah
  const syncIframe = useCallback(
    (targetIframe: HTMLIFrameElement | null) => {
      if (!targetIframe || !targetIframe.contentWindow) return;
      targetIframe.contentWindow.postMessage(
        {
          type: "PREVIEW_SLIDE_CHANGE",
          section,
          step,
        },
        "*"
      );
    },
    [section, step]
  );

  useEffect(() => {
    syncIframe(iframeRef.current);
    if (isModalOpen) {
      syncIframe(modalIframeRef.current);
    }
  }, [section, step, syncIframe, isModalOpen]);

  // Tangani sinyal siap dari iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "PREVIEW_EMBED_READY") {
        setIsReady(true);
        syncIframe(iframeRef.current);
        if (modalIframeRef.current) {
          syncIframe(modalIframeRef.current);
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [syncIframe]);

  // Hitung scale & container height
  const scale = containerWidth > 0 ? containerWidth / V_WIDTH : 0.4;
  const containerHeight = Math.round(V_HEIGHT * scale);

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Top Bar Pengatur Pratinjau: Mode Switcher & Tombol Perbesar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="font-code text-[11px] text-[#E8A020] font-bold uppercase tracking-wider">
            Pratinjau Slide:
          </span>
          <span className="font-code text-xs text-paper/90">
            Babak {pad2(section)} · Langkah {step + 1}/{maxSteps}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle 16:9 vs 9:16 */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/50 p-0.5 font-code text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                viewMode === "desktop"
                  ? "bg-[#E8A020] text-black font-bold shadow-sm"
                  : "text-mute hover:text-paper"
              }`}
              title="Pratinjau Layar Proyektor (16:9 Widescreen)"
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden sm:inline">16:9 Proyektor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                viewMode === "mobile"
                  ? "bg-[#E8A020] text-black font-bold shadow-sm"
                  : "text-mute hover:text-paper"
              }`}
              title="Pratinjau Tampilan HP Audiens (Portrait)"
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">9:16 HP</span>
            </button>
          </div>

          {/* Tombol Perbesar / Modal Zoom */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 px-2 py-1 font-code text-[11px] text-paper/85 transition-all"
            title="Perbesar Tampilan Slide Penuh"
          >
            <Maximize2 className="w-3 h-3 text-[#E8A020]" />
            <span className="hidden sm:inline">Perbesar</span>
          </button>
        </div>
      </div>

      {/* Frame Pratinjau Virtual: Auto-scaled, Bebas Clipping */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl border-2 border-white/15 bg-black overflow-hidden shadow-2xl transition-all"
        style={{
          height: containerHeight > 0 ? `${containerHeight}px` : "240px",
        }}
      >
        {/* Iframe yang diskalakan secara matematis */}
        {containerWidth > 0 && (
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none"
            style={{
              width: `${V_WIDTH}px`,
              height: `${V_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              ref={iframeRef}
              src={`/slide-embed?section=${section}&step=${step}`}
              title="Pratinjau Slide Presentasi"
              className="w-full h-full border-0 select-none bg-[#0A0A0F]"
              onLoad={() => {
                setIsReady(true);
                syncIframe(iframeRef.current);
              }}
            />
          </div>
        )}

        {/* Loading Overlay saat pertama kali render */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm font-code text-xs text-mute pointer-events-none">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E8A020] mr-2" />
            <span>Memuat pratinjau slide...</span>
          </div>
        )}

        {/* Overlay Badge Status di Pojok Kiri Bawah */}
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none rounded-md bg-black/75 backdrop-blur px-2 py-0.5 font-code text-[10px] text-paper/75 border border-white/10">
          {viewMode === "desktop" ? "Format 16:9 Widescreen" : "Format Layar HP"}
        </div>
      </div>

      {/* MODAL POP-UP ZOOM PRATINJAU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-fade-in select-none">
          <div className="relative flex flex-col items-center max-w-full">
            {/* Header Modal */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-white/10 mb-3 text-paper">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E8A020]" />
                <span className="font-code text-xs uppercase tracking-wider text-[#E8A020] font-bold">
                  PRATINJAU SKALA BESAR · BABAK {pad2(section)} · LANGKAH {step + 1}/{maxSteps}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-code text-paper transition-all"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Tutup [Esc]</span>
              </button>
            </div>

            {/* Container Iframe Modal yang Di-scale */}
            <div
              className="relative rounded-2xl border-2 border-[#E8A020]/40 bg-black overflow-hidden shadow-2xl"
              style={{
                width: `${Math.round(MODAL_V_WIDTH * modalScale)}px`,
                height: `${Math.round(MODAL_V_HEIGHT * modalScale)}px`,
              }}
            >
              <div
                className="origin-top-left"
                style={{
                  width: `${MODAL_V_WIDTH}px`,
                  height: `${MODAL_V_HEIGHT}px`,
                  transform: `scale(${modalScale})`,
                  transformOrigin: "top left",
                }}
              >
                <iframe
                  ref={modalIframeRef}
                  src={`/slide-embed?section=${section}&step=${step}`}
                  title="Pratinjau Layar Penuh"
                  className="w-full h-full border-0 select-none bg-[#0A0A0F]"
                  onLoad={() => {
                    syncIframe(modalIframeRef.current);
                  }}
                />
              </div>
            </div>

            <p className="mt-2.5 font-code text-[11px] text-mute tracking-widest text-center">
              Tekan tombol panah atau tombol di halaman utama untuk berpindah langkah
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
