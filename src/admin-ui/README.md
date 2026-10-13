# LEVA integrated admin UI

The provided UI is mounted by the Next.js admin routes. AdminUIContext loads real API records through the same-origin /api/admin proxy. No fixture records or browser tokens are used. Feature Management stores admin-only module settings independently of public storefront flags. Only Super Admin can change them. Unsupported CSV import/export is hidden. Storage-backed image/audio upload requires configured backend storage.
