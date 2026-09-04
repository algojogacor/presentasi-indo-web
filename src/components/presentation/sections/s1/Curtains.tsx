export default function Curtains() {
  return (
    <>
      {/* Tirai Panel Kiri (#3D0A0A gradasi ke #1A0505 dengan ornamen emas #C4963A) */}
      <div className="s1-curtain-l absolute inset-y-0 left-0 z-[30] w-[51.5%] overflow-hidden shadow-[12px_0_35px_rgba(0,0,0,0.95)]">
        <div
          className="relative w-full h-full"
          style={{
            filter: "url(#curtain-wave-l)",
            background: `
              linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.7) 100%),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.75) 0px,
                rgba(0, 0, 0, 0.55) 14px,
                rgba(255, 120, 120, 0.16) 40px,
                rgba(255, 255, 255, 0.22) 50px,
                rgba(255, 120, 120, 0.14) 60px,
                rgba(0, 0, 0, 0.55) 86px,
                rgba(0, 0, 0, 0.75) 100px
              ),
              linear-gradient(to right, #1A0505 0%, #250707 28%, #350A0A 70%, #3D0A0A 100%)
            `,
          }}
        >
          {/* Highlight ornamen tepi dalam emas #C4963A */}
          <div
            className="absolute top-0 bottom-0 right-0 w-[10px] z-10 shadow-[0_0_15px_rgba(196,150,58,0.5)]"
            style={{
              background:
                "linear-gradient(to right, #8C6A24 0%, #E2BD63 45%, #C4963A 75%, #6B4E15 100%)",
            }}
          >
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 5px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tirai Panel Kanan (#3D0A0A gradasi ke #1A0505 dengan ornamen emas #C4963A) */}
      <div className="s1-curtain-r absolute inset-y-0 right-0 z-[30] w-[51.5%] overflow-hidden shadow-[-12px_0_35px_rgba(0,0,0,0.95)]">
        <div
          className="relative w-full h-full"
          style={{
            filter: "url(#curtain-wave-r)",
            background: `
              linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.7) 100%),
              repeating-linear-gradient(
                to left,
                rgba(0, 0, 0, 0.75) 0px,
                rgba(0, 0, 0, 0.55) 14px,
                rgba(255, 120, 120, 0.16) 40px,
                rgba(255, 255, 255, 0.22) 50px,
                rgba(255, 120, 120, 0.14) 60px,
                rgba(0, 0, 0, 0.55) 86px,
                rgba(0, 0, 0, 0.75) 100px
              ),
              linear-gradient(to left, #1A0505 0%, #250707 28%, #350A0A 70%, #3D0A0A 100%)
            `,
          }}
        >
          {/* Highlight ornamen tepi dalam emas #C4963A */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[10px] z-10 shadow-[0_0_15px_rgba(196,150,58,0.5)]"
            style={{
              background:
                "linear-gradient(to right, #6B4E15 0%, #C4963A 25%, #E2BD63 55%, #8C6A24 100%)",
            }}
          >
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, #000 0px, #000 2px, transparent 2px, transparent 5px)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
