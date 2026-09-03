import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// POST /api/reset — hapus seluruh suara → { ok: true }
export async function POST() {
  try {
    await db.vote.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/reset] gagal mereset suara:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mereset suara" },
      { status: 500 },
    );
  }
}
