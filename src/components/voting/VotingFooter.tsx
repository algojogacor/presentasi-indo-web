export default function VotingFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-edge bg-base/90 backdrop-blur-sm">
      <p
        className="mx-auto max-w-md px-5 py-3.5 font-code text-[9px] tracking-[0.2em] text-mute"
        style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
      >
        UNIVERSITAS AIRLANGGA · 2026 — SISI PENONTON
      </p>
    </footer>
  );
}
