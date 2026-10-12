# Navigation and sticky-header audit

Scope: leva-next only. Backend and unrelated src/admin-ui files untouched.

## Changes

A root client ScrollManager resets native and Lenis scrolling in a layout effect on pathname changes before paint. Browser restoration is manual. Query-only updates do not trigger this effect. Admin routes only use the native reset. Existing template.tsx is unchanged. ScrollTrigger refresh runs after 100ms and pending image loads. Hash targets use the measured header offset after Lenis dimensions and pins refresh.

FloatingNav measures its visible bottom edge with ResizeObserver and resize events into --header-h. Desktop announcement and navbar both remain fixed; mobile announcement remains hidden. Shop measures --shop-filter-h, uses a white opaque sticky bar with header-relative top, border and shadow, and 24px grid top padding. Existing horizontal strips and bottom sheet are retained. No sticky ancestor adds overflow or transforms. Body/html overflow-x:clip remains compatible with sticky. Anchor scroll margins account for header and shop filters. Checkout summary uses the measured header instead of a fixed top-32. Lenis asynchronous creation is cancelled on unmount to prevent orphan scroll loops.

## Pages checked

| Page | Audit and change |
| --- | --- |
| Home | Browser checked; Home-to-Shop reset verified. Global reset and header/anchor offsets; existing pins retained. |
| Shop | Browser at 1440px and 375px; opaque measured sticky controls, query-only scrolling retained, 24px grid padding. |
| Product detail | Real Shop-to-product click ends at scrollY=0; back returns Shop to scrollY=0. Global reset/margins. |
| Bundles | Source and browser entry checked; existing header-relative sticky stage consumes measured variable. Global reset. |
| Build bundle | Browser entry y=0, heading below header; existing summary uses measured header variable. |
| Cart | Browser entry y=0; heading below header; global reset/margins. |
| Checkout | Browser empty-cart entry y=0; heading below header; summary sticky top changed to header + 1rem. Filled checkout not exercised. |
| Wishlist | Existing /account?tab=wishlist entry checked at y=0. No standalone /wishlist route exists. Authenticated wishlist contents not exercised. |
| About | Browser entry y=0; visible heading below header; global reset/margins. |
| Contact | Browser entry y=0; visible heading below header; global reset/margins. |
| Account | Browser public entry y=0; existing loading/auth states retained. Global reset/margins. |
| Login | Browser entry y=0; heading below header. Global reset/margins. |
| Register | Browser entry y=0; heading below header. Global reset/margins. |
| Track order | Browser entry y=0; heading below header. Global reset/margins. |
| Shipping policy | Browser entry y=0; heading below header. Global reset/margins. |
| Returns | Browser entry y=0; heading below header. Global reset/margins. |
| Privacy | Browser entry y=0; heading below header. Global reset/margins. |
| Terms | Browser entry y=0, no horizontal overflow. Global reset/margins. |

## Browser evidence

Home -> Shop: y=0. Shop -> /shop/product-01 via real product link: y=0. Back -> Shop: y=0. Forward -> Shop: y=0. Query filter Cream retains nonzero y=1055.2.

1440px sticky header bottom=112.8px, filter top=112.8px. 375px sticky header bottom=64.8px, filter top=64.8px. Background rgb(255,255,255). Mobile horizontal overflow false; filter bottom sheet opens. Grid padding-top=24px. Browser screenshots visually inspected at both widths; cards cannot show between the adjoining bars or through their opaque backgrounds. Home #cta-email resolves to a visible input below the header after pin refresh.

## Actual command results

npm run lint: 34 problems (9 errors, 25 warnings), all reported in unrelated untracked src/admin-ui files.

npm run build: Compiled successfully in 17.5s, then Failed to compile because of the same unrelated admin-ui ESLint errors. Full production build is not verified successful.

Targeted ESLint for every changed TS/TSX source file: exit 0.

Unverified: authenticated wishlist/account screens, populated checkout summary interaction, admin route transition browser checks, physical touch-device Lenis behavior, every page at both sizes (the full two-size test was Shop). No unrelated lint errors were hidden or fixed.
