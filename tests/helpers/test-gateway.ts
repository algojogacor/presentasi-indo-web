import { createLiveNotifyServer, type LiveNotifyServerInstance } from "../../mini-services/live-notify/index";

export interface TestGateway {
  instance: LiveNotifyServerInstance;
  port: number;
  url: string;
  close: () => Promise<void>;
}

/**
 * Membuat instance gateway Socket.IO terisolasi pada port dinamis (ephemeral port 0).
 * Tidak menggunakan atau mengganggu port produksi 3030.
 */
export async function spawnTestGateway(): Promise<TestGateway> {
  const instance = await createLiveNotifyServer({
    port: 0, // OS akan memilih port bebas secara dinamis
    forwardVoteToDb: false, // jangan sentuh DB produksi selama tes gateway
  });

  const port = instance.port;
  const url = `http://localhost:${port}`;

  return {
    instance,
    port,
    url,
    close: async () => {
      await instance.close();
    },
  };
}
