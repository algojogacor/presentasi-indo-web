export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CanvasScaleResult {
  scale: number;
  scaledWidth: number;
  scaledHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  isPortrait: boolean;
  aspectRatio: number;
  offsetX: number;
  offsetY: number;
}

export const BASE_CANVAS_WIDTH = 1280;
export const BASE_CANVAS_HEIGHT = 720;
export const BASE_ASPECT_RATIO = BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT; // 16:9 ≈ 1.7777777778

/**
 * Menghitung skala kanvas proporsional menggunakan strategi 'contain'.
 * Memastikan hasil bebas dari NaN, pembagian nol, atau nilai negatif.
 */
export function calculateCanvasScale(
  viewport: ViewportDimensions,
  canvas: CanvasDimensions = { width: BASE_CANVAS_WIDTH, height: BASE_CANVAS_HEIGHT }
): CanvasScaleResult {
  const vpWidth = Math.max(0, Number(viewport?.width) || 0);
  const vpHeight = Math.max(0, Number(viewport?.height) || 0);
  const cvWidth = Math.max(1, Number(canvas?.width) || BASE_CANVAS_WIDTH);
  const cvHeight = Math.max(1, Number(canvas?.height) || BASE_CANVAS_HEIGHT);

  const aspectRatio = cvWidth / cvHeight;
  const isPortrait = vpHeight > vpWidth;

  if (vpWidth <= 0 || vpHeight <= 0) {
    return {
      scale: 1,
      scaledWidth: cvWidth,
      scaledHeight: cvHeight,
      canvasWidth: cvWidth,
      canvasHeight: cvHeight,
      isPortrait: false,
      aspectRatio,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const scaleX = vpWidth / cvWidth;
  const scaleY = vpHeight / cvHeight;
  const rawScale = Math.min(scaleX, scaleY);
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;

  const scaledWidth = cvWidth * scale;
  const scaledHeight = cvHeight * scale;
  const offsetX = Math.max(0, (vpWidth - scaledWidth) / 2);
  const offsetY = Math.max(0, (vpHeight - scaledHeight) / 2);

  return {
    scale,
    scaledWidth,
    scaledHeight,
    canvasWidth: cvWidth,
    canvasHeight: cvHeight,
    isPortrait,
    aspectRatio,
    offsetX,
    offsetY,
  };
}
