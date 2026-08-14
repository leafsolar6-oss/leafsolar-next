# Leaf Solar production handoff

**Updated:** 14 August 2026

**Repository:** `leafsolar6-oss/leafsolar-next` (`main`)

**Production domain:** [leafsolar.ng](https://leafsolar.ng)

**Project:** Vercel `leafsolar-next`

## Current implementation

The repository contains the modern Leaf Solar commerce storefront and its owner operations backend. The approved catalogue contains 114 products across appliances, electronics, solar equipment, and solar packages.

Implemented and validated:

- Dynamic PostgreSQL catalogue with safe bundled fallback for storefront browsing
- Database-authoritative, fail-closed checkout pricing and product feed
- Search, department/category, brand, price, availability, and sorting controls
- Persistent cart and Paystack-only checkout
- Free delivery for Ibadan addresses in Oyo State
- Owner-approved quote workflow before Paystack payment outside Ibadan
- Passwordless owner administration for products, galleries, confirmed specifications, inventory, scheduled offers, delivery quotes, verified paid orders, fulfilment, and CSV export
- Payment verification, idempotent paid-order persistence, and tracked-stock deduction
- Product and Breadcrumb JSON-LD, canonical handling, sitemap, crawler exclusions, and permanent `/shop` to `/products` redirect
- Published Shipping & Delivery, Returns, Warranty, and Solar Installation policies approved by the owner on 14 August 2026
- Responsive storefront and admin interfaces

No Vercel Web Analytics or Speed Insights package is installed.

## Production data

- Neon database: Vercel Marketplace integration `leafsolar-inventory`
- Vercel Blob store: `leafsolar-products`
- Latest stage-two migration result: 114 products, zero paid orders, zero delivery quotes
- Flexible/manual stock remains in use until the owner records exact quantities

Never fabricate stock quantities, specifications, images, reviews, delivery rates, warranty terms, return windows, delivery dates, or product claims.

## Required secrets

Secrets are held in `.env.local` for the linked local environment and in encrypted Vercel project settings for production. Never print, commit, or request them in chat.

Required names:

- `DATABASE_URL`
- `PAYSTACK_SECRET_KEY`
- `ADMIN_SESSION_SECRET`
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`
- `OTP_TO_EMAIL`
- `CONTACT_TO_EMAIL`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

The Paystack webhook must be configured in the Paystack dashboard as:

```text
https://leafsolar.ng/api/paystack/webhook
```

Paystack's documented Integration API does not provide a webhook-configuration endpoint.

## Validation commands

```bash
npm ci
npm run test:checkout
npm run test:storefront
npx tsc --noEmit
npm run lint
npm run build
```

The final pre-deployment run passed all six checks with zero npm audit vulnerabilities. Production-mode local HTTP checks also passed for the storefront, catalogue, product detail, checkout, four policies, XML routes, protected admin redirects, and permanent `/shop` redirect.

Responsive Chromium QA passed at 390×844 and desktop widths, including filters, cart persistence, Ibadan/outside-Ibadan checkout states, product images, and structured data. The completed browser run recorded no same-origin HTTP failures, console errors, or page errors.

## Database scripts

All scripts are idempotent:

- `scripts/migrate_inventory.ts` — core catalogue, owner, offers, inventory, and paid-order schema
- `scripts/migrate_stage_two.ts` — galleries/specifications, delivery quotes, and expanded order operations
- `scripts/sanitize_catalog_claims.ts` — removes known unsupported catalogue description templates
- `scripts/test_checkout.ts` — checkout, authoritative price, location, and canonical-cart regressions
- `scripts/test_storefront.ts` — catalogue completeness and discovery regressions

Standalone scripts must load `.env.local`. Neon scripts using top-level `await` fail under the current CJS output; use an async IIFE when adding one-off scripts.

## Operational workflow

### Paid orders

1. Checkout prices the cart from PostgreSQL.
2. Ibadan/Oyo receives free delivery; all other locations require an approved quote token.
3. Paystack initializes a transaction containing versioned order metadata.
4. Callback and webhook verify the transaction directly with Paystack.
5. The order is recorded idempotently, tracked inventory is deducted once, and the owner sees the order under `/admin/orders`.
6. The owner progresses fulfilment through `paid`, `processing`, `ready`, `dispatched`, and `delivered`.

The admin cannot manually mark an order as refunded; refunds must be handled and verified through Paystack.

### Outside-Ibadan delivery

1. The customer submits the checkout address and canonical cart for a quote.
2. The owner confirms and enters a real delivery amount in `/admin/delivery-quotes`.
3. The approved token remains bound to customer identity, address, cart, and server-priced subtotal.
4. Only the matching approved quote can initialize Paystack.

Do not introduce automatic rates without an owner-approved rate source.

## Published policies

- `/shipping-delivery`
- `/returns`
- `/warranty`
- `/solar-installation-policy`

These pages intentionally avoid universal timing, fee, remedy, warranty, and performance promises. Any future commercial commitment must be approved by the owner before publication.

## Android owner app

The separate owner-only Android project remains under `/home/user/leafsolar-admin-android`. Key release deliverables:

- QA APK: `/home/user/leafsolar-admin-android/release/leaf-solar-admin-v1.0.0-qa.apk`
- Distribution archive: `/home/user/Leaf-Solar-Admin-Android.zip`

Google Play publication still requires the owner to create and verify a Play Console developer account. Never serve or share the Android `release/` directory as a whole because it contains private signing material.
