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
      <div className="s8-callback max-w-[76vw] text-center">
        <p className="font-display italic text-[clamp(2.2rem,4.2vw,4.8rem)] leading-[1.24] text-paper">
          &ldquo;Setiap karya ilmiah punya tubuh. Hari ini kita{" "}
          <span className="text-ember font-normal">sudah</span> bedah
          anatominya.&rdquo;
        </p>
        <p className="mt-6 font-code text-xs sm:text-sm tracking-[0.35em] text-mute/85 uppercase font-medium">
          Kilas Balik Premis Pembuka · Universitas Airlangga
        </p>
      </div>
    </div>
  );
}
