import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { notifyReset } from "@/lib/notify";

// POST /api/reset — hapus seluruh suara → { ok: true }
export async function POST() {
  try {
    await db.vote.deleteMany({});
    notifyReset(); // siarkan ke semua layar (fire-and-forget)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/reset] gagal mereset suara:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mereset suara" },
      { status: 500 },
    );
  }
}
