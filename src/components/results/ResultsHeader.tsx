import { fmtClock } from "./helpers";

interface ResultsHeaderProps {
  totalAll: number;
  synced: boolean;
  devices: number;
  updatedAt: Date | null;
}

export default function ResultsHeader({
  totalAll,
  synced,
  devices,
  updatedAt,
}: ResultsHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-4xl px-6 pt-12 pb-8 sm:px-10">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-8 bg-ember/70" />
        <p className="font-code text-[10px] tracking-[0.35em] text-ember">
          ARSIP HASIL
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="font-display text-4xl leading-none sm:text-5xl">
          Hasil Live Polling
        </h1>
        <div className="flex items-center gap-3 font-code text-[10px] tracking-[0.2em] text-mute">
          <span className="dot-live inline-block" aria-hidden />
          <span>
            {totalAll} SUARA TOTAL
            {synced ? " · SYNC" : ""}
            {devices > 0 ? ` · ${devices} PERANGKAT` : ""}
          </span>
        </div>
      </div>
      <p className="mt-3 font-code text-[10px] tracking-[0.28em] text-mute/70">
        KELOMPOK 6 · PDB 93 · UNIVERSITAS AIRLANGGA · 2026
        {updatedAt && ` · DIPERBARUI ${fmtClock(updatedAt)}`}
      </p>
    </header>
  );
}
