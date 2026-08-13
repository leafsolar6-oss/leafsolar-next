# HANDOFF — leafsolar.ng (Next.js rebuild)

**Last updated:** 2026-08-13
**Repo:** https://github.com/leafsolar6-oss/leafsolar-next
**Branch:** `main`
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Resend (email)
**Status:** Build passes locally. Not yet deployed to Vercel. WordPress site is still live at https://leafsolar.ng.

---

## 1. Goal

Rebuild **https://leafsolar.ng** (currently a WordPress + WooCommerce + Elementor site for "Leaf Solar Ltd", a Nigerian solar & appliance retailer) as a modern Next.js site, then switch DNS from WordPress to Vercel. The Wells Fargo banking demo from earlier sessions is a **separate** project — do NOT mix it into this site (it stays at `wf-demo` repo and is served under `/demo` on the new site for convenience only).

---

## 2. What's already built (committed)

```
app/
  layout.tsx                 Root layout, fonts, metadata, <Header/> + <Footer/>
  page.tsx                   Home (hero, brands, packages, products, why-us, CTA)
  globals.css                Tailwind + a few .btn / .container-x helpers
  packages/page.tsx          4 solar packages (Starter/Family/Premium/Estate)
  products/page.tsx          Filterable catalog (?c=Inverter|Battery|...)
  products/[slug]/page.tsx   SSG detail pages for all 8 products
  about/page.tsx
  contact/page.tsx
  contact/ContactForm.tsx    Client form → POST /api/contact
  blog/page.tsx              Placeholder article index
  demo/page.tsx              Wells Fargo PWA in a phone-shaped iframe
  api/
    contact/route.ts         Contact form → Resend
    otp/send-code/route.ts   6-digit OTP, server-side store, Resend email
    otp/verify-code/route.ts Secure verify, 5-attempt lockout
    otp/forgot/route.ts      Reset-code variant
  sitemap.ts
  robots.ts

components/
  Header.tsx                 Sticky nav, mobile drawer, "Get a quote" CTA
  Footer.tsx                 4-col footer, newsletter
  Newsletter.tsx             Client component (newsletter form)

lib/
  data.ts                    Products, packages, site info, formatNaira()
  otp-store.ts               In-memory OTP store (replace with Upstash/KV for prod)

public/demo/                 Copied PWA from ~/wf-bank (index.html, sw.js, manifest, icons)
                             Its API_BASE is set to '/api/otp' so it uses the Next routes.
```

**Products (8):** Deye 5kVA hybrid, 10kWh Maxi lithium, Mora 400W panel, LG 1.5HP AC, Hisense 200L fridge, 5kVA stabilizer, Deye 8kVA 3-phase, 20kWh stacked battery.
**Packages (4):** Starter ₦1.2M (1.5kVA), Family ₦3.45M (3.5kVA, "most popular"), Premium ₦5.25M (5kVA), Estate ₦8.9M (8kVA 3-phase).

The site uses placeholder gradient tiles for product images. Real product photography should be pulled from the current WordPress media library (`https://leafsolar.ng/wp-content/uploads/...`) or supplied by the client. `next.config.js` already whitelists `images.unsplash.com` and `leafsolar.ng` for `next/image`.

---

## 3. Credentials & integrations

### GitHub
- Account: **leafsolar6-oss**
- PAT used in this session: `REDACTED_GENERATE_NEW_PAT`
  - If expired, generate a new classic PAT with `repo` scope at https://github.com/settings/tokens
- Existing repos owned by this account:
  - `wf-demo` (Wells Fargo Android APK, separate — ignore for this project)
  - `leafsolar-next` (this project)

### WordPress (current production — keep running until cutover)
- URL: https://leafsolar.ng
- REST API: `/wp-json/wp/v2/...` (could be used to migrate blog posts/products later)
- Hosting appears to be WordPress.com / Atomic (Jetpack 16.1.1, WooCommerce 11.0.1, Elementor 4.2.2)
- Existing snippets added during earlier sessions are NOT relevant to the new site.

### Resend (for transactional email)
- Sign up free at https://resend.com (3,000 emails/month free)
- Verify domain `leafsolar.ng` in Resend (add DKIM/SPF records it gives you)
- Create an API key, then set it as `RESEND_API_KEY` in Vercel
- OTP emails currently go to `abodjaneb@gmail.com` (set by `OTP_TO_EMAIL`) — confirm with the client whether this is the correct recipient or change it.
- From address uses `OTP_FROM_EMAIL`, default `Leaf Solar <no-reply@leafsolar.ng>` (only works once the domain is verified in Resend).

### Vercel
- No Vercel account was connected in this session. The user needs to log in at https://vercel.com and import the repo.
- Recommended region: `cdg1` (Europe/West Africa closest) — already set in vercel.json.

### Domain / DNS (do NOT change yet)
- Current registrar / nameservers are unknown. The user will see the exact A/CNAME values to add inside Vercel's Domains screen after import.
- Typical values:
  - `A` @ → `76.76.21.21`
  - `CNAME` www → `cname.vercel-dns.com`
- WordPress must stay reachable until the Vercel deploy is verified. Suggest keeping a `wp.leafsolar.ng` CNAME pointed at the old WordPress host for a few weeks as a fallback.

---

## 4. Environment variables (set in Vercel)

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
OTP_FROM_EMAIL="Leaf Solar <no-reply@leafsolar.ng>"
OTP_TO_EMAIL=abodjaneb@gmail.com
CONTACT_TO_EMAIL=hello@leafsolar.ng
NEXT_PUBLIC_SITE_URL=https://leafsolar.ng
```

`.env.example` is committed. For local dev, copy it to `.env.local` and run `npm run dev`.

---

## 5. How to run locally

```bash
git clone https://github.com/leafsolar6-oss/leafsolar-next.git
cd leafsolar-next
npm install
cp .env.example .env.local       # then fill in values
npm run dev                      # http://localhost:3000
npm run build                    # production build (already verified: ✓)
```

Build output (last known good):
```
Route                       Size     First Load JS
┌ ○ /                       183 B    94.1 kB
├ ○ /about                  146 B    87.3 kB
├ ƒ /api/contact            0 B      0 B
├ ƒ /api/otp/forgot         0 B      0 B
├ ƒ /api/otp/send-code      0 B      0 B
├ ƒ /api/otp/verify-code    0 B      0 B
├ ○ /blog                   146 B    87.3 kB
├ ƒ /contact                1.71 kB  88.8 kB
├ ○ /demo                   146 B    87.3 kB
├ ○ /packages               183 B    94.1 kB
├ ƒ /products               183 B    94.1 kB
├ ● /products/[slug]        183 B    94.1 kB
```

Node 18+ is fine.

---

## 6. What to do next (in priority order)

1. **Connect Vercel** — import the repo, add env vars, deploy. Share the `*.vercel.app` preview URL with the client for approval.
2. **Verify Resend domain** — add DNS records Resend provides, send a test via `/api/contact` and `/api/otp/send-code` to confirm email delivery.
3. **Replace product imagery** — swap gradient `<div>` tiles for real photos. Easiest path: copy image URLs from the live WordPress product pages into `lib/data.ts` and use `<Image src={...} />` (domain already whitelisted in `next.config.js`).
4. **Get real copy** — current product descriptions and package lists are sensible defaults but should be reviewed/approved by Leaf Solar. Update phone/WhatsApp numbers in `lib/data.ts` (placeholders like `0800 LEAF SOLAR`).
5. **Add real blog content** — `/blog` is a placeholder. Either write 3 initial posts in MDX under `content/blog/` or migrate existing WordPress posts via `fetch('https://leafsolar.ng/wp-json/wp/v2/posts')`.
6. **Add analytics + chat** — Vercel Analytics, Google Analytics 4, and/or a WhatsApp floating button.
7. **Cut DNS** — only after the client has signed off on the preview. Then set the A/CNAME records at the registrar. Keep WordPress running at `wp.leafsolar.ng` for 2–4 weeks as a rollback.
8. **Post-cutover** — submit `sitemap.xml` to Google Search Console, verify meta tags/OG images, run PageSpeed Insights.

---

## 7. Things the client explicitly asked for (across this project's history)

- "Build it on Vercel as the main site" — confirmed direction.
- Keep the Wells Fargo demo accessible (currently at `/demo`); it should remain an easter-egg/portfolio piece, not part of the customer-facing nav. The footer already links to it as "Customer app demo".
- The OTP / forgot-password endpoints must keep emailing `abodjaneb@gmail.com`.
- Nigerian Naira pricing throughout (`₦`), with free-delivery-until-Dec-2026 promo messaging.

---

## 8. Known limitations / tech debt

- **OTP store is in-memory** (`lib/otp-store.ts`). Fine for a single Vercel function instance but codes won't survive cold starts or scale across regions. Before real production use, swap for **Upstash Redis** or **Vercel KV**. The API surface in each route doesn't need to change — just the storage calls.
- **No CMS yet.** Products and packages are hardcoded in `lib/data.ts`. If the client wants to self-edit, options in order of effort: (a) Sanity.io, (b) Contentful, (c) keep using the existing WordPress as a headless CMS via WPGraphQL, (d) MDX files in-repo.
- **No checkout/payment.** The current site has WooCommerce but the rebuild is marketing-only for now. Buttons go to WhatsApp / contact forms. If e-commerce is needed later, add Shopify Buy Button, Snipcart, or a proper `/cart` flow with Paystack/Flutterwave (the dominant Nigerian processors).
- **Contact form has no spam protection** beyond basic zod validation. Add a Turnstile/hCaptcha before launch.
- **`/blog` is static placeholder content.** No individual post routes yet.
- **Accessibility** — colors and contrast are decent but haven't been audited; run axe / Lighthouse before launch.

---

## 9. Files to look at first (for the next agent)

1. This file (`HANDOFF.md`).
2. `lib/data.ts` — all content lives here.
3. `app/page.tsx` — home page composition.
4. `app/api/contact/route.ts` and `app/api/otp/send-code/route.ts` — email wiring.
5. `components/Header.tsx` — main nav.
6. `README.md` — deployment quickstart.

---

## 10. Separately: the Wells Fargo demo (DO NOT DELETE)

- Repo: https://github.com/leafsolar6-oss/wf-demo
- Live APK: https://leafsolar.ng/?wf_demo_apk=1 (currently served by the old WordPress; after DNS cutover you must either keep the snippet on a `wp.` subdomain or re-host the APK under `public/` on this Next.js repo — already copied as `public/wf-demo/` if you choose that route, but the download endpoint itself is not yet re-implemented).
- The PWA itself is also bundled in `public/demo/` and visible at `/demo`.
- If the new site replaces leafsolar.ng wholesale, the APK download link currently in the README and any external references must be pointed at a new static path (e.g. `/wf-demo/WF-Mobile-Demo-APK-v1.7.zip`) — upload the latest APK from `~/wfapk/` into `public/wf-demo/` and update links accordingly.

---

## 11. Local working paths (on this dev box, may not persist)

```
/home/user/leafsolar-next/   ← this project (committed)
/home/user/wf-bank/          ← source for the Wells Fargo PWA (separate repo)
/tmp/wfapp/                  ← Android wrapper for WF demo
```

If these paths are missing on a fresh machine, just clone from GitHub.

---

**To pick up:** `git clone` the repo, run `npm install && npm run dev`, then start with item 1 in section 6.
