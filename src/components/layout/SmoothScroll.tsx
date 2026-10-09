import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let frame = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    void import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
  return children;
}
