// GET /api/export — unduh hasil polling sebagai CSV (lampiran laporan).
//
// Format: UTF-8 + BOM (agar Excel mengenali encoding), koma sebagai pemisah,
// header `content-disposition: attachment`. Dua blok:
//   1. RINGKASAN — per pertanyaan: opsi, jumlah, persentase, kunci jawaban.
//   2. DETAIL — satu baris per suara (waktu, pertanyaan, opsi).
// Diurutkan kronologis; nama file memuat tanggal untuk arsip laporan.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";

function csvCell(v: string | number): string {
  const s = String(v);
  // Kutip bila mengandung koma, kutip, atau newline — escape kutip ganda.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

export async function GET() {
  try {
    const votes = await db.vote.findMany({
      orderBy: { createdAt: "asc" },
      select: { question: true, option: true, createdAt: true },
    });

    const dateTag = new Date().toISOString().slice(0, 10);
    const lines: string[] = [];

    lines.push(row(["ANATOMI KARYA TULIS ILMIAH — HASIL LIVE POLLING"]));
    lines.push(row(["KELOMPOK 6 · PDB 93 · UNIVERSITAS AIRLANGGA · 2026"]));
    lines.push(row(["DIEKSPOR", new Date().toISOString()]));
    lines.push("");

    // ---- Blok ringkasan per pertanyaan ----
    for (const q of QUESTIONS) {
      const counts = new Map<string, number>();
      for (const o of q.options) counts.set(o.key, 0);
      let total = 0;
      for (const v of votes) {
        if (v.question !== q.id) continue;
        if (counts.has(v.option))
          counts.set(v.option, (counts.get(v.option) ?? 0) + 1);
        total += 1;
      }
      lines.push(row([`PERTANYAAN ${q.id}`, q.prompt]));
      lines.push(row(["OPSI", "LABEL", "JUMLAH", "PERSENTASE", "KUNCI"]));
      for (const o of q.options) {
        const c = counts.get(o.key) ?? 0;
        const pct = total > 0 ? Math.round((c / total) * 100) : 0;
        lines.push(row([o.key, o.label, c, `${pct}%`, o.correct ? "BENAR" : ""]));
      }
      const correctKey = q.options.find((o) => o.correct)?.key;
      const correctCount =
        correctKey !== undefined ? (counts.get(correctKey) ?? 0) : 0;
      const correctPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      lines.push(row(["TOTAL SUARA", total, `BENAR: ${correctPct}%`]));
      lines.push("");
    }

    // ---- Blok detail kronologis ----
    lines.push(row(["DETAIL SUARA (KRONOLOGIS)"]));
    lines.push(row(["NO", "WAKTU (ISO)", "PERTANYAAN", "OPSI"]));
    votes.forEach((v, i) => {
      lines.push(row([i + 1, v.createdAt.toISOString(), v.question, v.option]));
    });

    const csv = "\uFEFF" + lines.join("\r\n") + "\r\n";
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="polling-kelompok6-${dateTag}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal membaca basis data" },
      { status: 500 },
    );
  }
}
