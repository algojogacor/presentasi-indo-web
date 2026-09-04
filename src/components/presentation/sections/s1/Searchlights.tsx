import { SEARCHLIGHT_BEAMS } from "@/data/video";

export default function Searchlights() {
  return (
    <>
      {SEARCHLIGHT_BEAMS.map((beam, i) => (
        <div
          key={i}
          className="s1-searchlight absolute pointer-events-none"
          style={{
            bottom: 0,
            left: beam.left,
            width: "28vw",
            height: "130vh",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${beam.rotFrom}deg)`,
            mixBlendMode: "screen",
            opacity: 0,
            background: `conic-gradient(from 180deg at 50% 100%, transparent 0deg, transparent 162deg, rgba(255, 235, 180, 0.04) 170deg, rgba(255, 240, 200, 0.18) 177deg, rgba(255, 245, 220, 0.25) 180deg, rgba(255, 240, 200, 0.18) 183deg, rgba(255, 235, 180, 0.04) 190deg, transparent 198deg, transparent 360deg)`,
            filter: "blur(28px)",
          }}
        />
      ))}
    </>
  );
}
