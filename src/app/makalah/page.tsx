import type { Metadata } from "next";
import Link from "next/link";
import PaperHeader from "@/components/paper/PaperHeader";
import BabOne from "@/components/paper/BabOne";
import BabTwo from "@/components/paper/BabTwo";
import BabThree from "@/components/paper/BabThree";
import {
  PAPER_META,
  TABLE_OF_CONTENTS,
  FOREWORD_PARAGRAPHS,
} from "@/data/paperContent";

export const metadata: Metadata = {
  title: "Naskah Lengkap Makalah · Kelompok 6 PDB 93",
  description:
    "Sistematika dan Struktur Anatomi Karya Tulis Ilmiah: Kajian Teoritis dan Praktis dalam Penulisan Akademik — Kelompok 6 PDB 93 Universitas Airlangga 2026.",
};

export default function MakalahPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8] antialiased">
      {/* Header Naskah & Tombol Unduh */}
      <PaperHeader />

      {/* Navigasi Daftar Isi Cepat (Sticky Sub-nav) */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0F]/90 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 overflow-x-auto text-[11px] font-code">
          <div className="flex items-center gap-1.5 shrink-0 text-mute">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020]" />
            <span className="uppercase tracking-wider">NAVIGASI BAB:</span>
          </div>

          <div className="flex items-center gap-3">
            {TABLE_OF_CONTENTS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-paper/80 transition-colors hover:text-[#E8A020]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Konten Utama Naskah */}
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-10 space-y-12">
        {/* Kata Pengantar */}
        <section
          id="pengantar"
          className="scroll-mt-20 border-b border-white/10 pb-10"
        >
          <div className="mb-6 inline-block rounded border border-[#E8A020]/30 bg-[#E8A020]/5 px-2.5 py-0.5 font-code text-[10px] uppercase tracking-widest text-[#E8A020]">
            BAGIAN AWAL · KATA PENGANTAR
          </div>

          <h2 className="font-display text-[26px] md:text-[30px] font-bold text-[#F0EDE8] mb-6">
            Kata Pengantar
          </h2>

          <div className="space-y-4 font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
            {FOREWORD_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-8 text-right font-code text-[12px] text-mute">
            <p>{PAPER_META.city}, {PAPER_META.date}</p>
            <p className="mt-4 font-bold text-[#E8A020]">Penulis</p>
          </div>
        </section>

        {/* BAB I Pendahuluan */}
        <BabOne />

        {/* BAB II Pembahasan */}
        <BabTwo />

        {/* BAB III Penutup & Daftar Pustaka */}
        <BabThree />
      </main>

      {/* Footer Naskah */}
      <footer className="border-t border-white/10 bg-[#111118] py-10 px-4 text-center font-code text-[11px] text-mute">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="tracking-widest uppercase text-paper/80">
            {PAPER_META.title}
          </p>
          <p>
            {PAPER_META.institution} · {PAPER_META.lecturer}
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="text-[#E8A020] hover:underline"
            >
              Kembali ke Layar Presentasi Utama
            </Link>
            <span>·</span>
            <a
              href={PAPER_META.downloadUrl}
              download
              className="text-[#E8A020] hover:underline"
            >
              Unduh File Dokumen Asli (.docx)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
