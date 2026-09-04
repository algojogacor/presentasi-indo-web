// Jembatan notifikasi server→mini-service live-notify (port 3030).
// Klien TERPERCAYA: socket.io-client dari sisi server, terhubung langsung ke
// localhost (bukan lewat gateway). Fire-and-forget: jika service mati atau
// tautan belum siap, notifikasi dilewati diam-diam — polling HTTP 3 detik di
// sisi klien tetap menutup celah (progressive enhancement).
//
// Hanya untuk kode server (route handler / instrumentation) — JANGAN diimpor
// dari komponen klien.

import { io, type Socket } from "socket.io-client";

const SERVICE_URL = "http://localhost:3030";

let sock: Socket | null = null;

function connect(): Socket | null {
  if (typeof window !== "undefined") return null; // pengaman: server-only
  if (sock) return sock;
  try {
    sock = io(SERVICE_URL, {
      path: "/",
      auth: { role: "presenter-server" },
      reconnection: true,
      reconnectionDelay: 2000,
      timeout: 3000,
      transports: ["websocket"], // server-to-server lokal — cukup websocket
    });
    // Kegagalan koneksi ditelan: reconnect berjalan otomatis di latar.
    sock.on("connect_error", () => {
      /* diam — fallback polling klien tetap hidup */
    });
  } catch {
    sock = null;
  }
  return sock;
}

/** Prewarm tautan saat server Next.js pertama menyala (instrumentation.ts). */
export function prewarm(): void {
  connect();
}

/** Umumkan satu suara baru masuk untuk pertanyaan tertentu. */
export function notifyVote(question: number, total: number): void {
  const s = connect();
  if (!s || !s.connected) return; // belum tersambung → biarkan polling klien
  try {
    s.emit("notify:vote", { question, total });
  } catch {
    /* diam */
  }
}

/** Umumkan bahwa tabel suara dikosongkan (reset demo). */
export function notifyReset(): void {
  const s = connect();
  if (!s || !s.connected) return;
  try {
    s.emit("notify:reset", {});
  } catch {
    /* diam */
  }
}
