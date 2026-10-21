import { adminBackendOrigin } from "@/lib/api/admin-origin";
import {
  normalizeProducts,
  normalizeSingleProduct,
  normalizeBundles,
} from "@/lib/api/catalog";
import { getProduct, slugAliases, type Product } from "@/data/products";
import type { Bundle } from "@/data/bundles";

/**
 * Fetch current catalog values for the initial HTML. Product prices and stock
 * must never fall back to the local editorial seed catalog.
 */
export async function getServerProduct(slug: string): Promise<Product | null> {
  const canonicalSlug = slugAliases[slug] || slug;
  const origin = adminBackendOrigin();

  try {
    const res = await fetch(`${origin}/api/products/${encodeURIComponent(canonicalSlug)}`, {
      headers: {
        Accept: "application/json",
        "X-Leva-Storefront": "1",
      },
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Product API returned ${res.status}`);
    const data = await res.json();
    return normalizeSingleProduct(data, getProduct(canonicalSlug));
  } catch (err) {
    console.error(`[SSR Catalog] Product ${canonicalSlug} could not load`, err);
    throw new Error("Live product details are unavailable. Please retry.");
  }
}

/**
 * Server-side data fetcher for all published products.
 */
export async function getServerProducts(): Promise<Product[]> {
  const origin = adminBackendOrigin();

  try {
    const res = await fetch(`${origin}/api/products?limit=10`, {
      headers: {
        Accept: "application/json",
        "X-Leva-Storefront": "1",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return normalizeProducts(data);
      }
    }
  } catch (err) {
    console.warn(
      "[SSR Catalog] Failed to fetch products list from server.",
      err,
    );
  }

  return [];
}

/**
 * Server-side data fetcher for bundles.
 */
export async function getServerBundles(products: Product[]): Promise<Bundle[]> {
  const origin = adminBackendOrigin();

  try {
    const res = await fetch(`${origin}/api/bundles`, {
      headers: {
        Accept: "application/json",
        "X-Leva-Storefront": "1",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return normalizeBundles(data, products);
    }
  } catch (err) {
    console.warn(
      "[SSR Catalog] Failed to fetch bundles from server.",
      err,
    );
  }

  return [];
}
