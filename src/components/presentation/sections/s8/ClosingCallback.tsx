import type { RefObject } from "react";

interface ClosingCallbackProps {
  callbackRef: RefObject<HTMLDivElement | null>;
}

export default function ClosingCallback({ callbackRef }: ClosingCallbackProps) {
  return (
    <div
      ref={callbackRef}
      className="absolute inset-0 flex flex-col items-center justify-center px-[12vw] pointer-events-none z-10"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <div className="s8-callback max-w-[72vw] text-center">
        <p className="font-display italic text-[3.4vw] leading-[1.24] text-paper">
          &ldquo;Setiap karya ilmiah punya tubuh. Hari ini kita{" "}
          <span className="text-ember font-normal">sudah</span> bedah
          anatominya.&rdquo;
        </p>
        <p className="mt-5 font-code text-[10px] tracking-[0.35em] text-mute/70 uppercase">
          Kilas Balik Premis Pembuka · Universitas Airlangga
        </p>
      </div>
    </div>
  );
}
