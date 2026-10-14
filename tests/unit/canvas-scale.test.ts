import { describe, expect, it } from "bun:test";
import {
  calculateCanvasScale,
  BASE_CANVAS_WIDTH,
  BASE_CANVAS_HEIGHT,
  BASE_ASPECT_RATIO,
} from "../../src/lib/canvasScale";

describe("Unit: Canvas Scale & Proportional Viewport Logic", () => {
  it("menghitung skala sempurna 1.0 jika viewport persis sama dengan ukuran kanvas", () => {
    const res = calculateCanvasScale({
      width: BASE_CANVAS_WIDTH,
      height: BASE_CANVAS_HEIGHT,
    });
    expect(res.scale).toBe(1);
    expect(res.scaledWidth).toBe(BASE_CANVAS_WIDTH);
    expect(res.scaledHeight).toBe(BASE_CANVAS_HEIGHT);
    expect(res.isPortrait).toBe(false);
    expect(res.offsetX).toBe(0);
    expect(res.offsetY).toBe(0);
  });

  it("menghitung skala 1.5 untuk monitor Full HD 1920x1080 dengan rasio 16:9", () => {
    const res = calculateCanvasScale({ width: 1920, height: 1080 });
    expect(res.scale).toBe(1.5);
    expect(res.scaledWidth).toBe(1920);
    expect(res.scaledHeight).toBe(1080);
    expect(res.isPortrait).toBe(false);
    expect(res.offsetX).toBe(0);
    expect(res.offsetY).toBe(0);
  });

  it("menghitung contain scale yang pas pada HP landscape (844x390) dengan letterboxing horizontal", () => {
    const res = calculateCanvasScale({ width: 844, height: 390 });
    // scale dibatasi oleh height: 390 / 720 = 0.5416666...
    expect(res.scale).toBeCloseTo(390 / 720, 4);
    expect(res.scaledHeight).toBe(390);
    expect(res.scaledWidth).toBeCloseTo(BASE_CANVAS_WIDTH * (390 / 720), 2);
    expect(res.isPortrait).toBe(false);
    expect(res.offsetX).toBeGreaterThan(0); // letterbox kiri & kanan
    expect(res.offsetY).toBe(0);
  });

  it("menghitung contain scale pada HP portrait (390x844) dengan letterboxing vertikal dan flag portrait", () => {
    const res = calculateCanvasScale({ width: 390, height: 844 });
    // scale dibatasi oleh width: 390 / 1280 = 0.3046875
    expect(res.scale).toBeCloseTo(390 / 1280, 5);
    expect(res.scaledWidth).toBe(390);
    expect(res.scaledHeight).toBeCloseTo(BASE_CANVAS_HEIGHT * (390 / 1280), 2);
    expect(res.isPortrait).toBe(true);
    expect(res.offsetX).toBe(0);
    expect(res.offsetY).toBeGreaterThan(0); // letterbox atas & bawah
  });

  it("menangani kasus batas ekstrem: viewport 0x0 tanpa menghasilkan NaN atau pembagian nol", () => {
    const res = calculateCanvasScale({ width: 0, height: 0 });
    expect(Number.isFinite(res.scale)).toBe(true);
    expect(res.scale).toBeGreaterThan(0);
    expect(Number.isFinite(res.scaledWidth)).toBe(true);
    expect(Number.isFinite(res.scaledHeight)).toBe(true);
    expect(res.scale).not.toBeNaN();
  });

  it("menangani nilai negatif secara aman dengan clamping", () => {
    const res = calculateCanvasScale({ width: -500, height: 800 });
    expect(Number.isFinite(res.scale)).toBe(true);
    expect(res.scale).toBeGreaterThan(0);
    expect(res.scaledWidth).toBeGreaterThan(0);
  });

  it("mempertahankan rasio aspek 16:9 murni pada berbagai skenario viewport", () => {
    const viewports = [
      { width: 360, height: 640 }, // phone portrait
      { width: 640, height: 360 }, // phone landscape
      { width: 1440, height: 900 }, // MacBook 16:10
      { width: 2560, height: 1440 }, // 2K QHD
      { width: 3440, height: 1440 }, // Ultrawide 21:9
    ];

    for (const vp of viewports) {
      const res = calculateCanvasScale(vp);
      const computedRatio = res.scaledWidth / res.scaledHeight;
      expect(computedRatio).toBeCloseTo(BASE_ASPECT_RATIO, 3);
      expect(res.scaledWidth).toBeLessThanOrEqual(vp.width + 0.001);
      expect(res.scaledHeight).toBeLessThanOrEqual(vp.height + 0.001);
    }
  });
});
