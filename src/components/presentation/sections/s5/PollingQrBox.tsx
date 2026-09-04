import { useEffect, useRef } from "react";

interface PollingQrBoxProps {
  qid: number;
  revealed: boolean;
}

export default function PollingQrBox({ qid, revealed }: PollingQrBoxProps) {
  const qrImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (qid === 0) return;
    const url = `${window.location.origin}/#/voting`;
    if (qrImgRef.current) {
      qrImgRef.current.src = `/api/qr?data=${encodeURIComponent(url)}`;
    }
  }, [qid]);

  return (
    <div className={revealed ? "invisible" : ""}>
      <div className="relative">
        <img
          ref={qrImgRef}
          alt="QR code menuju halaman voting"
          className="h-[13vh] w-[13vh]"
          width={160}
          height={160}
          data-testid="poll-qr"
        />
        {/* Bingkai bidik — bracket sudut amber */}
        <span
          aria-hidden
          className="absolute -top-1 -left-1 h-3 w-3 border-t border-l border-ember/60"
        />
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-3 w-3 border-t border-r border-ember/60"
        />
        <span
          aria-hidden
          className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-ember/60"
        />
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-ember/60"
        />
      </div>
      <p className="mt-2 font-code text-[9px] tracking-[0.2em] text-mute">
        PINDAI → /VOTING
      </p>
    </div>
  );
}
