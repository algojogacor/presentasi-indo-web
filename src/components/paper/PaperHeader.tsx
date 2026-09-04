"use client";

import Link from "next/link";
import { PAPER_META, AUTHORS } from "@/data/paperContent";

export default function PaperHeader() {
  return (
    <header className="border-b border-white/10 bg-[#111118]/90 pb-8 pt-10 px-4 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3.5 py-1.5 font-code text-[11px] text-paper/80 transition-all hover:border-[#E8A020]/60 hover:text-[#E8A020]"
          >
            <span>←</span>
            <span>Kembali ke Presentasi</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={PAPER_META.downloadUrl}
              download
              className="inline-flex items-center gap-2 rounded bg-[#E8A020] px-4 py-1.5 font-code text-[11px] font-bold text-black transition-all hover:bg-[#FFB740] shadow-[0_0_15px_rgba(232,160,32,0.3)]"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Unduh Dokumen (.docx)</span>
            </a>
          </div>
        </div>

        {/* Paper Header Identity */}
        <div className="text-center md:text-left space-y-4">
          <div className="inline-block rounded border border-[#E8A020]/40 bg-[#E8A020]/10 px-3 py-1 font-code text-[10px] uppercase tracking-widest text-[#E8A020]">
            Naskah Lengkap · Makalah Ilmiah
          </div>

          <h1 className="font-display text-[26px] sm:text-[34px] md:text-[40px] font-bold leading-tight text-[#F0EDE8]">
            {PAPER_META.title}
          </h1>

          <p className="font-code text-[12px] text-mute tracking-wider">
            {PAPER_META.institution} · {PAPER_META.year}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-6 mt-6 text-left">
            {/* Lecturer Card */}
            <div className="rounded border border-white/10 bg-[#0A0A0F]/60 p-4">
              <span className="font-code text-[10px] uppercase tracking-widest text-mute block mb-1">
                Dosen Pengampu Mata Kuliah
              </span>
              <p className="font-display italic text-[18px] text-[#E8A020]">
                {PAPER_META.lecturer}
              </p>
              <p className="font-code text-[11px] text-mute/80 mt-0.5">
                NIP. {PAPER_META.nip}
              </p>
            </div>

            {/* Group Members Card */}
            <div className="rounded border border-white/10 bg-[#0A0A0F]/60 p-4">
              <span className="font-code text-[10px] uppercase tracking-widest text-mute block mb-2">
                Disusun oleh: {PAPER_META.group}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 font-body text-[12px] text-paper/85">
                {AUTHORS.map((a, i) => (
                  <div key={a.nim} className="truncate">
                    <span className="font-code text-[10px] text-[#E8A020] mr-1">
                      {i + 1}.
                    </span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
