"use client";

import { useEffect, useState } from "react";
import { PAPER_META } from "@/data/paperContent";

export default function AppendixSlide() {
  const [fullUrl, setFullUrl] = useState("/makalah");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        setFullUrl(`${window.location.origin}/makalah`);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const qrSrc = `/api/qr?data=${encodeURIComponent(fullUrl)}`;

  return (
    <div className="fade-slide-in relative z-10 flex h-full flex-col justify-between px-[6vw] pt-[12vh] pb-[6vh] select-none">
      {/* Header Slide */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] animate-pulse" />
          <p className="font-code text-[11px] uppercase tracking-[0.3em] text-[#E8A020]">
            POSTLIMINARIES · LAMPIRAN &amp; DOKUMEN RESMI
          </p>
        </div>

        <h2 className="font-display text-[3.2vw] font-bold leading-tight text-[#F0EDE8]">
          Akses Naskah Lengkap &amp; Berkas Asli
        </h2>

        <p className="mt-2 max-w-[46vw] font-body text-[1.2vw] leading-relaxed text-paper/80">
          Naskah ilmiah 20+ halaman berstandar akademik lengkap dengan tinjauan teoritis, metodologi, pembahasan mendalam, serta seluruh 12 sumber rujukan baku.
        </p>
      </div>

      {/* Grid Konten: Info Berkas di Kiri & QR Code di Kanan */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-[4vw] my-auto">
        {/* Kolom Kiri: Detail Naskah & Tombol Akses */}
        <div className="space-y-4 max-w-[50vw]">
          <div className="rounded-xl border border-white/10 bg-[#111118]/80 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-code text-[10px] tracking-wider text-[#E8A020] uppercase">
                BERKAS TERVERIFIKASI · PDB 93
              </span>
              <span className="font-code text-[10px] text-mute">FORMAT .DOCX &amp; WEB</span>
            </div>

            <h3 className="font-display text-[1.45vw] font-semibold text-paper leading-snug">
              {PAPER_META.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-code text-[11px] text-mute/90 pt-1">
              <span>Dosen: <strong className="text-[#E8A020]">{PAPER_META.lecturer}</strong></span>
              <span>Kelompok: <strong className="text-paper">{PAPER_META.group}</strong></span>
              <span>Tahun: <strong className="text-paper">{PAPER_META.year}</strong></span>
            </div>
          </div>

          {/* Tombol Aksi Langsung */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/makalah"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E8A020] px-5 py-2.5 font-code text-[12px] font-bold text-black transition-all hover:bg-[#FFB740] shadow-[0_0_20px_rgba(232,160,32,0.3)]"
            >
              <span>Buka Web Reader (/makalah)</span>
              <span className="text-[14px]">↗</span>
            </a>

            <a
              href={PAPER_META.downloadUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 font-code text-[12px] font-semibold text-paper/90 transition-all hover:border-[#E8A020]/60 hover:text-[#E8A020]"
            >
              <svg
                className="w-4 h-4 text-[#E8A020]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Unduh Dokumen Asli (.docx)</span>
            </a>
          </div>
        </div>

        {/* Kolom Kanan: QR Code Box */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E8A020]/40 bg-[#161410]/95 p-5 shadow-[0_0_40px_rgba(232,160,32,0.15)]">
          <div className="mb-2 text-center">
            <p className="font-code text-[11px] font-bold text-[#E8A020] tracking-wider uppercase">
              PINDAI DENGAN KAMERA HP
            </p>
            <p className="font-code text-[9px] text-mute/80">
              Akses instan langsung tanpa izin login
            </p>
          </div>

          {/* Kotak Gambar QR */}
          <div className="relative rounded-lg border border-[#E8A020]/30 bg-[#0A0A0F] p-2">
            <img
              src={qrSrc}
              alt="QR Code Makalah Lengkap"
              className="h-[18vh] w-[18vh] md:h-[22vh] md:w-[22vh] object-contain rounded"
            />
          </div>

          <p className="mt-3 font-code text-[10px] text-mute/90 tracking-widest text-center truncate max-w-[200px]">
            {fullUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      {/* Footer Navigasi */}
      <div className="border-t border-edge/60 pt-[1.5vh] flex items-center justify-between font-code text-[10px] text-mute/60 tracking-widest">
        <span>BAGIAN AKHIR (POSTLIMINARIES) · ANATOMI KTI SELESAI LENGKAP</span>
        <span>KELOMPOK 6 PDB 93 · UNIVERSITAS AIRLANGGA · 2026</span>
      </div>
    </div>
  );
}
