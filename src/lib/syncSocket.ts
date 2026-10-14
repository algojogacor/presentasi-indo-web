import { io, type Socket } from "socket.io-client";

export interface PollingState {
  status: "inactive" | "open" | "closed";
  questionId: number | null;
  step: number;
}

export interface SessionQuestionResults {
  question: number;
  total: number;
  options: { key: string; label: string; count: number }[];
}

export interface PublicSessionSnapshot {
  code: string;
  stage: "lobby" | "live" | "ended";
  section: number;
  step: number;
  revision: number;
  updatedAt: number;
  polling?: PollingState;
  pollResults?: SessionQuestionResults | null;
}

export interface SessionCreateResponse {
  ok: boolean;
  session?: PublicSessionSnapshot;
  presenterToken?: string;
  audienceCount?: number;
  error?: string;
}

export interface SessionJoinResponse {
  ok: boolean;
  session?: PublicSessionSnapshot;
  audienceCount?: number;
  myVotes?: Record<number, string>;
  error?: string;
}

export interface SessionVoteResponse {
  ok: boolean;
  question?: number;
  option?: string;
  total?: number;
  error?: string;
}

let syncSocketInstance: Socket | null = null;

export function getSyncSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getSyncSocket must be called in the browser");
  }

  if (!syncSocketInstance) {
    syncSocketInstance = io("/?XTransformPort=3030", {
      path: "/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
  }

  return syncSocketInstance;
}

/** Presenter: Inisialisasi atau resume sesi dari storage */
export async function initPresenterSession(
  storedCode?: string | null,
  storedToken?: string | null,
): Promise<SessionCreateResponse> {
  const socket = getSyncSocket();

  return new Promise((resolve) => {
    const tryResumeOrCreate = () => {
      if (storedCode && storedToken) {
        socket.emit(
          "session:resume",
          { code: storedCode, presenterToken: storedToken },
          (res: SessionCreateResponse) => {
            if (res?.ok) {
              resolve(res);
              return;
            }
            // Token kadaluarsa atau sesi hilang, buat sesi baru
            socket.emit("session:create", {}, (newRes: SessionCreateResponse) => {
              resolve(newRes);
            });
          },
        );
      } else {
        socket.emit("session:create", {}, (res: SessionCreateResponse) => {
          resolve(res);
        });
      }
    };

    if (socket.connected) {
      tryResumeOrCreate();
    } else {
      socket.once("connect", tryResumeOrCreate);
      // Timeout fallback jika socket lambat tersambung
      setTimeout(() => {
        if (!socket.connected) {
          resolve({ ok: false, error: "Koneksi ke gateway sinkronisasi timeout" });
        }
      }, 7000);
    }
  });
}

/** Audiens: Bergabung ke sesi presentasi dengan kode dan identitas pemilih */
export async function joinAudienceSession(
  code: string,
  voterId?: string,
): Promise<SessionJoinResponse> {
  const socket = getSyncSocket();

  return new Promise((resolve) => {
    const doJoin = () => {
      socket.emit("session:join", { code, voterId }, (res: SessionJoinResponse) => {
        resolve(res);
      });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once("connect", doJoin);
      setTimeout(() => {
        if (!socket.connected) {
          resolve({ ok: false, error: "Koneksi ke server presentasi timeout" });
        }
      }, 8000);
    }
  });
}

/** Presenter: Siarkan pembaruan state slide ke seluruh audiens */
export function sendPresenterUpdate(
  code: string,
  presenterToken: string,
  state: {
    stage?: "lobby" | "live" | "ended";
    section?: number;
    step?: number;
  },
): Promise<{ ok: boolean; revision?: number; error?: string }> {
  const socket = getSyncSocket();
  return new Promise((resolve) => {
    socket.emit(
      "session:update",
      { code, presenterToken, ...state },
      (res: { ok: boolean; revision?: number; error?: string }) => {
        resolve(res);
      },
    );
  });
}

/** Audiens: Berikan suara pada polling pertanyaan aktif */
export function sendAudienceVote(
  code: string,
  question: number,
  option: string,
  voterId: string,
  idempotencyKey?: string,
): Promise<SessionVoteResponse> {
  const socket = getSyncSocket();
  return new Promise((resolve) => {
    socket.emit(
      "session:vote",
      { code, question, option, voterId, idempotencyKey },
      (res: SessionVoteResponse) => {
        resolve(res);
      },
    );
  });
}
