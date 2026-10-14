import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { POST as voteHandler } from "../../src/app/api/vote/route";
import { GET as resultsHandler } from "../../src/app/api/results/route";
import { spawnTestGateway, type TestGateway } from "../helpers/test-gateway";
import { createTestClient, type ConnectedClient } from "../helpers/test-client";
import type {
  SessionCreateResponse,
  SessionVoteResponse,
  SessionQuestionResults,
} from "../../src/lib/syncSocket";

describe("Integration: Voting Engine & API Contracts", () => {
  describe("HTTP REST API Endpoints (/api/vote & /api/results)", () => {
    it("POST /api/vote menolak body non-JSON atau kosong dengan HTTP 400", async () => {
      const req = new Request("http://localhost:3000/api/vote", {
        method: "POST",
        body: "bukan json valid",
        headers: { "Content-Type": "application/json" },
      });
      const res = await voteHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.error).toContain("JSON");
    });

    it("POST /api/vote menolak payload tanpa question atau option yang sah", async () => {
      const req1 = new Request("http://localhost:3000/api/vote", {
        method: "POST",
        body: JSON.stringify({ question: "satu", option: "A" }),
        headers: { "Content-Type": "application/json" },
      });
      const res1 = await voteHandler(req1);
      expect(res1.status).toBe(400);

      const req2 = new Request("http://localhost:3000/api/vote", {
        method: "POST",
        body: JSON.stringify({ question: 1, option: 123 }),
        headers: { "Content-Type": "application/json" },
      });
      const res2 = await voteHandler(req2);
      expect(res2.status).toBe(400);
    });

    it("POST /api/vote menolak opsi jawaban yang tidak terdaftar (misal: 'Z')", async () => {
      const req = new Request("http://localhost:3000/api/vote", {
        method: "POST",
        body: JSON.stringify({ question: 1, option: "Z" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await voteHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.error).toContain('tidak memiliki opsi "Z"');
    });

    it("GET /api/results menolak question di luar daftar (bukan 1 atau 2)", async () => {
      const req = new Request("http://localhost:3000/api/results?question=99");
      const res = await resultsHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.error).toContain("harus bernilai 1 atau 2");
    });

    it("GET /api/results mengembalikan struktur standar dengan semua opsi zero-filled", async () => {
      const req = new Request("http://localhost:3000/api/results?question=1");
      const res = await resultsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.question).toBe(1);
      expect(typeof json.total).toBe("number");
      expect(Array.isArray(json.options)).toBe(true);
      expect(json.options.length).toBe(4);
      expect(json.options.map((o: any) => o.key)).toEqual(["A", "B", "C", "D"]);
    });
  });

  describe("Gateway Real-Time Voting (session:vote)", () => {
    let gateway: TestGateway;
    const clientsToClean: ConnectedClient[] = [];

    beforeAll(async () => {
      gateway = await spawnTestGateway();
    });

    afterAll(async () => {
      for (const c of clientsToClean) {
        c.disconnect();
      }
      await gateway.close();
    });

    const getClient = async () => {
      const c = await createTestClient(gateway.url);
      clientsToClean.push(c);
      return c;
    };

    it("Menolak voting ketika polling sedang ditutup (closed)", async () => {
      const pres = await getClient();
      const createRes = await pres.emitAck<SessionCreateResponse>("session:create", {});
      const code = createRes.session!.code;
      const token = createRes.presenterToken!;

      // Masuk ke Section 5 Step 2 (Closed / Reveal)
      await pres.emitAck("session:update", {
        code,
        presenterToken: token,
        stage: "live",
        section: 5,
        step: 2,
      });

      const aud = await getClient();
      await aud.emitAck("session:join", { code, voterId: "voter_closed" });

      const voteRes = await aud.emitAck<SessionVoteResponse>("session:vote", {
        code,
        question: 1,
        option: "C",
        voterId: "voter_closed",
      });

      expect(voteRes.ok).toBe(false);
      expect(voteRes.error).toContain("ditutup");
    });

    it("Menolak voting tanpa identitas pemilih (voterId)", async () => {
      const pres = await getClient();
      const createRes = await pres.emitAck<SessionCreateResponse>("session:create", {});
      const code = createRes.session!.code;
      const token = createRes.presenterToken!;

      // Buka Q1 (Section 5 Step 1)
      await pres.emitAck("session:update", {
        code,
        presenterToken: token,
        stage: "live",
        section: 5,
        step: 1,
      });

      const aud = await getClient();
      await aud.emitAck("session:join", { code });

      const voteRes = await aud.emitAck<SessionVoteResponse>("session:vote", {
        code,
        question: 1,
        option: "C",
        voterId: "", // kosong
      });

      expect(voteRes.ok).toBe(false);
      expect(voteRes.error).toContain("voterId");
    });

    it("Menerima suara valid saat polling terbuka dan menyiarkan hasil real-time", async () => {
      const pres = await getClient();
      const createRes = await pres.emitAck<SessionCreateResponse>("session:create", {});
      const code = createRes.session!.code;
      const token = createRes.presenterToken!;

      await pres.emitAck("session:update", {
        code,
        presenterToken: token,
        stage: "live",
        section: 5,
        step: 1, // Q1 Open
      });

      const aud = await getClient();
      await aud.emitAck("session:join", { code, voterId: "voter_live_1" });

      const resultsPromise = pres.waitForEvent<SessionQuestionResults>("session:poll_results");

      const voteRes = await aud.emitAck<SessionVoteResponse>("session:vote", {
        code,
        question: 1,
        option: "C",
        voterId: "voter_live_1",
        idempotencyKey: "idem_key_live_1",
      });

      expect(voteRes.ok).toBe(true);
      expect(voteRes.total).toBe(1);
      expect(voteRes.option).toBe("C");

      const broadcastResults = await resultsPromise;
      expect(broadcastResults.question).toBe(1);
      expect(broadcastResults.total).toBe(1);
      expect(broadcastResults.options.find((o) => o.key === "C")?.count).toBe(1);
    });

    it("Menangani idempotensi: retry request dengan key yang sama tidak menggandakan suara", async () => {
      const pres = await getClient();
      const createRes = await pres.emitAck<SessionCreateResponse>("session:create", {});
      const code = createRes.session!.code;
      const token = createRes.presenterToken!;

      await pres.emitAck("session:update", {
        code,
        presenterToken: token,
        stage: "live",
        section: 5,
        step: 1,
      });

      const aud = await getClient();
      await aud.emitAck("session:join", { code, voterId: "voter_idem" });

      const vote1 = await aud.emitAck<SessionVoteResponse>("session:vote", {
        code,
        question: 1,
        option: "C",
        voterId: "voter_idem",
        idempotencyKey: "idempotent_network_retry_key",
      });
      expect(vote1.ok).toBe(true);
      expect(vote1.total).toBe(1);

      // Pengiriman ulang akibat timeout jaringan simulasi
      const voteRetry = await aud.emitAck<SessionVoteResponse>("session:vote", {
        code,
        question: 1,
        option: "C",
        voterId: "voter_idem",
        idempotencyKey: "idempotent_network_retry_key",
      });
      expect(voteRetry.ok).toBe(true);
      expect(voteRetry.total).toBe(1); // Tetap 1, tidak menjadi 2!
    });

    it("Mengisolasi suara antara dua sesi berbeda (suara Sesi A tidak bocor ke Sesi B)", async () => {
      const presA = await getClient();
      const resA = await presA.emitAck<SessionCreateResponse>("session:create", {});
      const codeA = resA.session!.code;
      const tokenA = resA.presenterToken!;

      const presB = await getClient();
      const resB = await presB.emitAck<SessionCreateResponse>("session:create", {});
      const codeB = resB.session!.code;
      const tokenB = resB.presenterToken!;

      // Kedua sesi masuk ke Q1 Open
      await presA.emitAck("session:update", {
        code: codeA,
        presenterToken: tokenA,
        stage: "live",
        section: 5,
        step: 1,
      });
      await presB.emitAck("session:update", {
        code: codeB,
        presenterToken: tokenB,
        stage: "live",
        section: 5,
        step: 1,
      });

      const audA = await getClient();
      await audA.emitAck("session:join", { code: codeA, voterId: "voter_sesi_a" });

      // Berikan suara di Sesi A
      const voteA = await audA.emitAck<SessionVoteResponse>("session:vote", {
        code: codeA,
        question: 1,
        option: "C",
        voterId: "voter_sesi_a",
      });
      expect(voteA.total).toBe(1);

      // Periksa state Sesi B: harus tetap 0 suara!
      const snapB = gateway.instance.sessions.get(codeB);
      expect(snapB?.votes.size).toBe(0);
    });
  });
});
