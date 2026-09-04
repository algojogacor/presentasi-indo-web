import { REST_WAVE_SCALE } from "@/data/video";

export default function CurtainFilterSvg() {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
      <defs>
        <filter id="curtain-wave-l" x="-20%" y="-10%" width="140%" height="120%">
          <feTurbulence
            id="turb-l"
            type="fractalNoise"
            baseFrequency="0.009 0.0018"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            id="disp-l"
            in="SourceGraphic"
            in2="noise"
            scale={REST_WAVE_SCALE}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="curtain-wave-r" x="-20%" y="-10%" width="140%" height="120%">
          <feTurbulence
            id="turb-r"
            type="fractalNoise"
            baseFrequency="0.009 0.0018"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            id="disp-r"
            in="SourceGraphic"
            in2="noise"
            scale={REST_WAVE_SCALE}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
