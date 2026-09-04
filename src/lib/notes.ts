// Catatan presenter per langkah — panduan penyampaian (bukan naskah).
// Dipakai oleh NotesPanel (toggle [N]) — murni alat bantu presenter,
// tidak pernah tampil ke audiens kecuali layar diproyeksikan bersama panel.

import { NOTE_PLAN, type StepNote } from "./notesData";

export type { StepNote };
export { NOTE_PLAN };

/** Catatan langkah tertentu — fallback bila di luar jangkauan. */
export function stepNote(
  section: number,
  step: number,
): { t: string; c: string } {
  const act = NOTE_PLAN[section];
  if (!act) return { t: "—", c: "Tidak ada catatan untuk babak ini." };
  return (
    act[Math.min(step, act.length - 1)] ?? {
      t: "—",
      c: "Tidak ada catatan untuk langkah ini.",
    }
  );
}
