import { io, type Socket } from "socket.io-client";

export interface ConnectedClient {
  socket: Socket;
  emitAck: <T = unknown>(event: string, payload: unknown, timeoutMs?: number) => Promise<T>;
  waitForEvent: <T = unknown>(event: string, timeoutMs?: number) => Promise<T>;
  disconnect: () => void;
}

/**
 * Menghubungkan client Socket.IO ke URL pengujian dengan helper Promise & auto-timeout.
 */
export async function createTestClient(
  url: string,
  auth?: Record<string, unknown>,
): Promise<ConnectedClient> {
  const socket = io(url, {
    transports: ["websocket"],
    forceNew: true,
    auth,
    reconnection: false,
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout menghubungkan ke socket di ${url}`));
    }, 4000);

    socket.on("connect", () => {
      clearTimeout(timer);
      resolve();
    });

    socket.on("connect_error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  const emitAck = <T = unknown>(
    event: string,
    payload: unknown,
    timeoutMs = 4000,
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout menunggu ack event "${event}" (${timeoutMs}ms)`));
      }, timeoutMs);

      socket.emit(event, payload, (res: T) => {
        clearTimeout(timer);
        resolve(res);
      });
    });
  };

  const waitForEvent = <T = unknown>(event: string, timeoutMs = 4000): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.off(event, handler);
        reject(new Error(`Timeout menunggu event "${event}" (${timeoutMs}ms)`));
      }, timeoutMs);

      const handler = (data: T) => {
        clearTimeout(timer);
        socket.off(event, handler);
        resolve(data);
      };

      socket.on(event, handler);
    });
  };

  const disconnect = () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return {
    socket,
    emitAck,
    waitForEvent,
    disconnect,
  };
}
