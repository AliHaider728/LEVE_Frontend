# LEVA Admin integration report

Implemented on 13 October 2026. The supplied `src/admin-ui` is now the primary admin interface. Storefront pages were preserved.

## UI and route replacement

The admin root layout mounts AdminUIProvider; login, dashboard, products, order list/detail and section routes render AdminApp. New product and bundle editor routes handle creation and editing. The supplied reusable tables, forms, content builder, image gallery, dialogs, sidebar and mobile drawer remain the starting interface.

Deleted the obsolete `src/components/admin/shell.tsx` and `shared.tsx` only after confirming they had no remaining imports. Existing authentication helpers, middleware, same-origin proxy, shared components and storefront utilities remain. Removed the supplied mock-data directory and its exports. Admin data starts empty and comes from authenticated API requests, with loading states, module errors, retry controls, empty states, mutation toasts and deletion confirmations.

The existing LEVA logo is used. Logo-derived maroon #673742 and pink #F27DA0, white and blush #FFF4F6 replace the supplied orange palette. Poppins and compact typography remain. Mobile tables scroll inside their cards; the page itself does not scroll horizontally. Source searches found no previous-brand text in the integrated admin UI or tracked backend files.

## Connected APIs

All paths below are backend paths. Browser admin requests use the same-origin `/api/admin/...` proxy, including HttpOnly cookie forwarding. No authentication token is stored in localStorage. Only sidebar collapse preference uses localStorage.

| Admin page/action | Backend API |
| --- | --- |
| Login, session, logout | POST /api/auth/login; GET /api/auth/me; POST /api/auth/logout |
| Dashboard | GET /api/admin/dashboard |
| Products, price, stock, visibility, description, SEO, attributes/variations, content blocks | GET/POST /api/products; GET/PUT/DELETE /api/products/:id; PUT /api/products/reorder |
| Image uploads | POST /api/upload/image, multipart image |
| Categories | GET /api/categories/admin/all; POST /api/categories; PUT/DELETE /api/categories/:id |
| Attributes and terms | /api/global-attributes and /api/global-attributes/:id/terms, with the existing CRUD methods |
| Orders | GET /api/orders?page=...&limit=100; GET /api/orders/:orderId; PUT /api/orders/:orderId/status; PUT /api/orders/:orderId/tracking; DELETE /api/orders/:orderId |
| Customers | GET /api/admin/customers, actual registered customers and order aggregates; read-only UI |
| Reviews | GET/POST /api/reviews/admin; PUT /api/reviews/:id/approve or /reject; DELETE /api/reviews/:id |
| Voice reviews | GET /api/audio-reviews/admin; POST /api/audio-reviews with an actual audio file; DELETE /api/audio-reviews/:id; audio element playback |
| Contact messages | GET /api/contact; PUT /api/contact/:id/status; DELETE /api/contact/:id |
| Bundles and gallery | GET /api/bundles?all=true; POST /api/bundles; PUT/DELETE /api/bundles/:id |
| Coupons | GET/POST /api/coupons; PUT/DELETE /api/coupons/:id |
| Sales reports | GET /api/admin/reports |
| Store profile, shipping, tax and default SEO | GET/PUT /api/settings |
| Social links | PUT /api/settings/social |
| Routine discount settings | GET/PUT /api/settings/routine |
| Best sellers | GET /api/admin/best-sellers; PUT /api/admin/best-sellers/:id |
| Appearance/navigation | GET /api/settings?appearance=true; PUT /api/settings with storefrontNavigation/homepageSections; existing Super Admin authorization retained |
| Admin Feature Management | GET/PUT /api/admin/features |

Orders use the backend's bounded pagination and show 25 rows per UI page. Order details fetch the individual record and display persisted status history. Dashboard/report revenue uses delivered COD orders; no invented growth percentages or chart series remain.

## Backend and database changes

Added the small `/api/admin` router for genuinely missing dashboard, reports, customer aggregates, best-seller management and admin module configuration. Added typed module defaults and authorization middleware. `settings.adminFeatures` JSON is included in initial SQL and the idempotent hardening migration, which was run against the configured database. It is independent of existing public `featureFlags`.

Fixed category product counts and category image update persistence. Fixed review approval foreign keys to use the authenticated user's ID. Public storefront requests are explicitly marked so an administrator browsing the store does not receive disabled/private admin catalog behavior. Development CORS allows the actual local storefront; production origins remain configured by environment. Public checkout/reviews/contact/auth flows preserve their existing rules.

No environment file was written or committed. No credential values are included in this report.

## Three products

The seed uses the existing LEVA frontend source data and schema, preserving names, current/regular prices, images, stock, descriptions, tags and specifications. It inserts missing products in a transaction and checks existing names/slugs before inserting; existing records are never overwritten.

| Product | Current price PKR | Regular price PKR | Stock |
| --- | ---: | ---: | ---: |
| Brightening Cream | 6,800 | 8,500 | 18 |
| Radiance Serum | 7,900 | 9,900 | 12 |
| Gentle Face Wash | 5,400 | 6,750 | 7 |

The seed first inserted the three missing records. A subsequent real run printed `Existing product preserved` for all three. Final integration cleanup confirmed 3 products and 0 orders. The source descriptions/ingredient specifications still contain the original placeholder formula wording; these were preserved, not invented or presented as verified formula details. Local storefront data remains as the previously requested offline fallback; admin product records come from the database.

## Feature Management and authorization

Super Admin alone can change module switches. The API checks the authenticated role and current database role, validates known boolean keys, locks the settings row and persists the merged settings. Ordinary admins/customers cannot promote themselves or edit these switches.

Disabled modules disappear from sidebar navigation, direct Next.js routes redirect to Dashboard, and backend private reads/writes return 404. Feature Management stays accessible to Super Admin. Browser and API checks verified persistence and blocking. Storefront flags and checkout remain independent; the real integration test placed a COD order while admin Products/Orders modules were disabled. All module switches were restored ON after browser verification.

## Actual verification results

Commands run from their respective project folders:

```text
Backend npm run build:
> node scripts/clean-dist.mjs && tsc
Exit code: 0

Backend npm test:
17 database-free hardening checks passed.
7 database-free order checks passed.
Exit code: 0

Backend LEVA_RUN_INTEGRATION=1 npm run test:integration:
42 real database/API integration checks passed.
Final product count: 3
Final order count: 0
Exit code: 0

Backend npm run seed:leva-products:
Existing product preserved: Brightening Cream
Existing product preserved: Radiance Serum
Existing product preserved: Gentle Face Wash
LEVA catalog seed complete.
Exit code: 0

Frontend npm run lint:
> eslint .
No warnings/errors; exit code: 0

Frontend npm run build:
Compiled successfully in 11.4s
Generating static pages (27/27)
postbuild: copied public/ and .next/static into .next/standalone
Exit code: 0

Frontend node scripts/verify-admin.cjs:
7 admin checks passed.

Frontend node scripts/verify-api.cjs:
12 API contract checks passed (mocked fetch; no real orders submitted).
```

The real database/API tests covered anonymous/role restrictions; every listed module's data endpoint; product create/edit; category create/edit/image persistence; attribute/term creation; coupon create/toggle; bundle/gallery create/persistence; review create/reject; module persistence/private-read enforcement; public catalog; authoritative COD checkout; order details/history/tracking; cancellation stock restoration; unchanged public flags. Temporary verification records were removed and stock restored. Mail/revalidation were suppressed for these tests so no test customer email was sent.

The first final integration rerun encountered the deliberately disabled Reports module left by the browser test. The harness now enables modules within the test and restores original flags in finally; the clean rerun passed 42 checks. Two attempted npm verification aliases did not exist; the actual verification scripts were then run directly and passed.

Browser checks used the real existing Super Admin cookie: three database products visible in the supplied UI; actual product editor data loaded; Update Product saved and returned to the catalog; Reports OFF survived navigation/refresh, was hidden and its direct URL redirected; Reports restored ON. At 375x812 the admin document/body widths were both 375, and the mobile drawer opened correctly. The storefront hydrated to live database prices and zero actual review counts and showed the selected cream in Cart. Checkout rendered the matching product summary and COD form without submitting a browser order.

## Explicit limitations / unavailable backend options

- No CSV import/export endpoint exists: buttons are hidden.
- No backend support exists for per-category short teaser/SEO fields or per-category navigation/device switches. Those supplied controls are disabled with an unavailable notice; navigation is managed through the existing Store Appearance API.
- No backend support exists for bundle marketing badges, separate routine application-step fields, or separate Shop/Home placement. Those supplied controls are disabled with an unavailable notice.
- Manual product sold-count editing has no endpoint and is disabled. Product material/size-guide content uses existing specifications JSON.
- Cloudflare R2 image/audio upload endpoints are connected with real multipart requests and friendly errors, but external storage upload was not end-to-end verified because storage configuration was not supplied.
- A fresh password entry was not automated or recorded. Earlier user-run admin setup/login returned HTTP 200; this browser verification reused the real existing authenticated session. The new login request/cookie behavior passed the admin test suite.
- Not every settings/appearance/routine/attribute edit combination or variable-product checkout was exercised through the browser. The real endpoint reads, targeted real writes and automated contract/security checks above are the verified scope.
- The live Vercel backend previously returned health 503 due deployment database/environment configuration. No signed-in deployment account was available to change that configuration. Git push is not proof of successful Vercel deployment or production login; those remain unverified.
- Storefront's existing offline fallback can display saved bundles when the database has none. This was preserved rather than changing unrelated storefront behavior. Checkout still validates database identities and authoritative prices.
