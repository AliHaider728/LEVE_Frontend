"use client";
import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { scrollRuntime } from './scroll-runtime';

export function ScrollManager() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => { history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    let disposed = false;
    const admin = pathname.startsWith('/admin');
    const isFirstMount = !mounted.current;
    mounted.current = true;

    const hashTarget = () => {
      if (!location.hash) return;
      scrollRuntime.lenis?.resize();
      const element = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (element) {
        const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
        if (!admin && scrollRuntime.lenis) scrollRuntime.lenis.scrollTo(element, { immediate: true, force: true, offset: -offset });
        else window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - offset);
      }
    };

    // On first mount without hash: ensure viewport starts clean at top
    if (isFirstMount && !location.hash && !admin) {
      window.scrollTo(0, 0);
      scrollRuntime.lenis?.scrollTo(0, { immediate: true, force: true });
    }

    // Scroll to top on route change
    const isNavigation = !isFirstMount && prevPathname.current !== null && prevPathname.current !== pathname;
    prevPathname.current = pathname;

    if (isNavigation && !admin) {
      scrollRuntime.lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // On first mount: if there's a hash, scroll to it; otherwise don't touch scroll position
    const refresh = () => {
      if (!admin) void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        if (!disposed) {
          ScrollTrigger.refresh();
          requestAnimationFrame(() => { if (!disposed) hashTarget(); });
        }
      });
    };

    const timer = window.setTimeout(() => { refresh(); hashTarget(); }, 100);
    const images = Array.from(document.images).filter(image => !image.complete);
    const loaded = () => { refresh(); if (location.hash) hashTarget(); };
    images.forEach(image => { image.addEventListener('load', loaded); image.addEventListener('error', loaded); });
    window.addEventListener('hashchange', hashTarget);
    return () => {
      disposed = true;
      clearTimeout(timer);
      window.removeEventListener('hashchange', hashTarget);
      images.forEach(image => { image.removeEventListener('load', loaded); image.removeEventListener('error', loaded); });
    };
  }, [pathname]);

  return null;
}
