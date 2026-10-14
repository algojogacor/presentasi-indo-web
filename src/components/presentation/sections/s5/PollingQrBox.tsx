import { useEffect, useRef } from "react";
import { usePres } from "../../context";

interface PollingQrBoxProps {
  qid: number;
  revealed: boolean;
}

export default function PollingQrBox({ qid, revealed }: PollingQrBoxProps) {
  const qrImgRef = useRef<HTMLImageElement>(null);
  const { sessionCode } = usePres();

  useEffect(() => {
    if (qid === 0) return;
    const url = sessionCode
      ? `${window.location.origin}/audience/${sessionCode}`
      : `${window.location.origin}/`;
    if (qrImgRef.current) {
      qrImgRef.current.src = `/api/qr?data=${encodeURIComponent(url)}`;
    }
  }, [qid, sessionCode]);

  return (
    <div className={`flex flex-col items-center sm:items-start ${revealed ? "invisible" : ""}`}>
      <div className="relative p-1.5 rounded-lg border border-ember/30 bg-[#0A0A0F]/90 shadow-[0_0_25px_rgba(232,160,32,0.12)]">
        <img
          ref={qrImgRef}
          alt={`QR code untuk bergabung ke sesi voting ${sessionCode || ""}`}
          className="h-44 w-44 sm:h-52 sm:w-52 md:h-[23vh] md:w-[23vh] md:min-h-[190px] md:min-w-[190px] object-contain rounded"
          width={240}
          height={240}
          data-testid="poll-qr"
        />
        {/* Bingkai bidik — bracket sudut amber */}
        <span
          aria-hidden
          className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-ember"
        />
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-ember"
        />
        <span
          aria-hidden
          className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-ember"
        />
        <span
          aria-hidden
          className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-ember"
        />
      </div>

      <div className="mt-2 text-center sm:text-left">
        <p className="font-code text-[10.5px] sm:text-[11px] font-bold tracking-[0.18em] text-[#E8A020]">
          {sessionCode ? `SESI: ${sessionCode}` : "SESI LIVE"}
        </p>
        <p className="font-code text-[9px] text-paper/70 tracking-wider">
          Sudah di sesi? HP otomatis menampilkan voting.
        </p>
      </div>
    </div>
  );
}
