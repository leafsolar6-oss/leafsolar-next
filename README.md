# Leaf Solar Storefront

Production Next.js commerce site for **Leaf Solar Ltd** at [leafsolar.ng](https://leafsolar.ng).

## Capabilities

- Managed 114-product appliance, electronics, and solar catalogue
- Search, category, brand, price, and availability filters
- Product galleries, optional confirmed specifications, inventory, and scheduled offers
- Persistent cart and server-priced Paystack checkout
- Free delivery for Ibadan addresses in Oyo State
- Owner-approved delivery quotes before payment for destinations outside Ibadan
- Owner-only passwordless administration for products, inventory, offers, paid orders, delivery quotes, fulfilment, and order CSV export
- Product/Breadcrumb structured data, canonical URLs, sitemap, robots rules, and an authoritative XML product feed
- Published Shipping & Delivery, Returns, Warranty, and Solar Installation policies

No storefront analytics package is installed.

## Stack

- Next.js 16 App Router, React, TypeScript, and Tailwind CSS
- Neon PostgreSQL for catalogue, inventory, quotes, paid orders, and admin authentication records
- Paystack for payment initialization and verification
- Resend for transactional email
- Vercel Blob for owner-uploaded product images
- Vercel for hosting

## Required environment variables

Copy `.env.example` for local development. Production values belong in encrypted Vercel project settings and must never be committed.

- `DATABASE_URL`
- `PAYSTACK_SECRET_KEY`
- `ADMIN_SESSION_SECRET` (at least 32 characters)
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`
- `OTP_TO_EMAIL`
- `CONTACT_TO_EMAIL`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

## Local validation

```bash
npm ci
npm run test:checkout
npm run test:storefront
npx tsc --noEmit
npm run lint
npm run build
npm start
```

## Database migrations

The migration scripts are idempotent. They load `.env.local` for local execution and use provider environment variables in deployment environments.

```bash
npx tsx scripts/migrate_inventory.ts
npx tsx scripts/migrate_stage_two.ts
npx tsx scripts/sanitize_catalog_claims.ts
```

Do not replace real inventory quantities with invented values. Products can remain in flexible manual-availability mode until the owner records exact stock.

## Important routes

- `/products` — catalogue (`/shop` permanently redirects here)
- `/packages` — active solar packages
- `/solar-calculator` — indicative planning calculator
- `/cart` and `/checkout` — cart and delivery-aware checkout
- `/admin/login` — secure owner sign-in
- `/admin/orders` — verified paid orders and fulfilment
- `/admin/delivery-quotes` — outside-Ibadan quote approval
- `/product-feed.xml` — database-authoritative product feed
- `/shipping-delivery`, `/returns`, `/warranty`, `/solar-installation-policy` — published policies

## Payment operations

Configure the Paystack `charge.success` webhook to:

```text
https://leafsolar.ng/api/paystack/webhook
```

The webhook validates Paystack's HMAC-SHA512 signature, verifies the transaction directly with Paystack, checks stored order metadata and amount, records the paid order idempotently, and updates tracked inventory. The browser callback also verifies payment so customers receive a result even if webhook delivery is delayed.
