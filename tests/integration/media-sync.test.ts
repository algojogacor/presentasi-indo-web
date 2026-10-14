import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { spawnTestGateway, type TestGateway } from "../helpers/test-gateway";
import { createTestClient, type ConnectedClient } from "../helpers/test-client";
import type {
  SessionCreateResponse,
  SessionJoinResponse,
  MediaPlaybackState,
} from "../../src/lib/syncSocket";

describe("Integration: Media & YouTube Playback Synchronization", () => {
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

  it("Presenter memperbarui state pemutaran media dan gateway menyiarkannya ke audiens", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    const audience = await getClient();
    await audience.emitAck<SessionJoinResponse>("session:join", { code, voterId: "v1" });

    // Presenter navigasi ke slide video (Section 1 Step 2)
    await presenter.emitAck<{ ok: boolean }>("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 1,
      step: 2,
    });

    const mediaWait = audience.waitForEvent<MediaPlaybackState>("session:media_sync");

    // Presenter memutar video
    const mediaRes = await presenter.emitAck<{ ok: boolean; media: MediaPlaybackState }>(
      "session:media_update",
      {
        code,
        presenterToken: token,
        media: {
          mediaId: "E6pPlIvlrPs",
          section: 1,
          status: "playing",
          currentTime: 14.2,
          timestamp: Date.now(),
        },
      },
    );

    expect(mediaRes.ok).toBe(true);
    expect(mediaRes.media.status).toBe("playing");
    expect(mediaRes.media.currentTime).toBe(14.2);

    const broadcastedMedia = await mediaWait;
    expect(broadcastedMedia.mediaId).toBe("E6pPlIvlrPs");
    expect(broadcastedMedia.section).toBe(1);
    expect(broadcastedMedia.status).toBe("playing");
    expect(broadcastedMedia.currentTime).toBe(14.2);
  });

  it("Audiens yang baru bergabung (late-join) menerima snapshot yang memuat active media", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    await presenter.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 1,
      step: 2,
    });

    await presenter.emitAck("session:media_update", {
      code,
      presenterToken: token,
      media: {
        mediaId: "E6pPlIvlrPs",
        section: 1,
        status: "paused",
        currentTime: 42.5,
        timestamp: Date.now(),
      },
    });

    // Klien audiens baru bergabung belakangan
    const lateAudience = await getClient();
    const joinRes = await lateAudience.emitAck<SessionJoinResponse>("session:join", {
      code,
      voterId: "late_voter",
    });

    expect(joinRes.ok).toBe(true);
    expect(joinRes.session?.media).toBeDefined();
    expect(joinRes.session?.media?.status).toBe("paused");
    expect(joinRes.session?.media?.currentTime).toBe(42.5);
  });

  it("Audiens atau pihak tanpa presenterToken sah ditolak saat mencoba update media", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;

    const imposter = await getClient();
    await imposter.emitAck("session:join", { code, voterId: "bad_guy" });

    const hackRes = await imposter.emitAck<{ ok: boolean; error?: string }>(
      "session:media_update",
      {
        code,
        presenterToken: "fake_token_123",
        media: {
          mediaId: "HACKED",
          section: 1,
          status: "playing",
          currentTime: 999,
          timestamp: Date.now(),
        },
      },
    );

    expect(hackRes.ok).toBe(false);
    expect(hackRes.error).toContain("Tidak memiliki hak kontrol presenter");
  });

  it("Media state otomatis dibersihkan saat presenter meninggalkan slide video", async () => {
    const presenter = await getClient();
    const createRes = await presenter.emitAck<SessionCreateResponse>("session:create", {});
    const code = createRes.session!.code;
    const token = createRes.presenterToken!;

    const audience = await getClient();
    await audience.emitAck("session:join", { code, voterId: "v_clean" });

    // Masuk slide video
    await presenter.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 1,
      step: 2,
    });
    await presenter.emitAck("session:media_update", {
      code,
      presenterToken: token,
      media: {
        mediaId: "E6pPlIvlrPs",
        section: 1,
        status: "playing",
        currentTime: 30,
        timestamp: Date.now(),
      },
    });

    // Pindah ke section 2 step 0 (keluar dari video)
    await presenter.emitAck("session:update", {
      code,
      presenterToken: token,
      stage: "live",
      section: 2,
      step: 0,
    });

    // Verifikasi snapshot untuk klien berikutnya sudah bebas dari media aktif
    const nextClient = await getClient();
    const snapRes = await nextClient.emitAck<SessionJoinResponse>("session:join", {
      code,
      voterId: "v_next",
    });

    expect(snapRes.session?.media).toBeNull();
  });
});
