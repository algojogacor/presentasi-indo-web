import { useEffect, useRef } from "react";

interface UseTouchSwipeProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: UseTouchSwipeProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        isSwiping.current = false;
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("select") ||
          target.closest("iframe") ||
          target.closest("[data-no-swipe]") ||
          target.closest("[role='dialog']"))
      ) {
        isSwiping.current = false;
        return;
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isSwiping.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current || e.changedTouches.length !== 1) {
        isSwiping.current = false;
        return;
      }
      isSwiping.current = false;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = Date.now() - touchStartTime.current;

      // Harus dalam durasi wajar (max 650ms) dan jarak horizontal cukup
      if (deltaTime > 650) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Dominan horizontal (X minimal 1.35x Y dan minimal 45px)
      // Ini mencegah bentrok dengan vertical scroll di dalam slide
      if (absX >= 45 && absX > absY * 1.35) {
        if (deltaX < 0) {
          // Swipe ke kiri -> slide berikutnya
          onSwipeLeft();
        } else {
          // Swipe ke kanan -> slide sebelumnya
          onSwipeRight();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, disabled]);
}
