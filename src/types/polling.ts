import type { ResultsPayload } from "@/lib/questions";

export type Counts = Record<string, number>;

export interface TimelinePoint {
  t: number; // detik sejak suara pertama
  c: number; // jumlah suara kumulatif
}

export interface TimelinePayload {
  question: number;
  total: number;
  firstAt: string | null;
  lastAt: string | null;
  span: number;
  points: TimelinePoint[];
}

export type ResultsMap = Record<number, ResultsPayload>;

export type TimelineMap = Record<number, TimelinePayload | null>;

export type VoteState = "idle" | "sending" | "done" | "error";
