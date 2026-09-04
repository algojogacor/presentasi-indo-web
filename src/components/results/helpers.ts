import type { TimelinePayload } from "@/types/polling";

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const fmtClock = (d: Date) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

export const fmtSpan = (sec: number) =>
  `${Math.floor(sec / 60)}:${pad2(Math.round(sec % 60))}`;

/** Kurva tempo mini — polyline dari titik kumulatif (diskalakan ke viewBox). */
export function sparkPoints(tl: TimelinePayload, w: number, h: number): string {
  const span = Math.max(1, tl.span);
  const tot = Math.max(1, tl.total);
  const xy = [{ t: 0, c: 0 }, ...tl.points].map((p) => [
    Math.min(w, (p.t / span) * w),
    h - Math.min(h - 2, (p.c / tot) * (h - 4)) - 2,
  ]);
  return xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}
