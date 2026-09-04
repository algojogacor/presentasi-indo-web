export interface NavState {
  section: number;
  step: number;
  /** Section ini pernah dilihat sebelumnya → remount = settle instan. */
  settled: boolean;
}

export interface SectionProps {
  step: number;
}
