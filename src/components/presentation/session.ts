// Penyimpanan sesi presenter — posisi (kti-pos), jam (kti-clock), dan himpunan
// babak yang pernah dikunjungi. Hidup di tingkat modul agar:
//   1. tetap utuh saat berpindah rute (presentasi ↔ #/voting),
//   2. selamat dari refresh (sessionStorage),
//   3. aman dibaca saat render (variabel modul, bukan ref React).
// Dikonsumsi komponen lewat useSyncExternalStore.

import { SECTIONS } from "./context";

export interface SavedPos {
  section: number;
  step: number;
}

const listeners = new Set<() => void>();
let posCache: SavedPos | null | undefined; // undefined = belum dibaca dari storage
let clockStart: number | null = null;
let storeRead = false;

/** Himpunan babak yang pernah tampil — dibaca aman saat render. */
export const visitedActs = new Set<number>();

function readStore(): void {
  if (storeRead || typeof window === "undefined") return;
  storeRead = true;
  try {
    const raw = window.sessionStorage.getItem("kti-pos");
    if (raw) {
      const p = JSON.parse(raw) as SavedPos;
      if (
        Number.isInteger(p.section) &&
        Number.isInteger(p.step) &&
        (p.section > 0 || p.step > 0) &&
        p.section < SECTIONS.length &&
        p.step < SECTIONS[p.section].steps
      ) {
        posCache = p;
      }
    }
  } catch {
    /* storage tidak tersedia / rusak */
  }
  if (posCache === undefined) posCache = null;
  try {
    const clockRaw = window.sessionStorage.getItem("kti-clock");
    if (clockRaw) {
      const t = Number(clockRaw);
      if (Number.isFinite(t) && t > 0) clockStart = t;
    }
  } catch {
    /* abaikan */
  }
}

function notify(): void {
  listeners.forEach((l) => l());
}

/** Berlangganan: notifikasi store + detak 1 detik agar jam presenter hidup. */
export function subscribeSession(l: () => void): () => void {
  readStore();
  listeners.add(l);
  const iv = setInterval(l, 1000);
  return () => {
    listeners.delete(l);
    clearInterval(iv);
  };
}

export function getPosSnapshot(): SavedPos | null {
  readStore();
  return posCache ?? null;
}

export function getClockRunning(): boolean {
  readStore();
  return clockStart !== null;
}

export function getElapsedSeconds(): number {
  readStore();
  if (clockStart === null) return 0;
  return Math.max(0, Math.floor((Date.now() - clockStart) / 1000));
}

export function savePos(pos: SavedPos): void {
  posCache = pos;
  try {
    window.sessionStorage.setItem("kti-pos", JSON.stringify(pos));
  } catch {
    /* abaikan */
  }
  notify();
}

export function startClock(): void {
  readStore();
  if (clockStart !== null) return;
  clockStart = Date.now();
  try {
    window.sessionStorage.setItem("kti-clock", String(clockStart));
  } catch {
    /* abaikan */
  }
  notify();
}
