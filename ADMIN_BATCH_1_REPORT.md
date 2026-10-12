# LEVA admin — first batch

Implemented login, independent admin layout, Dashboard, Products and Orders. Remaining sidebar destinations show next-batch notices only.

## Backend connection

Set NEXT_PUBLIC_API_URL to the backend origin, without an /api suffix. The optional server-only ADMIN_SESSION_COOKIE_NAME must match backend COOKIE_NAME (default leva_admin_token).

Admin requests use a same-origin frontend proxy. It forwards the HttpOnly session to the backend, scopes returned cookies to the frontend host, retains security attributes, and rejects cross-site mutations. Middleware verifies /api/auth/me and role before protected routes; the client repeats /auth/me. Login ignores the returned JWT; no token is stored in localStorage. Production cookies require HTTPS when the backend marks them Secure.

## First-batch behavior

- Login: split desktop layout, compact mobile card, password visibility, loading/error feedback, non-admin redirect and logout.
- Layout: LEVA logo, responsive drawer/collapsible sidebar, identity, logout, storefront link and notification bell. Storefront navigation, footer and Lenis do not mount on admin routes.
- Dashboard: live product/order/customer counts, delivered COD order revenue, Pakistan-time weekly chart, pending/out-of-stock counts and recent orders. Revenue is grouped by order creation date, not delivery/payment date. Failed API requests show errors rather than fabricated zeros.
- Products: search, thumbnail, inventory, visibility, create/edit, image upload (backend 5 MB limit), SEO fields and confirmed deletion. Existing parsed metadata and variations are preserved. CSV buttons are hidden.
- Orders: backend pagination, search/status filters, item/address details, COD label, status changes, tracking and history. Backend status changes may email customers; cancelling restores inventory.
- Loading skeletons, empty/error feedback, toasts and scrollable tables/forms are included.

## Backend endpoints unavailable

- GET /api/features: missing in backend route mounts. Optional Categories, Attributes, Voice Reviews, Routine Discounts and Sales Reports links remain hidden; Feature Toggles shows an explicit unavailable notice.
- Product CSV import/export: no supported route found; buttons are omitted.
- Notifications: no supported route found; the bell explains its unavailability.
- Dedicated dashboard statistics/weekly revenue endpoints: no supported route found. Dashboard derives these from existing GET /api/orders, /api/products and /api/auth/users; no nonexistent endpoint is requested.

## Verification

Production build and lint output: verification/admin-build.log and verification/admin-lint.log.
Focused tests: node scripts/verify-admin.cjs; output in verification/admin-checks.log. Tests cover cookie credentials/token disposal, SQL booleans, preserving product metadata/variations/images, order requests, rejected/accepted roles, cookie proxy scoping and cross-site rejection.

Browser checks used a temporary local service with an explicitly test-only admin identity and empty records. Checked login/show-hide, cookie sign-in, Dashboard, mobile drawer, Products empty state/add form, Orders filters/pagination empty state, sidebar collapse and logout/protected redirect. At 375px and 1280px, checked for horizontal overflow and confirmed 14px Poppins, 24px headings and absence of the storefront footer. Fixed mobile dialog bounds (343px wide, scrollable within 90dvh at a 375px viewport). The temporary service has been stopped and removed.

Live backend credentials/database were not configured for these checks. Real login, product create/update/delete/upload, populated tables/order details, email delivery and status/tracking persistence remain unverified against the live backend. No backend files were edited and no storefront pages were edited for this batch. The shared provider was split to isolate admin; the previously added footer Admin link was changed mechanically to the existing router Link to satisfy lint once the admin route exists.

Stopped after batch one. Customers, Reviews, Contact Messages, Bundles, Coupons, Store Settings and Feature Toggles management are deferred until next batch.
