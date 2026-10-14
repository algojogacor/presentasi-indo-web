import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { spawnTestGateway, type TestGateway } from "../helpers/test-gateway";
import { createTestClient, type ConnectedClient } from "../helpers/test-client";
import type {
  SessionCreateResponse,
  SessionJoinResponse,
  PublicSessionSnapshot,
} from "../../src/lib/syncSocket";

describe("Integration: Socket.IO Gateway Protocols", () => {
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

  const getClient = async (auth?: Record<string, unknown>) => {
    const c = await createTestClient(gateway.url, auth);
    clientsToClean.push(c);
    return c;
  };

  it("Presenter membuat sesi baru dan memperoleh token rahasia", async () => {
    const presenter = await getClient();
    const res = await presenter.emitAck<SessionCreateResponse>("session:create", {});

    expect(res.ok).toBe(true);
    expect(res.session).toBeDefined();
    expect(res.session?.code).toMatch(/^KTI-[A-Z2-9]{4}$/);
    expect(res.session?.stage).toBe("lobby");
    expect(res.presenterToken).toBeDefined();
    expect(res.presenterToken?.length).toBeGreaterThan(10);
  });

  it("Audiens bergabung dengan kode valid dan menerima snapshot state", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;

    const audience = await getClient();
    const joinRes = await audience.emitAck<SessionJoinResponse>("session:join", {
      code,
      voterId: "voter_aud_1",
    });

    expect(joinRes.ok).toBe(true);
    expect(joinRes.session?.code).toBe(code);
    expect(joinRes.session?.stage).toBe("lobby");
    expect(joinRes.audienceCount).toBe(1);
    expect(joinRes.myVotes).toBeDefined();
  });

  it("Audiens mencoba bergabung dengan kode salah ditolak", async () => {
    const audience = await getClient();
    const joinRes = await audience.emitAck<SessionJoinResponse>("session:join", {
      code: "KTI-NONEXISTENT",
    });

    expect(joinRes.ok).toBe(false);
    expect(joinRes.error).toContain("tidak ditemukan");
  });

  it("Presenter mengirim update live yang sah dan disiarkan ke audiens", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    const audience = await getClient();
    await audience.emitAck("session:join", { code });

    // Siapkan promise penangkap event session:sync di audiens
    const syncPromise = audience.waitForEvent<PublicSessionSnapshot>("session:sync");

    // Presenter memajukan presentasi ke Section 1, Step 0
    const updateRes = await presenter.emitAck<{ ok: boolean; revision: number }>(
      "session:update",
      {
        code,
        presenterToken: token,
        stage: "live",
        section: 1,
        step: 0,
      },
    );

    expect(updateRes.ok).toBe(true);

    const receivedSync = await syncPromise;
    expect(receivedSync.code).toBe(code);
    expect(receivedSync.stage).toBe("live");
    expect(receivedSync.section).toBe(1);
    expect(receivedSync.step).toBe(0);
  });

  it("Klien baru bergabung terlambat langsung menerima snapshot paling mutakhir", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    // Presenter memajukan ke Section 3 Step 2
    await presenter.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 3,
      step: 2,
    });

    // Klien baru bergabung
    const lateAudience = await getClient();
    const joinRes = await lateAudience.emitAck<SessionJoinResponse>("session:join", { code });

    expect(joinRes.ok).toBe(true);
    expect(joinRes.session?.section).toBe(3);
    expect(joinRes.session?.step).toBe(2);
  });

  it("Presenter mengirim token salah ditolak hak kontrolnya", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;

    const fakePresenter = await getClient();
    const res = await fakePresenter.emitAck<{ ok: boolean; error: string }>(
      "session:update",
      {
        code,
        presenterToken: "token-palsu-ngawur",
        section: 2,
      },
    );

    expect(res.ok).toBe(false);
    expect(res.error).toContain("hak kontrol");
  });

  it("Audiens tanpa presenter token tidak dapat mengubah live state", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;

    const audience = await getClient();
    await audience.emitAck("session:join", { code });

    // Audiens mencoba emit session:update tanpa token
    const res = await audience.emitAck<{ ok: boolean; error: string }>("session:update", {
      code,
      presenterToken: "",
      section: 4,
    });

    expect(res.ok).toBe(false);
  });

  it("Dua sesi berbeda terisolasi dan tidak saling bocor event", async () => {
    const presA = await getClient();
    const resA = await presA.emitAck<SessionCreateResponse>("session:create", {});
    const codeA = resA.session!.code;
    const tokenA = resA.presenterToken!;

    const presB = await getClient();
    const resB = await presB.emitAck<SessionCreateResponse>("session:create", {});
    const codeB = resB.session!.code;

    const audA = await getClient();
    await audA.emitAck("session:join", { code: codeA });

    const audB = await getClient();
    await audB.emitAck("session:join", { code: codeB });

    let audBReceivedEvent = false;
    audB.socket.on("session:sync", (snap) => {
      if (snap.code === codeA) {
        audBReceivedEvent = true;
      }
    });

    // Update Sesi A
    await presA.emitAck("session:update", {
      code: codeA,
      presenterToken: tokenA,
      section: 2,
    });

    await new Promise((r) => setTimeout(r, 200));
    expect(audBReceivedEvent).toBe(false);
  });

  it("Payload update dengan rentang section atau step tidak valid ditolak tanpa merusak state", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    // Section 99 di luar rentang 0-8
    const invalidRes = await presenter.emitAck<{ ok: boolean; error: string }>(
      "session:update",
      {
        code,
        presenterToken: token,
        section: 99,
      },
    );

    expect(invalidRes.ok).toBe(false);
    expect(invalidRes.error).toContain("tidak valid");

    // Periksa bahwa state sesi tetap di section 0
    const snapshot = gateway.instance.sessions.get(code);
    expect(snapshot?.section).toBe(0);
  });

  it("Presenter mengakhiri sesi dan audiens menerima notifikasi ended", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    const audience = await getClient();
    await audience.emitAck("session:join", { code });

    const endedPromise = audience.waitForEvent<{ code: string }>("session:ended");

    const endRes = await presenter.emitAck<{ ok: boolean }>("session:end", {
      code,
      presenterToken: token,
    });
    expect(endRes.ok).toBe(true);

    const endedData = await endedPromise;
    expect(endedData.code).toBe(code);
  });
});
