export default function ThankYouCard() {
  return (
    <div className="fade-slide-in absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-[12vw] z-20 pointer-events-none">
      <div className="pointer-events-auto border border-edge/80 bg-surface/85 backdrop-blur-[6px] px-6 sm:px-14 py-7 sm:py-10 text-center w-full max-w-[90vw] md:max-w-[60vw] shadow-2xl rounded-sm">
        <p className="font-code text-xs sm:text-sm tracking-[0.35em] sm:tracking-[0.45em] text-ember uppercase font-semibold">
          Kelompok 6 · PDB 93
        </p>
        <h2 className="mt-2.5 sm:mt-3.5 font-display text-[clamp(2.8rem,5vw,5.5rem)] leading-none text-paper font-semibold">
          Terima kasih.
        </h2>
        <p className="mt-3.5 sm:mt-4.5 font-body text-base sm:text-lg md:text-[1.45vw] text-paper/90">
          Ruang diskusi dan tanya jawab dibuka — silakan.
        </p>
        <div className="mt-6 sm:mt-7 pt-3.5 sm:pt-4 border-t border-edge/60 flex items-center justify-center gap-3 sm:gap-4 font-code text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.28em] text-mute/85 font-medium">
          <span>UNIVERSITAS AIRLANGGA</span>
          <span>·</span>
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
