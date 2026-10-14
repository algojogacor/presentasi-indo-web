import { describe, expect, it } from "bun:test";
import {
  sanitizeCode,
  isOptionValid,
  computePollingState,
  QUESTIONS_MAP,
} from "../../mini-services/live-notify/index";

describe("Unit: Negative Tests & Edge Cases", () => {
  describe("Sanitization & Input Boundaries", () => {
    it("menangani input non-string secara aman tanpa throw", () => {
      expect(sanitizeCode(null)).toBe("");
      expect(sanitizeCode(undefined)).toBe("");
      expect(sanitizeCode(123456)).toBe("");
      expect(sanitizeCode({})).toBe("");
      expect(sanitizeCode([])).toBe("");
      expect(sanitizeCode(true)).toBe("");
    });

    it("menangani string dengan karakter berbahaya atau script injection", () => {
      const malicious = "<script>alert(1)</script>";
      const sanitized = sanitizeCode(malicious);
      expect(sanitized).not.toContain("<");
      expect(sanitized).not.toContain(">");
      expect(sanitized).toMatch(/^[A-Z0-9-]*$/);
    });

    it("memotong string yang sangat panjang agar tidak terjadi memory exhaustion", () => {
      const hugeString = "A".repeat(10000);
      const sanitized = sanitizeCode(hugeString);
      expect(sanitized.length).toBeLessThanOrEqual(16);
    });
  });

  describe("Pertanyaan dan Opsi di Luar Batas Sah", () => {
    it("menolak nilai pertanyaan berupa bilangan pecahan atau negatif", () => {
      expect(isOptionValid(-1, "A")).toBe(false);
      expect(isOptionValid(1.5, "A")).toBe(false);
      expect(isOptionValid(NaN, "A")).toBe(false);
      expect(isOptionValid(Infinity, "A")).toBe(false);
    });

    it("menolak opsi multi-karakter atau spasi kosong", () => {
      expect(isOptionValid(1, "AB")).toBe(false);
      expect(isOptionValid(1, " ")).toBe(false);
      expect(isOptionValid(1, "   ")).toBe(false);
    });
  });

  describe("Lifecycle Transisi Langkah Polling Tidak Biasa", () => {
    it("menangani nomor step negatif atau sangat besar tanpa crash", () => {
      const neg = computePollingState(5, -1);
      expect(neg.status).toBe("inactive");
      expect(neg.questionId).toBeNull();

      const huge = computePollingState(5, 9999);
      expect(huge.status).toBe("inactive");
      expect(huge.questionId).toBeNull();
    });

    it("menangani section di luar batas 0-8", () => {
      expect(computePollingState(-1, 1).status).toBe("inactive");
      expect(computePollingState(9, 1).status).toBe("inactive");
      expect(computePollingState(100, 1).status).toBe("inactive");
    });
  });

  describe("Validasi Metadata Pertanyaan", () => {
    it("memastikan setiap pertanyaan memiliki tepat 1 kunci jawaban benar", () => {
      for (const qid of [1, 2]) {
        const q = QUESTIONS_MAP[qid];
        expect(q).toBeDefined();
        const correctCount = q.options.filter((o) => o.correct).length;
        expect(correctCount).toBe(1);
      }
    });

    it("memastikan penjelasan ilmiah (answerNote) tersedia untuk setiap pertanyaan", () => {
      for (const qid of [1, 2]) {
        const q = QUESTIONS_MAP[qid];
        expect(q.answerNote).toBeDefined();
        expect(q.answerNote.length).toBeGreaterThan(20);
      }
    });
  });
});
