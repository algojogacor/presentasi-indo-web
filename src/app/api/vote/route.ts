import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isOptionValid } from "@/lib/questions";
import { notifyVote } from "@/lib/notify";

// POST /api/vote — body { question: 1|2, option: "A"|"B"|"C"|"D" } → { ok: true }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body JSON tidak valid" },
      { status: 400 },
    );
  }

  const { question, option } = (body ?? {}) as {
    question?: unknown;
    option?: unknown;
  };

  if (
    typeof question !== "number" ||
    !Number.isInteger(question) ||
    typeof option !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Body harus berupa { question: number, option: string }" },
      { status: 400 },
    );
  }

  if (!isOptionValid(question, option)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Pertanyaan ${question} tidak memiliki opsi "${option}"`,
      },
      { status: 400 },
    );
  }

  try {
    await db.vote.create({ data: { question, option } });
    // Siarkan instan ke mini-service (fire-and-forget; polling tetap fallback).
    try {
      const total = await db.vote.count({ where: { question } });
      notifyVote(question, total);
    } catch {
      /* notifikasi gagal — tidak mempengaruhi suara yang tersimpan */
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/vote] gagal menyimpan suara:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan suara" },
      { status: 500 },
    );
  }
}
