// Rencana durasi mode latihan (rehearsal) — detik per langkah per babak.
// Total ≈ 53 menit konten + cadang tanya-jawab → target sesi 60 menit.
// Langkah 0 ACT.00 adalah gerbang (jam belum berjalan) → durasi 0, tak dipakai.
// Dipakai oleh: Experience (auto-advance + HUD patokan waktu + pita progres).

import { SECTIONS } from "./context";

export const REHEARSAL_PLAN: number[][] = [
  [0, 30, 45], // 00 OUVERTURE — pembuka + judul + kredit roll
  [30, 15, 645, 60], // 01 GUEST LECTURER — intro gelap + spotlight, tirai tampak, video, penutup
  [40, 40, 50, 50], // 02 LATAR BELAKANG
  [45, 45, 45, 45, 45, 45, 45, 45], // 03 HAKIKAT & KARAKTERISTIK
  [35, 45, 50, 55, 55, 60, 60, 65, 55], // 04 ANATOMY THEATER
  [20, 240, 80, 180, 80], // 05 SESI INTERAKTIF — polling live
  [40, 50, 50, 55, 50, 55], // 06 VARIASI KTI
  [70, 85, 85], // 07 KAIDAH & ETIKA
  [30, 35, 40, 40, 45, 50], // 08 PENUTUP
];

const actSum = (a: number[]) => a.reduce((s, x) => s + x, 0);

/** Total detik rencana (± 3180 dtk = 53 menit). */
export const PLAN_TOTAL = REHEARSAL_PLAN.reduce((s, a) => s + actSum(a), 0);

/** Total langkah seluruh presentasi (untuk pita progres). */
export const TOTAL_STEPS = SECTIONS.reduce((s, sec) => s + sec.steps, 0);

/** Jumlah langkah kumulatif SEBELUM babak tertentu. */
export function cumStepsBefore(section: number): number {
  let t = 0;
  for (let i = 0; i < section && i < SECTIONS.length; i++)
    t += SECTIONS[i].steps;
  return t;
}

/** Detik target satu langkah (fallback 30 dtk bila di luar jangkauan). */
export function stepDuration(section: number, step: number): number {
  const act = REHEARSAL_PLAN[section];
  if (!act) return 30;
  return act[Math.min(step, act.length - 1)] ?? 30;
}

/** Detik kumulatif rencana hingga AWAL langkah tertentu. */
export function plannedElapsed(section: number, step: number): number {
  let t = 0;
  for (let s = 0; s < section && s < REHEARSAL_PLAN.length; s++)
    t += actSum(REHEARSAL_PLAN[s]);
  const act = REHEARSAL_PLAN[section] ?? [];
  for (let k = 0; k < Math.min(step, act.length); k++) t += act[k];
  return t;
}

const pad2 = (n: number) => String(Math.abs(n)).padStart(2, "0");

/** Selisih jadwal, mis. +02:10 (terlambat) / −00:45 (lebih cepat). */
export function fmtDelta(sec: number): string {
  const sign = sec < 0 ? "−" : "+";
  return `${sign}${pad2(Math.floor(Math.abs(sec) / 60))}:${pad2(Math.abs(sec) % 60)}`;
}
