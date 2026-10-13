# LEVA storefront fixes — implementation and verification

## Scope and root causes

| Issue | Cause | Change |
| --- | --- | --- |
| Shop filters stayed over products | The filter wrapper used sticky positioning and a measured filter-height offset. | Removed sticky positioning, offset tracking, and the extra scroll margin. Existing categories, concerns, sorting, stock filter, grid/story switch, and mobile filter sheet remain. |
| Add to Cart covered card imagery | Purchase action had no hover/focus visibility rule. | Desktop fine-pointer cards reveal it on hover or keyboard focus with opacity/translate transition and stable card height. Touch/coarse-pointer layout keeps the action visible. |
| WhatsApp contact used a placeholder or generic message | Shared config contained a placeholder number and product pages opened generic contact. | Uses the supplied 03147080907 as 923147080907, the green WhatsApp icon, and product-specific name, quantity, selected/default variant when available, and product URL. A compact button sits beside Buy Now on product detail and quick view; the mobile purchase bar also has it. The floating button is hidden on product grids and wishlist where it covered cards. |
| Admin pages loaded slowly or could remain busy | The provider requested every module at startup; GETs raised a global pending state; repeated reads and refreshes overlapped. | Loads only the active page requirements plus dashboard, deduplicates in-flight reads, keeps the layout visible during page loads, refreshes affected loaded modules after writes, and clears busy state after errors. Failed loads expose a retry. |
| Search went to generic shop; mobile search was absent | Header search was a navigation link and mobile header had no matching control. | Shared accessible search dialog on desktop/mobile. It queries the existing backend GET /api/products?search endpoint, uses matching current catalog records, and falls back to current local catalog matching if the endpoint is unreachable. Case-insensitive partial/multiword search, Enter, Escape, clear, zero results and loading states are present. |
| Wishlist hearts were unsynchronized | Product cards had an inert heart and the story row tracked its own local state. | Shared guest wishlist state across header count, cards, story rows, product detail, account tab and /wishlist. Saves only product slugs in browser localStorage under leva-wishlist; reload and cross-tab storage updates rehydrate it. The page supports empty, unavailable, remove, product view and existing cart actions. |

The requested guest-only scope was observed. Customer login, authentication cookies, backend wishlist integration, checkout logic, existing product records, and backend files were not changed.

## Changed files

- Shop and cards: `src/routes/shop.index.tsx`, `src/styles.css`, `src/components/product/ProductCard.tsx`, `src/components/shop/StoryRow.tsx`.
- Search/navigation: `src/components/layout/FloatingNav.tsx`, `src/components/search/ProductSearch.tsx`, `src/lib/product-search.ts`, `src/lib/api/client.ts`.
- Guest wishlist: `src/store/wishlist.ts`, `src/components/wishlist/WishlistButton.tsx`, `src/components/wishlist/WishlistHydration.tsx`, `src/app/wishlist/page.tsx`, `src/app/wishlist/view.tsx`, `src/app/providers.tsx`, `src/components/layout/UserMenu.tsx`, `src/routes/account.tsx`.
- WhatsApp product contact: `src/config/store.ts`, `src/lib/whatsapp.ts`, `src/data/products.ts` (optional selected-attributes type only), `src/lib/api/catalog.ts`, `src/components/product/WhatsAppContact.tsx`, `src/components/product/QuantityAddToCart.tsx`, `src/components/shop/QuickView.tsx`, `src/routes/shop.$slug.tsx`, `src/components/layout/WhatsappButton.tsx`, `public/icons/whatsapp.svg`. The icon SVG was obtained from Simple Icons' public WhatsApp icon source.
- Admin loading: `src/admin-ui/api.ts`, `src/admin-ui/context/AdminUIContext.tsx`, `src/admin-ui/AdminApp.tsx`.
- Regression checks: `scripts/verify-ui-fixes.cjs`.

## Tests actually run

- `npm run build`: exit 0; compiled successfully, generated **28/28** static pages, included `/wishlist`, and postbuild copied public/static assets.
- `npm run lint`: exit 0, no findings.
- `node scripts/verify-ui-fixes.cjs`: **8/8 passed** for search matching/subsets, WhatsApp encoding, persisted guest slugs, deduplicated admin reads, failed-write cleanup and failed-read retry.
- Existing `node scripts/verify-api.cjs`: **12/12 passed**. Existing `node scripts/verify-admin.cjs`: **7/7 passed**.
- Browser, desktop and responsive widths **320, 360, 375, 390, 414, 768, 1024, 1440 px**: search control remained inside the header and document width did not exceed viewport; shop filter computed position was `relative` and moved out of view on scroll; mobile filter sheet filtered Serum to one real product.
- Browser search: partial mixed-case result returned Radiance Serum only; unmatched term returned zero products; clear restored the three essentials; Enter performed a search; Escape closed the dialog; selecting a result opened the matching product page.
- Browser wishlist: save on product detail and Shop updated header count and /wishlist; refresh preserved the item; removing items reached the empty state; Add to Cart from wishlist opened the cart with the correct product. Desktop card hover showed its purchase action without changing card height. At 375 px the product purchase bar displayed Add, Buy and WhatsApp together; the WhatsApp URL contained the expected business number, product name and product URL.
- Browser admin: Products, Dashboard and Orders loaded from the live local backend on reload/navigation; Orders at 375 px retained its horizontal table scroll without document overflow. Storefront and admin browser console error logs were empty in these checks.
- Local backend health returned HTTP **200**. Products, bundles and settings endpoints returned **200**; live bundles currently contain **0 rows**, so the storefront displays its existing saved bundle fallback and a friendly live-details notice. Backend repository status was clean.

## Limits and follow-up

- Guest wishlist is per browser. Signed-in/server wishlist synchronization was explicitly deferred, so it does not sync between devices.
- The backend currently has no live bundle rows. Populating them is separate data work; this frontend change did not create records.
- No production Vercel deployment, actual outbound WhatsApp conversation, real checkout/order submission, physical touch device, or browser-induced admin API outage was tested. Admin failure and retry behavior was exercised with a focused mocked-request regression check; the healthy admin pages were exercised in the browser.
