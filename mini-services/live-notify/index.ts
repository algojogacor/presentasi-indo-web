// LIVE-NOTIFY — mini service untuk notifikasi suara & sinkronisasi presentasi real-time.
//
// Arsitektur:
//   - Browser (layar presenter `/` + audience `/audience/[code]` + voting) → socket.io via gateway:
//     io("/?XTransformPort=3030")  ← path WAJIB "/", Caddy/Nginx mengandalkan ini.
//   - Backend Next.js (route /api/vote & /api/reset) → terhubung sebagai klien
//     TERPERCAYA (auth.role === "presenter-server") langsung ke
//     http://localhost:3030 (server-to-server, tidak lewat gateway).
//   - Sesi Presentasi:
//     Presenter membuat sesi (`session:create`), memegang `presenterToken` rahasia.
//     Audiens bergabung (`session:join`) hanya dengan `sessionCode` publik.
//     Perubahan slide diverifikasi dengan `presenterToken` dan disiarkan via room `session:${code}`.

import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { Server, type Socket } from "socket.io";
import { randomUUID } from "crypto";

const PORT = 3030;

export interface PresentationSession {
  code: string;
  presenterToken: string;
  stage: "lobby" | "live" | "ended";
  section: number;
  step: number;
  revision: number;
  updatedAt: number;
  createdAt: number;
}

export interface PublicSessionSnapshot {
  code: string;
  stage: "lobby" | "live" | "ended";
  section: number;
  step: number;
  revision: number;
  updatedAt: number;
}

const sessions = new Map<string, PresentationSession>();

function sanitizeCode(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KTI-${suffix}`;
}

function getPublicSnapshot(s: PresentationSession): PublicSessionSnapshot {
  return {
    code: s.code,
    stage: s.stage,
    section: s.section,
    step: s.step,
    revision: s.revision,
    updatedAt: s.updatedAt,
  };
}

// HTTP Server dengan endpoint info & health
const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === "/api/session-info") {
    const code = sanitizeCode(url.searchParams.get("code"));
    const session = sessions.get(code);
    if (!session || session.stage === "ended") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Sesi tidak ditemukan atau telah berakhir" }));
      return;
    }
    const count = getSessionAudienceCount(code);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, session: getPublicSnapshot(session), audienceCount: count }));
    return;
  }

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, sessions: sessions.size, clients: io.engine.clientsCount }));
    return;
  }

  // Default fallback
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("live-notify server running");
});

const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface VotePayload {
  question?: unknown;
  total?: unknown;
}

function audienceCount(): number {
  let n = 0;
  for (const s of io.sockets.sockets.values()) {
    if (s.data?.trusted !== true) n += 1;
  }
  return n;
}

function getSessionAudienceCount(code: string): number {
  let n = 0;
  const room = io.sockets.adapter.rooms.get(`session:${code}`);
  if (!room) return 0;
  for (const sid of room) {
    const s = io.sockets.sockets.get(sid);
    if (s && s.data?.isAudience) n += 1;
  }
  return n;
}

function broadcastPresence(): void {
  const count = audienceCount();
  io.emit("presence", { count, at: Date.now() });
}

function broadcastSessionPresence(code: string): void {
  const count = getSessionAudienceCount(code);
  io.to(`session:${code}`).emit("session:presence", { code, count, at: Date.now() });
  console.log(`[session:${code}] presence: ${count} audiens`);
}

io.on("connection", (socket: Socket) => {
  const trusted = socket.handshake.auth?.role === "presenter-server";
  socket.data.trusted = trusted;

  // Sapaan koneksi awal
  socket.emit("hello", { at: Date.now(), port: PORT });
  socket.emit("presence", { count: audienceCount(), at: Date.now() });
  broadcastPresence();

  // ========================================================
  // 1. PRESENTER: Buat Sesi Baru (session:create)
  // ========================================================
  socket.on("session:create", (payload: { code?: string }, ack?: (res: unknown) => void) => {
    let code = sanitizeCode(payload?.code);
    if (!code || sessions.has(code)) {
      code = generateCode();
      while (sessions.has(code)) {
        code = generateCode();
      }
    }

    const presenterToken = randomUUID();
    const session: PresentationSession = {
      code,
      presenterToken,
      stage: "lobby",
      section: 0,
      step: 0,
      revision: 1,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    sessions.set(code, session);
    socket.join(`session:${code}`);
    socket.data.sessionCode = code;
    socket.data.isPresenter = true;

    console.log(`[session] Sesi dibuat: ${code} (token: ${presenterToken.slice(0, 8)}...)`);

    ack?.({
      ok: true,
      session: getPublicSnapshot(session),
      presenterToken,
      audienceCount: 0,
    });
  });

  // ========================================================
  // 2. PRESENTER: Lanjutkan Sesi Tersimpan (session:resume)
  // ========================================================
  socket.on(
    "session:resume",
    (payload: { code: string; presenterToken: string }, ack?: (res: unknown) => void) => {
      const code = sanitizeCode(payload?.code);
      const token = payload?.presenterToken;
      const session = sessions.get(code);

      if (!session || session.presenterToken !== token) {
        ack?.({ ok: false, error: "Sesi tidak valid atau token presenter salah" });
        return;
      }

      socket.join(`session:${code}`);
      socket.data.sessionCode = code;
      socket.data.isPresenter = true;

      const audienceCount = getSessionAudienceCount(code);
      console.log(`[session] Sesi dilanjutkan presenter: ${code}`);

      ack?.({
        ok: true,
        session: getPublicSnapshot(session),
        presenterToken: token,
        audienceCount,
      });

      broadcastSessionPresence(code);
    },
  );

  // ========================================================
  // 3. AUDIENS: Bergabung ke Sesi (session:join)
  // ========================================================
  socket.on("session:join", (payload: { code: string }, ack?: (res: unknown) => void) => {
    const code = sanitizeCode(payload?.code);
    const session = sessions.get(code);

    if (!session || session.stage === "ended") {
      ack?.({ ok: false, error: "Sesi tidak ditemukan atau telah berakhir" });
      return;
    }

    socket.join(`session:${code}`);
    socket.data.sessionCode = code;
    socket.data.isAudience = true;

    const count = getSessionAudienceCount(code);
    console.log(`[session] Audiens bergabung ke ${code} (total ${count})`);

    ack?.({
      ok: true,
      session: getPublicSnapshot(session),
      audienceCount: count,
    });

    broadcastSessionPresence(code);
  });

  // ========================================================
  // 4. PRESENTER ONLY: Update State Slide (session:update)
  // ========================================================
  socket.on(
    "session:update",
    (
      payload: {
        code: string;
        presenterToken: string;
        stage?: "lobby" | "live" | "ended";
        section?: number;
        step?: number;
      },
      ack?: (res: unknown) => void,
    ) => {
      const code = sanitizeCode(payload?.code);
      const token = payload?.presenterToken;
      const session = sessions.get(code);

      if (!session) {
        ack?.({ ok: false, error: "Sesi tidak ditemukan" });
        return;
      }

      if (session.presenterToken !== token) {
        console.warn(`[session] Ditolak: update tidak sah untuk ${code}`);
        ack?.({ ok: false, error: "Tidak memiliki hak kontrol presenter" });
        return;
      }

      if (payload.stage && ["lobby", "live", "ended"].includes(payload.stage)) {
        session.stage = payload.stage;
      }

      if (typeof payload.section === "number" && payload.section >= 0 && payload.section <= 8) {
        session.section = payload.section;
      }

      if (typeof payload.step === "number" && payload.step >= 0) {
        session.step = payload.step;
      }

      session.revision += 1;
      session.updatedAt = Date.now();

      const snapshot = getPublicSnapshot(session);

      // Siarkan snapshot terbaru ke semua audiens di sesi ini
      io.to(`session:${code}`).emit("session:sync", snapshot);

      ack?.({ ok: true, revision: session.revision });
    },
  );

  // ========================================================
  // 5. PRESENTER ONLY: Akhiri Sesi (session:end)
  // ========================================================
  socket.on(
    "session:end",
    (payload: { code: string; presenterToken: string }, ack?: (res: unknown) => void) => {
      const code = sanitizeCode(payload?.code);
      const token = payload?.presenterToken;
      const session = sessions.get(code);

      if (!session || session.presenterToken !== token) {
        ack?.({ ok: false, error: "Unauthorized" });
        return;
      }

      session.stage = "ended";
      session.revision += 1;
      session.updatedAt = Date.now();

      io.to(`session:${code}`).emit("session:ended", { code, at: Date.now() });
      console.log(`[session] Sesi berakhir: ${code}`);

      ack?.({ ok: true });
    },
  );

  // ========================================================
  // 6. BACKEND NEXT.JS (Live Polling Legacy Events)
  // ========================================================
  if (trusted) {
    socket.on("notify:vote", (raw: VotePayload) => {
      const question = Number(raw?.question);
      const total = Number(raw?.total);
      if (!Number.isInteger(question) || !Number.isInteger(total)) {
        return;
      }
      io.emit("vote:new", { question, total, at: Date.now() });
    });

    socket.on("notify:reset", () => {
      io.emit("votes:reset", { at: Date.now() });
    });
  }

  // ========================================================
  // 7. Disconnect Handler
  // ========================================================
  socket.on("disconnect", () => {
    const code = socket.data?.sessionCode;
    const isAudience = socket.data?.isAudience;

    if (code && isAudience) {
      setTimeout(() => {
        broadcastSessionPresence(code);
      }, 50);
    }

    setTimeout(broadcastPresence, 50);
  });
});

httpServer.listen(PORT, () => {
  console.log(`live-notify (with audience sync) berjalan di port ${PORT}`);
});
