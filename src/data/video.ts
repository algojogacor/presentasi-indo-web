export const REST_WAVE_SCALE = 38;
export const PEAK_WAVE_SCALE = 82;

export interface SearchlightBeamConfig {
  left: string;
  rotFrom: number;
  rotTo: number;
  dur: number;
}

/** Konfigurasi 7 searchlight beam ala 20th Century Fox opening sequence */
export const SEARCHLIGHT_BEAMS: SearchlightBeamConfig[] = [
  { left: "15%", rotFrom: -40, rotTo: -20, dur: 2.5 },
  { left: "25%", rotFrom: -25, rotTo: -5, dur: 3.2 },
  { left: "38%", rotFrom: -15, rotTo: 10, dur: 2.8 },
  { left: "50%", rotFrom: -5, rotTo: 20, dur: 3.8 },
  { left: "62%", rotFrom: 10, rotTo: 30, dur: 2.6 },
  { left: "75%", rotFrom: 20, rotTo: 40, dur: 3.4 },
  { left: "85%", rotFrom: 25, rotTo: 45, dur: 2.9 },
];
