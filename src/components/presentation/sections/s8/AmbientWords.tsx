import { AMBIENT_WORDS } from "@/data/closing";

export default function AmbientWords() {
  return (
    <>
      {AMBIENT_WORDS.map((w) => (
        <span
          key={w.t}
          aria-hidden
          className="ambient-word font-display italic"
          style={
            {
              left: w.x,
              top: w.y,
              fontSize: w.s,
              "--dur": w.d,
              "--rot": w.r ?? "0deg",
            } as React.CSSProperties
          }
        >
          {w.t}
        </span>
      ))}
    </>
  );
}
