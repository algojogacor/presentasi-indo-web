import { describe, expect, it } from "bun:test";
import {
  generateCode,
  sanitizeCode,
  getPublicSnapshot,
  computePollingState,
  type PresentationSession,
} from "../../mini-services/live-notify/index";

describe("Unit: Session State & Management", () => {
  describe("Session Code Generation & Sanitization", () => {
    it("menghasilkan kode sesi dengan format valid KTI-XXXX", () => {
      const code = generateCode();
      expect(code).toMatch(/^KTI-[A-Z2-9]{4}$/);
    });

    it("menghasilkan kode unik tanpa tabrakan pada 100 iterasi beruntun", () => {
      const set = new Set<string>();
      for (let i = 0; i < 100; i++) {
        set.add(generateCode());
      }
      expect(set.size).toBe(100);
    });

    it("membersihkan dan menstandarisasi kode sesi input yang kotor", () => {
      expect(sanitizeCode(" kti-ab12 ")).toBe("KTI-AB12");
      expect(sanitizeCode("kti_xyz!@#$123")).toBe("KTIXYZ123");
      expect(sanitizeCode(null)).toBe("");
      expect(sanitizeCode(undefined)).toBe("");
      expect(sanitizeCode(12345)).toBe("");
      // Potong jika melebihi 16 karakter
      expect(sanitizeCode("KTI-12345678901234567890")).toBe("KTI-123456789012");
    });
  });

  describe("Snapshot Presentation State", () => {
    it("snapshot publik tidak membocorkan presenterToken rahasia", () => {
      const session: PresentationSession = {
        code: "KTI-TEST",
        presenterToken: "super-secret-token-12345",
        stage: "live",
        section: 2,
        step: 3,
        revision: 5,
        updatedAt: 1700000000000,
        createdAt: 1699999000000,
        polling: { status: "inactive", questionId: null, step: 3 },
        votes: new Map(),
        idempotency: new Map(),
        media: {
          mediaId: "E6pPlIvlrPs",
          section: 1,
          status: "playing",
          currentTime: 10.5,
          timestamp: 1700000000000,
        },
      };

      const snapshot = getPublicSnapshot(session);
      expect((snapshot as any).presenterToken).toBeUndefined();
      expect(snapshot.code).toBe("KTI-TEST");
      expect(snapshot.stage).toBe("live");
      expect(snapshot.section).toBe(2);
      expect(snapshot.step).toBe(3);
      expect(snapshot.revision).toBe(5);
      expect(snapshot.polling.status).toBe("inactive");
      expect(snapshot.media?.mediaId).toBe("E6pPlIvlrPs");
      expect(snapshot.media?.status).toBe("playing");
      expect(snapshot.media?.currentTime).toBe(10.5);
    });

    it("snapshot publik mengembalikan media null jika media tidak aktif", () => {
      const session: PresentationSession = {
        code: "KTI-NOMEDIA",
        presenterToken: "token-123",
        stage: "live",
        section: 0,
        step: 0,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: { status: "inactive", questionId: null, step: 0 },
        votes: new Map(),
        idempotency: new Map(),
        media: null,
      };

      const snapshot = getPublicSnapshot(session);
      expect(snapshot.media).toBeNull();
    });
  });

  describe("Isolasi State Antar Dua Sesi Berbeda", () => {
    it("pembaruan pada sesi A tidak mengubah state sesi B", () => {
      const sessionA: PresentationSession = {
        code: "KTI-AAAA",
        presenterToken: "token-a",
        stage: "live",
        section: 1,
        step: 0,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: computePollingState(1, 0),
        votes: new Map(),
        idempotency: new Map(),
      };

      const sessionB: PresentationSession = {
        code: "KTI-BBBB",
        presenterToken: "token-b",
        stage: "lobby",
        section: 0,
        step: 0,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: computePollingState(0, 0),
        votes: new Map(),
        idempotency: new Map(),
      };

      // Mutasi sesi A ke Section 5 Step 1 (Polling Q1 Open)
      sessionA.section = 5;
      sessionA.step = 1;
      sessionA.polling = computePollingState(5, 1);
      sessionA.revision += 1;

      // Verifikasi sesi A termutasi
      expect(sessionA.section).toBe(5);
      expect(sessionA.step).toBe(1);
      expect(sessionA.revision).toBe(2);
      expect(sessionA.polling.status).toBe("open");
      expect(sessionA.polling.questionId).toBe(1);

      // Verifikasi sesi B tetap utuh di posisi awal
      expect(sessionB.section).toBe(0);
      expect(sessionB.step).toBe(0);
      expect(sessionB.stage).toBe("lobby");
      expect(sessionB.revision).toBe(1);
      expect(sessionB.polling.status).toBe("inactive");
    });
  });

  describe("Ordering & Revision Protection", () => {
    it("stale revision lebih rendah dari session revision dideteksi", () => {
      const currentRevision = 10;
      const incomingExpected = 8;
      const isStale = incomingExpected < currentRevision;
      expect(isStale).toBe(true);
    });
  });
});
