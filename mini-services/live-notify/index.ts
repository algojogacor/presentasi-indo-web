// LIVE-NOTIFY — mini service untuk notifikasi suara real-time.
//
// Arsitektur:
//   - Browser (layar presenter S5 + halaman voting) → socket.io via gateway:
//     io("/?XTransformPort=3030")  ← path WAJIB "/", Caddy mengandalkan ini.
//   - Backend Next.js (route /api/vote & /api/reset) → terhubung sebagai klien
//     TERPERCAYA (auth.role === "presenter-server") langsung ke
//     http://localhost:3030 (server-to-server, tidak lewat gateway), lalu
//     memancarkan event notify:vote / notify:reset → di-broadcast ke semua.
//
// Progressive enhancement: klien tetap punya fallback polling HTTP 3 detik —
// jika service ini mati, alur polling tidak terganggu.

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3030;

const httpServer = createServer();
const io = new Server(httpServer, {
  // Path wajib "/" — Caddy mengandalkan ini untuk forward.
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface VotePayload {
  question?: unknown;
  total?: unknown;
}

io.on("connection", (socket) => {
  const trusted = socket.handshake.auth?.role === "presenter-server";
  console.log(
    `[socket] ${trusted ? "SERVER" : "klien"} terhubung: ${socket.id} (total ${io.engine.clientsCount})`,
  );

  if (trusted) {
    // Hanya backend Next.js yang boleh memicu siaran.
    socket.on("notify:vote", (raw: VotePayload) => {
      const question = Number(raw?.question);
      const total = Number(raw?.total);
      if (!Number.isInteger(question) || !Number.isInteger(total)) {
        console.log("[notify] payload vote tidak valid — diabaikan");
        return;
      }
      io.emit("vote:new", { question, total, at: Date.now() });
      console.log(
        `[notify] vote  q${question} total=${total} → ${io.engine.clientsCount} klien`,
      );
    });

    socket.on("notify:reset", () => {
      io.emit("votes:reset", { at: Date.now() });
      console.log(
        `[notify] reset → ${io.engine.clientsCount} klien`,
      );
    });
  }

  // Sapaan koneksi — dipakai klien untuk memastikan tautan hidup.
  socket.emit("hello", { at: Date.now(), port: PORT });

  socket.on("disconnect", (reason) => {
    console.log(`[socket] putus: ${socket.id} (${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`live-notify berjalan di port ${PORT}`);
});
