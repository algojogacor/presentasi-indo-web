"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Users, Sparkles, Smartphone, ArrowRight } from "lucide-react";

interface LobbyScreenProps {
  sessionCode: string;
  audienceCount: number;
  onStart: () => void;
  onNewSession?: () => void;
  savedPos?: { section: number; step: number } | null;
  onResume?: () => void;
}

export default function LobbyScreen({
  sessionCode,
  audienceCount,
  onStart,
  onNewSession,
  savedPos,
  onResume,
}: LobbyScreenProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [fullAudienceUrl, setFullAudienceUrl] = useState("");
  const [joinInput, setJoinInput] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullAudienceUrl(`${window.location.origin}/audience/${sessionCode}`);
    }
  }, [sessionCode]);

  const qrSrc = fullAudienceUrl
    ? `/api/qr?data=${encodeURIComponent(fullAudienceUrl)}`
    : "";

  const copyUrl = () => {
    if (!fullAudienceUrl) return;
    navigator.clipboard.writeText(fullAudienceUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyCode = () => {
    if (!sessionCode) return;
    navigator.clipboard.writeText(sessionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-between bg-[#0A0A0F] text-paper px-6 sm:px-[8vw] py-8 md:py-[6vh] overflow-y-auto select-none">
      {/* Header Lobi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-edge/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#E8A020] animate-pulse" />
            <span className="font-code text-xs sm:text-sm uppercase tracking-[0.3em] text-[#E8A020] font-semibold">
              LOBI SESI PRESENTASI · UNIVERSITAS AIRLANGGA
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#F0EDE8]">
            Anatomi Karya Tulis Ilmiah
          </h1>
        </div>

        <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 font-code text-xs sm:text-sm text-emerald-400 font-medium shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>{audienceCount} Audiens Terhubung</span>
        </div>
      </div>

      {/* Konten Utama: QR Code & Petunjuk Bergabung */}
      <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-8 md:gap-14 max-w-5xl mx-auto w-full">
        {/* Kolom Kiri: QR Code Raksasa */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative rounded-2xl border-2 border-[#E8A020]/50 bg-[#121118]/95 p-4 sm:p-6 shadow-[0_0_60px_rgba(232,160,32,0.2)]">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt={`QR code untuk bergabung ke sesi ${sessionCode}`}
                className="h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80 object-contain rounded-lg"
              />
            ) : (
              <div className="h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80 bg-white/5 animate-pulse rounded-lg flex items-center justify-center font-code text-sm text-mute">
                Menyiapkan QR...
              </div>
            )}

            {/* Corner Aiming Brackets */}
            <span className="absolute -top-2 -left-2 h-6 w-6 border-t-4 border-l-4 border-[#E8A020] rounded-tl" />
            <span className="absolute -top-2 -right-2 h-6 w-6 border-t-4 border-r-4 border-[#E8A020] rounded-tr" />
            <span className="absolute -bottom-2 -left-2 h-6 w-6 border-b-4 border-l-4 border-[#E8A020] rounded-bl" />
            <span className="absolute -bottom-2 -right-2 h-6 w-6 border-b-4 border-r-4 border-[#E8A020] rounded-br" />
          </div>

          <p className="mt-4 font-code text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] text-[#E8A020] uppercase text-center">
            Pindai dari Layar dengan Kamera HP
          </p>
        </div>

        {/* Kolom Kanan: Panduan Akses Manual & Kode Sesi */}
        <div className="space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded bg-ember/15 px-3 py-1 font-code text-xs text-ember mb-2 border border-ember/30 uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-ember" />
              <span>Sinkronisasi Real-Time</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-paper leading-snug">
              Ikuti Setiap Slide dari Smartphone Anda
            </h2>
            <p className="mt-2 font-body text-sm sm:text-base md:text-lg text-paper/85 leading-relaxed">
              Slide di ponsel Anda akan berpindah otomatis mengikuti layar proyektor secara real-time tanpa delay dan tanpa login.
            </p>
          </div>

          {/* Kotak Kode Sesi */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-3.5">
            <span className="font-code text-xs uppercase tracking-wider text-mute/90 font-medium block">
              Atau Buka Tautan Manual
            </span>

            {/* URL Input Box */}
            <div className="flex items-center gap-2 rounded-lg border border-edge bg-black/60 px-3.5 py-2.5 font-code text-sm text-paper">
              <span className="truncate flex-1 text-ember font-medium select-all">
                {fullAudienceUrl || "Memuat tautan..."}
              </span>
              <button
                type="button"
                onClick={copyUrl}
                className="flex items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs text-paper hover:bg-white/20 active:scale-95 transition-all shrink-0 font-medium"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Kode Sesi Besar */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-code text-xs text-mute/90 uppercase tracking-widest font-medium block">
                  Kode Sesi Unik
                </span>
                <span className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#E8A020] tracking-widest">
                  {sessionCode}
                </span>
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E8A020]/40 bg-[#E8A020]/10 px-3.5 py-2 font-code text-xs sm:text-sm font-semibold text-[#E8A020] hover:bg-[#E8A020]/20 active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Kode Tersalin" : "Salin Kode"}</span>
              </button>
            </div>
          </div>

          {/* Kotak Gabung Sebagai Audiens (Untuk peserta yang membuka halaman utama di HP) */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-code text-[11px] font-semibold text-paper/90 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-[#E8A020]" />
                Bukan Pemateri? Masuk Sesi Audiens
              </span>
            </div>
            <p className="font-body text-xs text-mute leading-relaxed">
              Jika Anda peserta/audiens di ruangan, masukkan 4 karakter kode sesi yang tampil di proyektor:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = joinInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
                if (code) {
                  window.location.href = `/audience/${code}`;
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={joinInput}
                onChange={(e) =>
                  setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))
                }
                placeholder="MISAL: ABCD"
                maxLength={8}
                className="flex-1 bg-black/60 border border-edge rounded-lg px-3 py-2 font-code text-xs sm:text-sm text-paper placeholder:text-mute/50 focus:outline-none focus:border-[#E8A020] uppercase tracking-widest"
              />
              <button
                type="submit"
                disabled={!joinInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8A020] hover:bg-[#FFB740] px-3.5 py-2 font-code text-xs font-bold text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <span>Ikuti Sesi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Tombol Aksi Utama Presenter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStart}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8A020] px-6 py-3.5 font-code text-sm font-bold text-black shadow-[0_0_30px_rgba(232,160,32,0.35)] hover:bg-[#FFB740] active:scale-[0.99] transition-all"
            >
              <span>Mulai Presentasi</span>
              <span className="text-xs px-2 py-0.5 rounded bg-black/20 font-code">[Spasi / Enter]</span>
              <span>→</span>
            </button>

            {savedPos && (savedPos.section > 0 || savedPos.step > 0) && onResume && (
              <button
                type="button"
                onClick={onResume}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-5 py-3.5 font-code text-xs sm:text-sm font-bold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-900/50 active:scale-[0.99] transition-all"
              >
                <span>Lanjutkan ke Act.{String(savedPos.section).padStart(2, "0")} · Step {String(savedPos.step + 1).padStart(2, "0")}</span>
                <span>↻</span>
              </button>
            )}

            <a
              href="/presenter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 font-code text-xs sm:text-sm font-semibold text-paper hover:bg-white/10 hover:border-white/30 transition-all text-center"
            >
              <span>Naskah Pembicara (/presenter)</span>
              <ExternalLink className="w-4 h-4 text-[#E8A020]" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Lobi */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-edge/60 pt-4 font-code text-[10px] text-mute tracking-widest text-center sm:text-left">
        <span>TEKAN [SPASI] ATAU KLIK TOMBOL UNTUK MEMASUKI BABAK PEMBUKA (OUVERTURE)</span>
        {onNewSession && (
          <button
            type="button"
            onClick={onNewSession}
            className="text-mute/60 hover:text-ember underline transition-colors"
          >
            Buat Ulang Sesi Baru
          </button>
        )}
      </div>
    </div>
  );
}
