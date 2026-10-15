"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import { QUESTIONS, type PollOption } from "@/lib/questions";
import { audio } from "@/lib/audio";

interface AudienceVotingCardProps {
  sessionCode: string;
  questionId: number;
  status: "open" | "closed";
  selectedOption?: string;
  isSubmitting: boolean;
  notice: { type: "success" | "error"; msg: string } | null;
  onVote: (optionKey: string) => void;
}

export default function AudienceVotingCard({
  sessionCode,
  questionId,
  status,
  selectedOption,
  isSubmitting,
  notice,
  onVote,
}: AudienceVotingCardProps) {
  const question = useMemo(() => {
    return QUESTIONS.find((q) => q.id === questionId) ?? QUESTIONS[0];
  }, [questionId]);

  const correctOption = useMemo(() => {
    return question.options.find((o) => o.correct);
  }, [question]);

  const isUserCorrect = selectedOption && correctOption && selectedOption === correctOption.key;

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full pb-8 select-none animate-fade-in">
      {/* 1. Header Status Polling */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        {status === "open" ? (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 font-code text-[11px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase">POLLING LIVE DIBUKA</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-1 font-code text-[11px] text-[#E8A020]">
            <Clock className="w-3.5 h-3.5 text-[#E8A020]" />
            <span className="font-bold tracking-wider uppercase">VOTING DITUTUP · PEMBAHASAN</span>
          </div>
        )}

        <div className="font-code text-[11px] text-mute tracking-wider">
          PERTANYAAN 0{questionId} DARI 02
        </div>
      </div>

      {/* 2. Teks Pertanyaan Utama */}
      <div className="space-y-1.5 pt-1">
        <span className="font-code text-[10px] uppercase tracking-widest text-[#E8A020] block font-bold">
          Sesi Interaktif Kelas
        </span>
        <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-paper leading-snug">
          {question.prompt}
        </h2>
      </div>

      {/* 3. Daftar Opsi Jawaban (A, B, C, D) */}
      <div className="flex flex-col gap-2.5 pt-1">
        {question.options.map((opt: PollOption) => {
          const isSelected = selectedOption === opt.key;
          const isCorrect = opt.correct;

          // State styling
          let cardStyle = "border-white/10 bg-white/[0.03] text-paper/90 hover:bg-white/[0.08]";
          let badgeStyle = "border-white/20 bg-white/5 text-paper/80";

          if (status === "open") {
            if (isSelected) {
              cardStyle =
                "border-[#E8A020] bg-[#E8A020]/15 text-paper shadow-[0_0_20px_rgba(232,160,32,0.2)]";
              badgeStyle = "border-[#E8A020] bg-[#E8A020] text-black font-bold";
            }
          } else {
            // Closed / Reveal Mode
            if (isCorrect) {
              cardStyle =
                "border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-medium shadow-[0_0_20px_rgba(16,185,129,0.15)]";
              badgeStyle = "border-emerald-500 bg-emerald-500 text-black font-bold";
            } else if (isSelected && !isCorrect) {
              cardStyle = "border-rose-500/50 bg-rose-950/25 text-rose-200";
              badgeStyle = "border-rose-500 bg-rose-500/30 text-rose-300 font-bold";
            } else {
              cardStyle = "border-white/5 bg-transparent text-mute/60 opacity-60";
            }
          }

          return (
            <button
              key={opt.key}
              type="button"
              disabled={status !== "open" || isSubmitting}
              onClick={() => {
                audio.init();
                audio.tick();
                onVote(opt.key);
              }}
              className={`relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border text-left transition-all active:scale-[0.99] disabled:active:scale-100 ${cardStyle}`}
            >
              {/* Huruf Opsi (A, B, C, D) */}
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-code text-xs font-bold transition-all ${badgeStyle}`}
              >
                {opt.key}
              </div>

              {/* Label Teks Jawaban */}
              <div className="flex-1">
                <p className="font-body text-xs sm:text-sm leading-relaxed">{opt.label}</p>

                {/* Status Badges di dalam opsi saat Reveal */}
                {status === "closed" && isCorrect && (
                  <span className="inline-flex items-center gap-1 mt-1.5 font-code text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Kunci Jawaban Tepat
                  </span>
                )}
                {status === "closed" && isSelected && !isCorrect && (
                  <span className="inline-flex items-center gap-1 mt-1.5 font-code text-[10px] text-rose-400 uppercase tracking-wider">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    Pilihan Anda
                  </span>
                )}
                {status === "open" && isSelected && (
                  <span className="inline-flex items-center gap-1 mt-1.5 font-code text-[10px] text-[#E8A020] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-[#E8A020]" />
                    Pilihan Anda Tercatat
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Indikator Proses & Notifikasi Konfirmasi Server */}
      {isSubmitting && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-black/60 font-code text-xs text-paper/80">
          <Loader2 className="w-4 h-4 animate-spin text-[#E8A020]" />
          <span>Menyimpan jawaban Anda ke server...</span>
        </div>
      )}

      {notice && !isSubmitting && (
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-body ${
            notice.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/30 text-rose-300"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{notice.msg}</p>
            {status === "open" && notice.type === "success" && (
              <p className="text-[11px] opacity-75 mt-0.5">
                Anda masih dapat mengubah pilihan selama pemateri membuka sesi voting.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Pembahasan Rasional Ilmiah (Hanya saat status === 'closed') */}
      {status === "closed" && (
        <div className="rounded-xl border border-white/15 bg-[#12111A] p-4 sm:p-5 space-y-2.5 mt-1 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 font-code text-[11px] font-bold text-[#E8A020] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-[#E8A020]" />
              <span>Mengapa — Rasional Ilmiah</span>
            </div>
            {selectedOption && (
              <span
                className={`font-code text-[10px] font-bold uppercase tracking-wider ${
                  isUserCorrect ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isUserCorrect ? "🎉 Anda Menjawab Benar" : "💡 Evaluasi Konsep"}
              </span>
            )}
          </div>

          <p className="font-body text-xs sm:text-sm text-paper/85 leading-relaxed">
            {question.answerNote}
          </p>

          <div className="border-t border-white/10 pt-2 text-center font-code text-[10px] text-mute">
            Tetap di layar ini. Slide akan berlanjut otomatis saat pemateri berpindah babak.
          </div>
        </div>
      )}
    </div>
  );
}
