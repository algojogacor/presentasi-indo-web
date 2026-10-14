import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { spawnTestGateway, type TestGateway } from "../helpers/test-gateway";
import { createTestClient, type ConnectedClient } from "../helpers/test-client";
import {
  getNextPresenterLocation,
  presenterWorkspaceReducer,
  type PresenterWorkspaceState,
} from "../../src/lib/presenterWorkspace";
import { SECTIONS } from "../../src/components/presentation/context";
import type {
  SessionCreateResponse,
  SessionJoinResponse,
  PublicSessionSnapshot,
  SessionVoteResponse,
  SessionQuestionResults,
} from "../../src/lib/syncSocket";

describe("E2E Integration: Complete Presentation & Polling Lifecycle", () => {
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

  it("Melakukan simulasi siklus lengkap presentasi, polling live, reveal, transisi, dan reconnect", async () => {
    // 1. Master membuat sesi presentasi di proyektor
    const master = await getClient();
    const createRes = await master.emitAck<SessionCreateResponse>("session:create", {});
    expect(createRes.ok).toBe(true);
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    // 2. Klien audiens memindai QR code dan bergabung
    const voterId = "voter_e2e_student_42";
    const audience = await getClient();
    const joinRes = await audience.emitAck<SessionJoinResponse>("session:join", {
      code,
      voterId,
    });
    expect(joinRes.ok).toBe(true);
    expect(joinRes.session?.stage).toBe("lobby");

    // 3. Master menekan tombol Mulai Presentasi (masuk ke Babak 0 Langkah 0)
    const syncToLivePromise = audience.waitForEvent<PublicSessionSnapshot>("session:sync");
    await master.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 0,
      step: 0,
    });
    const liveSnapshot = await syncToLivePromise;
    expect(liveSnapshot.stage).toBe("live");
    expect(liveSnapshot.section).toBe(0);
    expect(liveSnapshot.polling?.status).toBe("inactive");

    // 4. Master berpindah ke slide Babak 5 Langkah 1 (Sesi Interaktif - Pertanyaan 1 Dibuka)
    const syncToQ1Promise = audience.waitForEvent<PublicSessionSnapshot>("session:sync");
    await master.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 5,
      step: 1,
    });
    const q1Snapshot = await syncToQ1Promise;
    expect(q1Snapshot.section).toBe(5);
    expect(q1Snapshot.step).toBe(1);
    expect(q1Snapshot.polling?.status).toBe("open");
    expect(q1Snapshot.polling?.questionId).toBe(1);

    // 5. Audiens mengirimkan jawaban (Opsi C)
    const masterPollResultsPromise = master.waitForEvent<SessionQuestionResults>("session:poll_results");
    const voteRes = await audience.emitAck<SessionVoteResponse>("session:vote", {
      code,
      question: 1,
      option: "C",
      voterId,
      idempotencyKey: `idem_e2e_${code}_q1_${voterId}_C`,
    });
    expect(voteRes.ok).toBe(true);
    expect(voteRes.total).toBe(1);
    expect(voteRes.option).toBe("C");

    // Master secara instan menerima broadcast hasil polling untuk ditampilkan di layar
    const liveResults = await masterPollResultsPromise;
    expect(liveResults.question).toBe(1);
    expect(liveResults.total).toBe(1);
    expect(liveResults.options.find((o) => o.key === "C")?.count).toBe(1);

    // 6. Master memajukan slide ke Babak 5 Langkah 2 (Pembahasan / Kunci Jawaban Reveal)
    const syncToRevealPromise = audience.waitForEvent<PublicSessionSnapshot>("session:sync");
    await master.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 5,
      step: 2,
    });
    const revealSnapshot = await syncToRevealPromise;
    expect(revealSnapshot.polling?.status).toBe("closed");
    expect(revealSnapshot.polling?.questionId).toBe(1);

    // Suara baru yang dikirim setelah ditutup harus ditolak
    const lateVoteRes = await audience.emitAck<SessionVoteResponse>("session:vote", {
      code,
      question: 1,
      option: "A",
      voterId,
    });
    expect(lateVoteRes.ok).toBe(false);
    expect(lateVoteRes.error).toContain("ditutup");

    // 7. Master melanjutkan presentasi ke Babak 6 Langkah 0 (Meninggalkan Sesi Polling)
    const syncToS6Promise = audience.waitForEvent<PublicSessionSnapshot>("session:sync");
    await master.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 6,
      step: 0,
    });
    const s6Snapshot = await syncToS6Promise;
    expect(s6Snapshot.section).toBe(6);
    expect(s6Snapshot.polling?.status).toBe("inactive");
    expect(s6Snapshot.polling?.questionId).toBeNull();

    // 8. Audiens mengalami gangguan koneksi lalu reconnect ke sesi
    audience.disconnect();
    const reconnectedAudience = await getClient();
    const reconnectJoinRes = await reconnectedAudience.emitAck<SessionJoinResponse>("session:join", {
      code,
      voterId,
    });
    expect(reconnectJoinRes.ok).toBe(true);
    // State yang diterima adalah posisi terakhir presentasi (Babak 6)
    expect(reconnectJoinRes.session?.section).toBe(6);
    expect(reconnectJoinRes.session?.polling?.status).toBe("inactive");
    // Rekam jejak suara voterId pada pertanyaan 1 tetap utuh
    expect(reconnectJoinRes.myVotes?.[1]).toBe("C");

    // 9. Rekan pemateri di `/presenter` sedang mempelajari slide Babak 5 secara lokal
    let presenterLocalState: PresenterWorkspaceState = {
      section: 5,
      step: 1,
      fontSize: "base",
      mobileTab: "script",
      timerRunning: false,
      timerSeconds: 0,
    };

    // Rekan pemateri menekan Next di /presenter
    presenterLocalState = presenterWorkspaceReducer(
      presenterLocalState,
      { type: "NEXT_STEP" },
      SECTIONS,
    );
    expect(presenterLocalState.section).toBe(5);
    expect(presenterLocalState.step).toBe(2);

    // Verifikasi final: Navigasi di /presenter TIDAK mengubah live state sesi di server
    const currentServerState = gateway.instance.sessions.get(code);
    expect(currentServerState?.section).toBe(6); // Tetap di Babak 6!
    expect(currentServerState?.polling.status).toBe("inactive");
  });
});
