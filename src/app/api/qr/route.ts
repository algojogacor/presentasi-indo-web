import QRCode from "qrcode";
import { NextResponse } from "next/server";

// GET /api/qr?data=<url> → SVG QR code (amber di atas #0A0A0F)
export async function GET(request: Request) {
  const data = new URL(request.url).searchParams.get("data");

  if (!data || data.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Parameter data wajib berupa URL minimal 8 karakter" },
      { status: 400 },
    );
  }

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      margin: 2,
      width: 320,
      errorCorrectionLevel: "M",
      color: { dark: "#E8A020", light: "#0A0A0F" },
    });

    return new Response(svg, {
      status: 200,
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[api/qr] gagal membuat QR:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal membuat QR code" },
      { status: 500 },
    );
  }
}
