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

// Mode latihan (rehearsal) — runtime saja, tidak dipertahankan antar reload.
// autoDeadline = epoch-ms ketika langkah saat ini seharusnya berganti otomatis.
let reArmed = false;
let autoDeadline: number | null = null;

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

/* ---------- Mode latihan (rehearsal) ---------- */

/** Apakah mode latihan aktif (auto-advance + patokan waktu). */
export function getRehearsalOn(): boolean {
  return reArmed;
}

/** Sisa detik langkah saat ini sebelum auto-advance (0 bila mati). */
export function getRemainingSeconds(): number {
  if (autoDeadline === null) return 0;
  return Math.max(0, Math.ceil((autoDeadline - Date.now()) / 1000));
}

/** Nyalakan/matikan mode latihan; seconds = durasi langkah saat ini. */
export function setRehearsal(on: boolean, seconds: number): void {
  reArmed = on;
  autoDeadline = on ? Date.now() + Math.max(0, seconds) * 1000 : null;
  notify();
}

/** Pasang ulang tenggat untuk langkah baru (no-op bila mode latihan mati). */
export function armStep(seconds: number): void {
  if (!reArmed) return;
  autoDeadline = Date.now() + Math.max(0, seconds) * 1000;
  notify();
}

/** Tunda tenggat (mis. peta terbuka / animasi masih berjalan). */
export function deferDeadline(ms: number): void {
  if (autoDeadline !== null) autoDeadline += ms;
}
