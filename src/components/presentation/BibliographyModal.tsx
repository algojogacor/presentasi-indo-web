"use client";

import { useEffect, useState } from "react";
import { REFERENCES, type ReferenceType } from "@/data/bibliography";

interface BibliographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: number;
}

type FilterOption = "ALL" | "CURRENT" | "JURNAL" | "BUKU" | "REGULASI";

export default function BibliographyModal({
  isOpen,
  onClose,
  currentSection,
}: BibliographyModalProps) {
  const [filter, setFilter] = useState<FilterOption>("ALL");

  // Tutup dengan ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentActReferences = REFERENCES.filter((r) =>
    r.acts.includes(currentSection),
  );

  const filteredReferences = REFERENCES.filter((r) => {
    if (filter === "CURRENT") return r.acts.includes(currentSection);
    if (filter === "JURNAL") return r.type === "JURNAL";
    if (filter === "BUKU") return r.type === "BUKU TEKS";
    if (filter === "REGULASI")
      return r.type === "PEDOMAN RESMI" || r.type === "LEKSIKOGRAFI";
    return true;
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window (Academic Journal Typeset) */}
      <div className="relative z-10 flex flex-col w-full max-w-[90vw] md:max-w-[80vw] max-h-[88vh] rounded-xl border border-edge bg-[#0A0A0F]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header Jurnal */}
        <div className="flex items-center justify-between border-b border-edge/80 px-6 py-4 bg-[#111118]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E8A020] animate-pulse" />
              <span className="font-code text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#E8A020]">
                ARCHIVUM BIBLIOGRAPHICUM · DAFTAR RUJUKAN ILMIAH
              </span>
            </div>
            <h2 className="font-display italic text-[1.4rem] md:text-[1.8rem] text-paper mt-0.5">
              Daftar Pustaka Baku (APA Style 7th Edition)
            </h2>
            <p className="font-code text-[10px] text-mute/80 tracking-wider">
              13 Rujukan Primer & Sekunder · Kelompok 6 PDB 93 Universitas Airlangga
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded border border-edge/80 bg-surface/60 px-3 py-1.5 font-code text-xs text-mute hover:border-ember hover:text-ember transition-colors"
          >
            <span>TUTUP</span>
            <kbd className="text-[10px] bg-black/40 px-1 py-0.5 rounded border border-edge">
              ESC
            </kbd>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-white/5 bg-[#0D0D12]">
          <span className="font-code text-[10px] text-mute uppercase mr-1">
            FILTER:
          </span>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded font-code text-[10px] tracking-wider transition-all ${
              filter === "ALL"
                ? "bg-[#E8A020] text-black font-semibold shadow-[0_0_10px_rgba(232,160,32,0.3)]"
                : "border border-white/10 text-mute hover:text-paper"
            }`}
          >
            SEMUA ({REFERENCES.length})
          </button>

          {currentActReferences.length > 0 && (
            <button
              onClick={() => setFilter("CURRENT")}
              className={`px-2.5 py-1 rounded font-code text-[10px] tracking-wider transition-all ${
                filter === "CURRENT"
                  ? "bg-[#E8A020] text-black font-semibold shadow-[0_0_10px_rgba(232,160,32,0.3)]"
                  : "border border-[#E8A020]/40 text-[#E8A020] hover:bg-[#E8A020]/10"
              }`}
            >
              DIKUTIP DI ACT.0{currentSection} ({currentActReferences.length})
            </button>
          )}

          <button
            onClick={() => setFilter("JURNAL")}
            className={`px-2.5 py-1 rounded font-code text-[10px] tracking-wider transition-all ${
              filter === "JURNAL"
                ? "bg-[#E8A020] text-black font-semibold shadow-[0_0_10px_rgba(232,160,32,0.3)]"
                : "border border-white/10 text-mute hover:text-paper"
            }`}
          >
            JURNAL (4)
          </button>

          <button
            onClick={() => setFilter("BUKU")}
            className={`px-2.5 py-1 rounded font-code text-[10px] tracking-wider transition-all ${
              filter === "BUKU"
                ? "bg-[#E8A020] text-black font-semibold shadow-[0_0_10px_rgba(232,160,32,0.3)]"
                : "border border-white/10 text-mute hover:text-paper"
            }`}
          >
            BUKU TEKS (6)
          </button>

          <button
            onClick={() => setFilter("REGULASI")}
            className={`px-2.5 py-1 rounded font-code text-[10px] tracking-wider transition-all ${
              filter === "REGULASI"
                ? "bg-[#E8A020] text-black font-semibold shadow-[0_0_10px_rgba(232,160,32,0.3)]"
                : "border border-white/10 text-mute hover:text-paper"
            }`}
          >
            PEDOMAN & LEKSIKO (3)
          </button>
        </div>

        {/* Daftar 2-Kolom Berbasis Grid Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReferences.map((ref) => {
            const isContextual = ref.acts.includes(currentSection);

            return (
              <div
                key={ref.id}
                className={`relative rounded-lg border p-4 transition-all duration-300 ${
                  isContextual
                    ? "border-[#E8A020]/70 bg-[#161410]/90 shadow-[0_0_20px_rgba(232,160,32,0.12)]"
                    : "border-white/5 bg-[#111118]/60 hover:border-white/20"
                }`}
              >
                {/* Header Kartu Referensi */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-code text-[10px] font-bold ${
                        isContextual
                          ? "bg-[#E8A020] text-black"
                          : "bg-white/10 text-paper/80"
                      }`}
                    >
                      {String(ref.id).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-code text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        ref.type === "JURNAL"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                          : ref.type === "BUKU TEKS"
                            ? "border-blue-500/40 text-blue-400 bg-blue-500/5"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/5"
                      }`}
                    >
                      {ref.type}
                    </span>
                  </div>

                  {isContextual && (
                    <span className="font-code text-[9px] font-semibold text-[#E8A020] tracking-wider uppercase">
                      DIKUTIP DI ACT.0{currentSection}
                    </span>
                  )}
                </div>

                {/* Teks Sitasi APA Style dengan Hanging Indent */}
                <p className="font-body text-[13px] leading-relaxed text-paper/90 pl-3 border-l border-white/10">
                  <span className="font-semibold text-paper">{ref.authors}</span>{" "}
                  <span>({ref.year}).</span>{" "}
                  <span className="font-display italic text-[#F0EDE8] text-[15px]">
                    {ref.title}.
                  </span>{" "}
                  <span className="text-mute">{ref.source}</span>
                </p>

                {/* URL / DOI Link */}
                {(ref.doi || ref.url) && (
                  <div className="mt-2.5 pl-3 flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-[#E8A020]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <a
                      href={ref.doi ?? ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-code text-[10px] text-[#E8A020]/90 hover:underline hover:text-[#FFB740] truncate max-w-[90%]"
                    >
                      {ref.doi ?? ref.url}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between border-t border-edge/80 px-6 py-2.5 bg-[#111118]/80 font-code text-[10px] text-mute">
          <span>
            TEKAN <kbd className="text-[#E8A020] font-bold">[P]</kbd> ATAU{" "}
            <kbd className="text-[#E8A020] font-bold">[ESC]</kbd> UNTUK MENUTUP
          </span>
          <span>DOKUMEN KTI KELOMPOK 6 PDB 93</span>
        </div>
      </div>
    </div>
  );
}
