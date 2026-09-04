export default function ThankYouCard() {
  return (
    <div className="fade-slide-in absolute inset-0 flex flex-col items-center justify-center px-[12vw] z-20 pointer-events-none">
      <div className="pointer-events-auto border border-edge/80 bg-surface/80 backdrop-blur-[6px] px-14 py-8 text-center max-w-[56vw] shadow-2xl">
        <p className="font-code text-[11px] tracking-[0.45em] text-ember uppercase">
          Kelompok 6 · PDB 93
        </p>
        <h2 className="mt-3 font-display text-[4.4vw] leading-none text-paper">
          Terima kasih.
        </h2>
        <p className="mt-4 font-body text-[1.18vw] text-paper/85">
          Ruang diskusi dan tanya jawab dibuka — silakan.
        </p>
        <div className="mt-6 pt-4 border-t border-edge/60 flex items-center justify-center gap-4 font-code text-[10px] tracking-[0.28em] text-mute">
          <span>UNIVERSITAS AIRLANGGA</span>
          <span>·</span>
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
