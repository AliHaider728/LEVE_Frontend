import { scrollRuntime } from './scroll-runtime';
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let frame = 0;
    let disposed = false;
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      const instance = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis = instance;
      scrollRuntime.lenis = instance;
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });
    return () => {
      disposed = true;
      scrollRuntime.lenis = undefined;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
  return children;
}
