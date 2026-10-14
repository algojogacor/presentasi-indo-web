import { describe, expect, it } from "bun:test";
import {
  computePollingState,
  isOptionValid,
  getSessionQuestionResults,
  QUESTIONS_MAP,
  type PresentationSession,
} from "../../mini-services/live-notify/index";

describe("Unit: Polling Logic & Lifecycle", () => {
  describe("Section & Step to Polling State Mapping", () => {
    it("menghasilkan status inactive pada langkah pengantar Babak 5 (step 0)", () => {
      const state = computePollingState(5, 0);
      expect(state.status).toBe("inactive");
      expect(state.questionId).toBeNull();
    });

    it("membuka Pertanyaan 1 pada Babak 5 Langkah 1", () => {
      const state = computePollingState(5, 1);
      expect(state.status).toBe("open");
      expect(state.questionId).toBe(1);
      expect(state.step).toBe(1);
    });

    it("menutup Pertanyaan 1 untuk pembahasan/reveal pada Babak 5 Langkah 2", () => {
      const state = computePollingState(5, 2);
      expect(state.status).toBe("closed");
      expect(state.questionId).toBe(1);
      expect(state.step).toBe(2);
    });

    it("membuka Pertanyaan 2 pada Babak 5 Langkah 3", () => {
      const state = computePollingState(5, 3);
      expect(state.status).toBe("open");
      expect(state.questionId).toBe(2);
      expect(state.step).toBe(3);
    });

    it("menutup Pertanyaan 2 untuk pembahasan/reveal pada Babak 5 Langkah 4", () => {
      const state = computePollingState(5, 4);
      expect(state.status).toBe("closed");
      expect(state.questionId).toBe(2);
      expect(state.step).toBe(4);
    });

    it("menonaktifkan polling di luar Babak 5", () => {
      expect(computePollingState(0, 1).status).toBe("inactive");
      expect(computePollingState(4, 2).status).toBe("inactive");
      expect(computePollingState(6, 0).status).toBe("inactive");
      expect(computePollingState(8, 0).status).toBe("inactive");
    });
  });

  describe("Opsi Jawaban Valid & Tidak Sah", () => {
    it("memvalidasi opsi sah A, B, C, D untuk Pertanyaan 1", () => {
      expect(isOptionValid(1, "A")).toBe(true);
      expect(isOptionValid(1, "B")).toBe(true);
      expect(isOptionValid(1, "C")).toBe(true);
      expect(isOptionValid(1, "D")).toBe(true);
    });

    it("menolak opsi tidak sah atau tidak terdaftar pada Pertanyaan 1", () => {
      expect(isOptionValid(1, "E")).toBe(false);
      expect(isOptionValid(1, "Z")).toBe(false);
      expect(isOptionValid(1, "")).toBe(false);
      expect(isOptionValid(1, "1")).toBe(false);
    });

    it("menolak pertanyaan dengan ID yang tidak terdaftar", () => {
      expect(isOptionValid(0, "A")).toBe(false);
      expect(isOptionValid(3, "A")).toBe(false);
      expect(isOptionValid(99, "C")).toBe(false);
    });
  });

  describe("Agregasi Suara & Deduplikasi Per Voter", () => {
    it("menghitung agregasi suara awal dengan zero-filled untuk semua opsi", () => {
      const session: PresentationSession = {
        code: "KTI-POLL",
        presenterToken: "token",
        stage: "live",
        section: 5,
        step: 1,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: { status: "open", questionId: 1, step: 1 },
        votes: new Map(),
        idempotency: new Map(),
      };

      const res = getSessionQuestionResults(session, 1);
      expect(res).not.toBeNull();
      expect(res!.total).toBe(0);
      expect(res!.options.length).toBe(4);
      for (const opt of res!.options) {
        expect(opt.count).toBe(0);
      }
    });

    it("mencatat suara dari peserta berbeda dan menjumlahkan total", () => {
      const session: PresentationSession = {
        code: "KTI-POLL",
        presenterToken: "token",
        stage: "live",
        section: 5,
        step: 1,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: { status: "open", questionId: 1, step: 1 },
        votes: new Map(),
        idempotency: new Map(),
      };

      // Dua peserta memilih opsi C
      session.votes.set("1:voter_1", {
        voterId: "voter_1",
        question: 1,
        option: "C",
        at: 1000,
      });
      session.votes.set("1:voter_2", {
        voterId: "voter_2",
        question: 1,
        option: "C",
        at: 1001,
      });

      const res = getSessionQuestionResults(session, 1);
      expect(res!.total).toBe(2);
      expect(res!.options.find((o) => o.key === "C")?.count).toBe(2);
      expect(res!.options.find((o) => o.key === "A")?.count).toBe(0);
    });

    it("mengizinkan perubahan jawaban dari peserta yang sama tanpa menambah total (deduplikasi)", () => {
      const session: PresentationSession = {
        code: "KTI-POLL",
        presenterToken: "token",
        stage: "live",
        section: 5,
        step: 1,
        revision: 1,
        updatedAt: 1000,
        createdAt: 1000,
        polling: { status: "open", questionId: 1, step: 1 },
        votes: new Map(),
        idempotency: new Map(),
      };

      // Voter 1 memilih C
      session.votes.set("1:voter_1", {
        voterId: "voter_1",
        question: 1,
        option: "C",
        at: 1000,
      });

      let res = getSessionQuestionResults(session, 1);
      expect(res!.total).toBe(1);
      expect(res!.options.find((o) => o.key === "C")?.count).toBe(1);

      // Voter 1 mengubah pilihannya ke A
      session.votes.set("1:voter_1", {
        voterId: "voter_1",
        question: 1,
        option: "A",
        at: 1002,
      });

      res = getSessionQuestionResults(session, 1);
      expect(res!.total).toBe(1); // Total tetap 1
      expect(res!.options.find((o) => o.key === "A")?.count).toBe(1);
      expect(res!.options.find((o) => o.key === "C")?.count).toBe(0);
    });

    it("mempertahankan hasil voting saat pertanyaan ditutup (reveal)", () => {
      const session: PresentationSession = {
        code: "KTI-POLL",
        presenterToken: "token",
        stage: "live",
        section: 5,
        step: 2, // Closed / reveal
        revision: 2,
        updatedAt: 2000,
        createdAt: 1000,
        polling: { status: "closed", questionId: 1, step: 2 },
        votes: new Map(),
        idempotency: new Map(),
      };

      session.votes.set("1:voter_1", {
        voterId: "voter_1",
        question: 1,
        option: "C",
        at: 1000,
      });

      const res = getSessionQuestionResults(session, 1);
      expect(res).not.toBeNull();
      expect(res!.total).toBe(1);
      expect(res!.options.find((o) => o.key === "C")?.count).toBe(1);
    });
  });
});
