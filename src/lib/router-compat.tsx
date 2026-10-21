"use client";
/**
 * Thin adapter that keeps the original component code unchanged while running
 * on the Next.js App Router. Mirrors the small subset of the previous router
 * API the storefront uses: Link, useNavigate, useRouterState, createFileRoute,
 * notFound and Outlet.
 */
import NextLink from "next/link";
import {
  notFound as nextNotFound,
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Params = Record<string, string>;
type Search = Record<string, unknown>;
type To = { to?: string; params?: Params; search?: Search | ((s: Search) => Search); hash?: string };

export function buildHref({ to = "/", params, search, hash }: To) {
  let path = to.replace(/\$(\w+)/g, (_, k: string) => encodeURIComponent(params?.[k] ?? ""));
  const s = typeof search === "function" ? search({}) : search;
  if (s) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(s)) if (v !== undefined && v !== null) qs.set(k, String(v));
    const q = qs.toString();
    if (q) path += `?${q}`;
  }
  if (hash) path += `#${hash}`;
  return path;
}

type LinkProps = To &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    activeProps?: { className?: string };
    activeOptions?: { exact?: boolean };
    preload?: unknown;
    replace?: boolean;
    children?: ReactNode;
  };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, params, search, hash, activeProps, activeOptions, preload: _preload, replace, className, children, ...rest },
  ref,
) {
  const pathname = usePathname();
  const href = buildHref({ to, params, search, hash } as To);
  const base = href.split(/[?#]/)[0] ?? "/";
  const active =
    base === "/" || activeOptions?.exact ? pathname === base : pathname === base || pathname.startsWith(base + "/");
  const cls = [className, active ? activeProps?.className : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <NextLink ref={ref} href={href} replace={replace} className={cls} data-status={active ? "active" : undefined} {...rest}>
      {children}
    </NextLink>
  );
});

export function useNavigate(_opts?: { from?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return async (opts: Omit<To, "search"> & { search?: Search | ((prev: any) => Search); replace?: boolean; resetScroll?: boolean }) => {
    const prev = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const search = typeof opts.search === "function" ? opts.search(prev) : opts.search;
    const href = buildHref({ ...opts, to: opts.to ?? pathname, search } as To);
    const scrollPos = typeof window !== "undefined" ? window.scrollY : 0;
    const isSamePath = !opts.to || opts.to === pathname;

    if (opts.replace) {
      router.replace(href, { scroll: false });
      if (isSamePath && opts.resetScroll === false) {
        // Prevent scroll reset bug when changing query params / filters on same page
        const restore = () => {
          if (typeof window !== "undefined" && window.scrollY !== scrollPos) {
            window.scrollTo({ top: scrollPos, behavior: "instant" });
          }
        };
        requestAnimationFrame(restore);
        setTimeout(restore, 0);
        setTimeout(restore, 30);
        setTimeout(restore, 100);
      }
    } else {
      router.push(href);
    }
  };
}

export function useRouterState<T>({ select }: { select: (s: { location: { pathname: string } }) => T }) {
  const pathname = usePathname();
  return select({ location: { pathname } });
}

export function notFound(): never {
  nextNotFound();
}

export function Outlet() {
  return null;
}

type RouteOptions = {
  component?: () => ReactNode;
  head?: (...a: any[]) => unknown;
  loader?: (ctx: { params: Params }) => unknown;
  validateSearch?: (s: Record<string, unknown>) => any;
  [k: string]: unknown;
};

export function createFileRoute(_path: string) {
  return <O extends RouteOptions>(options: O) => ({
    options,
    useParams: () => useNextParams() as Params,
    useSearch: () => {
      const sp = useSearchParams();
      const raw = Object.fromEntries(sp.entries());
      return (options.validateSearch ? options.validateSearch(raw) : raw) as O["validateSearch"] extends (
        ...a: any[]
      ) => infer R
        ? R
        : Search;
    },
    useLoaderData: () => {
      const params = useNextParams() as Params;
      return options.loader?.({ params }) as O["loader"] extends (...a: any[]) => infer R ? R : unknown;
    },
  });
}
