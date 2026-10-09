/**
 * Typed data access. Reads the local catalog today; set NEXT_PUBLIC_API_URL
 * later to switch to the Express backend without touching components.
 */
import { products, getProduct, type Product } from "@/data/products";
import { bundles, type Bundle } from "@/data/bundles";

const API = process.env.NEXT_PUBLIC_API_URL;

async function get<T>(path: string, fallback: () => T): Promise<T> {
  if (!API) return fallback();
  const res = await fetch(`${API}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const catalogApi = {
  listProducts: () => get<Product[]>("/api/v1/products", () => products),
  getProduct: (slug: string) => get<Product | undefined>(`/api/v1/products/${slug}`, () => getProduct(slug)),
  listBundles: () => get<Bundle[]>("/api/v1/bundles", () => bundles),
};
