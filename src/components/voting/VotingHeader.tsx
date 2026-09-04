import { LiveDot } from "@/components/presentation/atoms";

interface VotingHeaderProps {
  online: number;
}

export default function VotingHeader({ online }: VotingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-edge bg-base/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
        <span className="flex items-center gap-2.5 font-code text-[10px] tracking-[0.25em] text-mute">
          <LiveDot />
          LIVE POLLING — ANATOMI KTI
          {online > 0 && (
            <span className="font-code text-[9px] tracking-[0.2em] text-paper/55">
              · {online} TERHUBUNG
            </span>
          )}
        </span>
        <span className="font-code text-[9px] tracking-[0.15em] text-mute">
          KELOMPOK 6 · PDB 93
        </span>
      </div>
    </header>
  );
}
