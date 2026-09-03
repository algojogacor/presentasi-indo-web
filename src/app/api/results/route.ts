import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getQuestion, type ResultsPayload } from "@/lib/questions";

// GET /api/results?question=1|2 → { question, total, options: [{ key, label, count }] }
// Opsi dengan nol suara tetap dikirim (zero-filled), label dari QUESTIONS.
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

    const grouped = await db.vote.groupBy({
      by: ["option"],
      where: { question: questionId },
      _count: { _all: true },
    });

    const countByOption = new Map<string, number>();
    for (const row of grouped) {
      countByOption.set(row.option, row._count._all);
    }

    const options = question.options.map((opt) => ({
      key: opt.key as string,
      label: opt.label,
      count: countByOption.get(opt.key) ?? 0,
    }));

    const payload: ResultsPayload = {
      question: questionId,
      total: options.reduce((sum, opt) => sum + opt.count, 0),
      options,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/results] gagal membaca hasil:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal membaca hasil voting" },
      { status: 500 },
    );
  }
}
