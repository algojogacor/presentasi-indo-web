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
//   - Polling Terintegrasi:
//     Section 5 Step 1: Pertanyaan 1 DIBUKA (open)
//     Section 5 Step 2: Pertanyaan 1 DITUTUP (closed, pembahasan)
//     Section 5 Step 3: Pertanyaan 2 DIBUKA (open)
//     Section 5 Step 4: Pertanyaan 2 DITUTUP (closed, pembahasan)
//     Section lainnya : Polling NONAKTIF (inactive)

import { createServer, type IncomingMessage, type ServerResponse, type Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { randomUUID } from "crypto";

export const DEFAULT_PORT = 3030;

export interface PollingState {
  status: "inactive" | "open" | "closed";
  questionId: number | null;
  step: number;
}

export interface SessionVoteRecord {
  voterId: string;
  question: number;
  option: string;
  at: number;
  idempotencyKey?: string;
}

export interface SessionQuestionResults {
  question: number;
  total: number;
  options: { key: string; label: string; count: number }[];
}

export interface PresentationSession {
  code: string;
  presenterToken: string;
  stage: "lobby" | "live" | "ended";
  section: number;
  step: number;
  revision: number;
  updatedAt: number;
  createdAt: number;
  polling: PollingState;
  votes: Map<string, SessionVoteRecord>; // key: `${question}:${voterId}`
  idempotency: Map<string, { ok: boolean; question: number; option: string; total: number }>;
}

export interface PublicSessionSnapshot {
  code: string;
  stage: "lobby" | "live" | "ended";
  section: number;
  step: number;
  revision: number;
  updatedAt: number;
  polling: PollingState;
  pollResults?: SessionQuestionResults | null;
}

export const QUESTIONS_MAP: Record<
  number,
  {
    id: number;
    prompt: string;
    options: { key: string; label: string; correct?: boolean }[];
    answerNote: string;
  }
> = {
  1: {
    id: 1,
    prompt:
      "Kalian sering membuat makalah tugas kuliah. Jika makalah tersebut ingin diterbitkan menjadi artikel jurnal ilmiah bereputasi, perubahan apa yang paling mendasar?",
    options: [
      { key: "A", label: "Mempertebal tinjauan pustaka dan menambah jumlah bab" },
      { key: "B", label: "Mengganti istilah Indonesia ke bahasa asing agar terlihat lebih teknis" },
      {
        key: "C",
        label: "Mengubahnya ke format IMRaD (tanpa bab Romawi) dan berorientasi pada novelty",
        correct: true,
      },
      { key: "D", label: "Menghapus pendahuluan dan langsung menyajikan data mentah" },
    ],
    answerNote:
      "Berdasarkan Tabel 2 makalah (Fitriani et al., 2023), artikel jurnal memadatkan struktur menjadi format IMRaD (Introduction, Methods, Results, Discussion) tanpa bab berangka Romawi dan sangat memprioritaskan keterbaruan (novelty) untuk publikasi bereputasi, berbeda dengan makalah kuliah yang menggunakan format 3 bab ringkas untuk kajian konseptual tugas.",
  },
  2: {
    id: 2,
    prompt:
      "Di antara jenis karya ilmiah berikut, mana yang memiliki aturan format administratif paling ketat dan langsung gugur jika melanggar batas halaman?",
    options: [
      { key: "A", label: "Skripsi / Tesis tugas akhir" },
      { key: "B", label: "Makalah kajian konseptual tugas kuliah" },
      { key: "C", label: "Artikel jurnal ilmiah nasional" },
      {
        key: "D",
        label: "Proposal PKM (Program Kreativitas Mahasiswa)",
        correct: true,
      },
    ],
    answerNote:
      "Berdasarkan pedoman Dikti (2023) dan Tabel 2 makalah, Proposal PKM memiliki seleksi administratif awal yang sangat ketat di Simbelmawa dengan batasan maksimal 10 halaman isi inti. Pelanggaran format atau batas halaman akan langsung menggugurkan proposal pada tahap seleksi administrasi sebelum sempat dinilai substansinya.",
  },
};

export function isOptionValid(qid: number, opt: string): boolean {
  const q = QUESTIONS_MAP[qid];
  return !!q && q.options.some((o) => o.key === opt);
}

export function computePollingState(section: number, step: number): PollingState {
  if (section === 5) {
    if (step === 1) return { status: "open", questionId: 1, step: 1 };
    if (step === 2) return { status: "closed", questionId: 1, step: 2 };
    if (step === 3) return { status: "open", questionId: 2, step: 3 };
    if (step === 4) return { status: "closed", questionId: 2, step: 4 };
  }
  return { status: "inactive", questionId: null, step };
}

export function getSessionQuestionResults(
  session: PresentationSession,
  qid: number | null,
): SessionQuestionResults | null {
  if (!qid || !QUESTIONS_MAP[qid]) return null;
  const q = QUESTIONS_MAP[qid];
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  let total = 0;

  for (const v of session.votes.values()) {
    if (v.question === qid && counts[v.option] !== undefined) {
      counts[v.option] += 1;
      total += 1;
    }
  }

  return {
    question: qid,
    total,
    options: q.options.map((opt) => ({
      key: opt.key,
      label: opt.label,
      count: counts[opt.key] ?? 0,
    })),
  };
}

export function sanitizeCode(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KTI-${suffix}`;
}

export function getPublicSnapshot(s: PresentationSession): PublicSessionSnapshot {
  return {
    code: s.code,
    stage: s.stage,
    section: s.section,
    step: s.step,
    revision: s.revision,
    updatedAt: s.updatedAt,
    polling: s.polling,
    pollResults: getSessionQuestionResults(s, s.polling.questionId),
  };
}

export interface LiveNotifyServerOptions {
  port?: number;
  forwardVoteToDb?: boolean;
}

export interface LiveNotifyServerInstance {
  httpServer: HttpServer;
  io: Server;
  sessions: Map<string, PresentationSession>;
  port: number;
  close: () => Promise<void>;
}

export function createLiveNotifyServer(
  options: LiveNotifyServerOptions = {},
): Promise<LiveNotifyServerInstance> {
  const portToListen = options.port ?? (process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT);
  const forwardVoteToDb = options.forwardVoteToDb ?? false;
  const sessions = new Map<string, PresentationSession>();

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

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, sessions: sessions.size, clients: io.engine.clientsCount }));
      return;
    }
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
    io.to(`session:${code}`).emit("session:presence", { code, audienceCount: count, at: Date.now() });
  }

  io.on("connection", (socket: Socket) => {
    const trusted = socket.handshake.auth?.role === "presenter-server";
    socket.data.trusted = trusted;

    // Sapaan koneksi awal
    socket.emit("hello", { at: Date.now(), port: portToListen });
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
        polling: { status: "inactive", questionId: null, step: 0 },
        votes: new Map(),
        idempotency: new Map(),
      };

      sessions.set(code, session);
      socket.join(`session:${code}`);
      socket.data.sessionCode = code;
      socket.data.isPresenter = true;

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
    socket.on(
      "session:join",
      (payload: { code: string; voterId?: string }, ack?: (res: unknown) => void) => {
        const code = sanitizeCode(payload?.code);
        const voterId = payload?.voterId ? String(payload.voterId).trim().slice(0, 64) : undefined;
        const session = sessions.get(code);

        if (!session || session.stage === "ended") {
          ack?.({ ok: false, error: "Sesi tidak ditemukan atau telah berakhir" });
          return;
        }

        socket.join(`session:${code}`);
        socket.data.sessionCode = code;
        socket.data.isAudience = true;

        const count = getSessionAudienceCount(code);

        // Kumpulkan suara yang pernah diberikan oleh voterId ini pada sesi ini
        const myVotes: Record<number, string> = {};
        if (voterId) {
          for (const v of session.votes.values()) {
            if (v.voterId === voterId) {
              myVotes[v.question] = v.option;
            }
          }
        }

        ack?.({
          ok: true,
          session: getPublicSnapshot(session),
          audienceCount: count,
          myVotes,
        });

        broadcastSessionPresence(code);
      },
    );

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
          expectedRevision?: number;
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
          ack?.({ ok: false, error: "Tidak memiliki hak kontrol presenter" });
          return;
        }

        // Validasi struktur & rentang nilai payload update
        if (
          payload.stage !== undefined &&
          !["lobby", "live", "ended"].includes(payload.stage)
        ) {
          ack?.({ ok: false, error: "Nilai stage tidak valid" });
          return;
        }

        if (
          payload.section !== undefined &&
          (typeof payload.section !== "number" ||
            !Number.isInteger(payload.section) ||
            payload.section < 0 ||
            payload.section > 8)
        ) {
          ack?.({ ok: false, error: "Nilai section tidak valid (harus integer 0-8)" });
          return;
        }

        if (
          payload.step !== undefined &&
          (typeof payload.step !== "number" ||
            !Number.isInteger(payload.step) ||
            payload.step < 0)
        ) {
          ack?.({ ok: false, error: "Nilai step tidak valid (harus integer >= 0)" });
          return;
        }

        // Validasi ordering: tolak update jika revision yang dikirim lebih rendah dari revision sesi
        if (
          payload.expectedRevision !== undefined &&
          payload.expectedRevision < session.revision
        ) {
          ack?.({ ok: false, error: "Revision kedaluwarsa (stale update regresi)" });
          return;
        }

        if (payload.stage) {
          session.stage = payload.stage;
        }

        if (payload.section !== undefined) {
          session.section = payload.section;
        }

        if (payload.step !== undefined) {
          session.step = payload.step;
        }

        // Hitung dan mutakhirkan siklus hidup polling
        session.polling = computePollingState(session.section, session.step);
        session.revision += 1;
        session.updatedAt = Date.now();

        const snapshot = getPublicSnapshot(session);

        // Siarkan snapshot terbaru ke semua audiens di sesi ini
        io.to(`session:${code}`).emit("session:sync", snapshot);

        // Jika slide mengarah ke polling aktif/reveal, siarkan juga agregasi suara terkini
        if (session.polling.questionId) {
          const results = getSessionQuestionResults(session, session.polling.questionId);
          if (results) {
            io.to(`session:${code}`).emit("session:poll_results", results);
          }
        }

        ack?.({ ok: true, revision: session.revision });
      },
    );

    // ========================================================
    // 5. AUDIENS: Berikan Suara (session:vote)
    // ========================================================
    socket.on(
      "session:vote",
      async (
        payload: {
          code: string;
          question: number;
          option: string;
          voterId: string;
          idempotencyKey?: string;
        },
        ack?: (res: unknown) => void,
      ) => {
        const code = sanitizeCode(payload?.code);
        const session = sessions.get(code);

        if (!session || session.stage === "ended") {
          ack?.({ ok: false, error: "Sesi tidak ditemukan atau telah berakhir" });
          return;
        }

        if (session.stage !== "live") {
          ack?.({ ok: false, error: "Presentasi belum memasuki mode live" });
          return;
        }

        const qid = Number(payload?.question);
        const option = String(payload?.option ?? "").toUpperCase().trim();
        const voterId = String(payload?.voterId ?? "").trim().slice(0, 64);
        const idempotencyKey = payload?.idempotencyKey
          ? String(payload.idempotencyKey).trim().slice(0, 128)
          : undefined;

        if (!voterId) {
          ack?.({ ok: false, error: "Identitas pemilih (voterId) diperlukan" });
          return;
        }

        // 1. Validasi status polling
        if (session.polling.status !== "open") {
          ack?.({ ok: false, error: "Voting untuk pertanyaan ini sedang ditutup oleh pemateri" });
          return;
        }

        // 2. Validasi kesesuaian pertanyaan aktif
        if (session.polling.questionId !== qid) {
          ack?.({ ok: false, error: `Pertanyaan 0${qid} sedang tidak aktif untuk voting` });
          return;
        }

        // 3. Validasi opsi jawaban sah
        if (!isOptionValid(qid, option)) {
          ack?.({ ok: false, error: `Opsi "${option}" tidak valid untuk pertanyaan ${qid}` });
          return;
        }

        // 4. Idempotency check: jika request ini hasil retry jaringan, kembalikan respon terdahulu
        if (idempotencyKey && session.idempotency.has(idempotencyKey)) {
          const cached = session.idempotency.get(idempotencyKey);
          ack?.(cached);
          return;
        }

        // 5. Catat suara unik per pemilih per pertanyaan (1 suara per peserta)
        const voteKey = `${qid}:${voterId}`;
        session.votes.set(voteKey, {
          voterId,
          question: qid,
          option,
          at: Date.now(),
          idempotencyKey,
        });

        // 6. Teruskan ke database SQLite Next.js (jika diaktifkan) untuk arsip & ekspor CSV
        if (forwardVoteToDb) {
          try {
            fetch("http://localhost:3002/api/vote", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: qid,
                option,
                sessionCode: code,
                voterId,
              }),
            }).catch(() => {});
          } catch (_) {}
        }

        // 7. Hitung agregasi hasil terkini untuk sesi ini
        const results = getSessionQuestionResults(session, qid);
        const total = results?.total ?? 0;

        const resPayload = {
          ok: true,
          question: qid,
          option,
          total,
        };

        if (idempotencyKey) {
          session.idempotency.set(idempotencyKey, resPayload);
        }

        // 8. Siarkan hasil pembaruan langsung ke ruangan sesi ini
        io.to(`session:${code}`).emit("session:poll_results", results);

        // Siarkan legacy event vote:new agar presenter hook / audio chime berbunyi
        io.emit("vote:new", { question: qid, total, at: Date.now() });

        ack?.(resPayload);
      },
    );

    // ========================================================
    // 6. PRESENTER ONLY: Reset Polling Sesi (session:poll_reset)
    // ========================================================
    socket.on(
      "session:poll_reset",
      (payload: { code: string; presenterToken: string }, ack?: (res: unknown) => void) => {
        const code = sanitizeCode(payload?.code);
        const token = payload?.presenterToken;
        const session = sessions.get(code);

        if (!session || session.presenterToken !== token) {
          ack?.({ ok: false, error: "Unauthorized" });
          return;
        }

        session.votes.clear();
        session.idempotency.clear();

        io.to(`session:${code}`).emit("session:poll_results", {
          question: session.polling.questionId ?? 1,
          total: 0,
          options: QUESTIONS_MAP[session.polling.questionId ?? 1]?.options.map((o) => ({
            key: o.key,
            label: o.label,
            count: 0,
          })) ?? [],
        });

        io.emit("votes:reset", { at: Date.now() });
        ack?.({ ok: true });
      },
    );

    // ========================================================
    // 7. PRESENTER ONLY: Akhiri Sesi (session:end)
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
        ack?.({ ok: true });
      },
    );

    // ========================================================
    // 8. BACKEND NEXT.JS (Live Polling Legacy Events)
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
        for (const s of sessions.values()) {
          s.votes.clear();
          s.idempotency.clear();
        }
        io.emit("votes:reset", { at: Date.now() });
      });
    }

    // ========================================================
    // 9. Disconnect Handler
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

  return new Promise((resolve) => {
    httpServer.listen(portToListen, () => {
      const assignedPort = (httpServer.address() as { port: number })?.port ?? portToListen;

      const close = async (): Promise<void> => {
        return new Promise((resClose) => {
          // Putus semua socket aktif terlebih dahulu
          io.disconnectSockets(true);
          io.close(() => {
            httpServer.close(() => {
              resClose();
            });
          });
        });
      };

      resolve({
        httpServer,
        io,
        sessions,
        port: assignedPort,
        close,
      });
    });
  });
}

// Jalankan otomatis jika dipanggil langsung sebagai program utama (PM2 / CLI)
const isMain =
  (typeof Bun !== "undefined" && import.meta.main) ||
  (typeof process !== "undefined" &&
    process.argv[1] &&
    (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js")));

if (isMain) {
  createLiveNotifyServer({ forwardVoteToDb: true }).then((inst) => {
    console.log(`live-notify (with audience sync & live polling) berjalan di port ${inst.port}`);
  });
}
