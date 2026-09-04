const pad2 = (n: number) => String(n).padStart(2, "0");

interface ResumeGateProps {
  savedPos: { section: number; step: number } | null;
  section: number;
  step: number;
}

export default function ResumeGate({
  savedPos,
  section,
  step,
}: ResumeGateProps) {
  if (!savedPos || section !== 0 || step !== 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-[15vh] left-1/2 z-[70] -translate-x-1/2 text-center font-code text-[10px] tracking-[0.22em] text-paper/40">
      {`POSISI TERSIMPAN — [L] LANJUT ACT.${pad2(savedPos.section)} // STEP.${pad2(savedPos.step)}`}
    </div>
  );
}
