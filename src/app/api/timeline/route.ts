import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getQuestion } from "@/lib/questions";

// GET /api/timeline?question=1|2 → { question, total, firstAt, lastAt, span,
//   points: [{ t, c }] }
// Kurva kumulatif kedatangan suara (t = detik sejak suara pertama, c = jumlah
// kumulatif). Maksimal ± 120 titik (bucket waktu adaptif). Kontrak polling
// /api/results tidak tersentuh — endpoint ini hanya untuk grafik presenter.
export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("question") ?? "1";
    const questionId = Number.parseInt(raw, 10);
    const question = getQuestion(questionId);

    if (!question) {
      return NextResponse.json(
        { ok: false, error: "Parameter question harus bernilai 1 atau 2" },
        { status: 400 },
      );
    }

    const votes = await db.vote.findMany({
      where: { question: questionId },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (votes.length === 0) {
      return NextResponse.json({
        question: questionId,
        total: 0,
        firstAt: null,
        lastAt: null,
        span: 0,
        points: [],
      });
    }

    const first = votes[0].createdAt.getTime();
    const last = votes[votes.length - 1].createdAt.getTime();
    const span = Math.max(1, (last - first) / 1000);
    const bucket = Math.max(1, span / 120); // detik per titik

    const points: { t: number; c: number }[] = [];
    let idx = 0;
    for (let b = 0; idx < votes.length; b++) {
      const boundary = first + (b + 1) * bucket * 1000;
      while (
        idx < votes.length &&
        votes[idx].createdAt.getTime() <= boundary
      ) {
        idx++;
      }
      points.push({
        t: Math.round(((boundary - first) / 1000) * 10) / 10,
        c: idx,
      });
    }

    return NextResponse.json({
      question: questionId,
      total: votes.length,
      firstAt: votes[0].createdAt.toISOString(),
      lastAt: votes[votes.length - 1].createdAt.toISOString(),
      span: Math.round(span),
      points,
    });
  } catch (error) {
    console.error("[api/timeline] gagal membaca lini masa:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal membaca lini masa suara" },
      { status: 500 },
    );
  }
}
