import { SIMPULAN, SIMPULAN_METAS } from "@/data/closing";

interface ConclusionStepperProps {
  step: number;
}

export default function ConclusionStepper({ step }: ConclusionStepperProps) {
  if (step > 3) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[10vw] select-none z-10">
      {/* Stepper Indikator 4 Poin Simpulan */}
      <div className="mb-[4.5vh] flex flex-wrap items-center justify-center gap-2.5">
        {SIMPULAN_METAS.map((m, i) => {
          const isActive = step === i;
          const isPast = step > i;
          return (
            <div
              key={m.num}
              className={`flex items-center gap-2 px-3.5 py-1.5 border transition-all duration-300 ${
                isActive
                  ? "border-ember/80 bg-ember/10 text-ember shadow-[0_0_15px_rgba(232,160,32,0.15)]"
                  : isPast
                    ? "border-edge/90 bg-surface/70 text-paper/70"
                    : "border-edge/30 bg-transparent text-mute/35"
              }`}
            >
              <span
                className={`font-code text-[10px] font-bold ${
                  isActive
                    ? "text-ember"
                    : isPast
                      ? "text-paper/70"
                      : "text-mute/40"
                }`}
              >
                {m.num}
              </span>
              <span className="font-code text-[9.5px] tracking-[0.16em] uppercase">
                {m.tag}
              </span>
              {isActive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember animate-pulse ml-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Kotak Simpulan Aktif */}
      <div
        key={step}
        className="fade-slide-in flex flex-col items-center text-center max-w-[72vw]"
      >
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 border border-edge/60 bg-surface/40 font-code text-[9px] tracking-[0.3em] text-ember uppercase">
          <span>SIMPULAN EKSEKUTIF</span>
          <span>·</span>
          <span>POIN {SIMPULAN_METAS[step]?.num ?? "01"} / 04</span>
        </div>

        <p className="font-display italic text-[2.2vw] leading-[1.38] text-paper max-w-[68vw]">
          &ldquo;{SIMPULAN[step]}&rdquo;
        </p>

        <div className="mt-[3.5vh] flex items-center gap-3 font-code text-[10px] tracking-[0.22em] text-mute/80">
          <span className="w-8 h-[1px] bg-ember/40" />
          <span>{SIMPULAN_METAS[step]?.sub.toUpperCase()}</span>
          <span className="w-8 h-[1px] bg-ember/40" />
        </div>
      </div>

      {/* Navigasi Petunjuk Bawah */}
      <p className="absolute bottom-[6vh] font-code text-[9.5px] tracking-[0.25em] text-mute/50">
        {`SIMPULAN 0${step + 1} / 04 · TEKAN [SPACE] UNTUK LANJUT`}
      </p>
    </div>
  );
}
