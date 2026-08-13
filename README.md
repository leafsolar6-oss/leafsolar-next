# Leaf Solar — Next.js on Vercel

Production site for **Leaf Solar Ltd**, Nigeria's one-stop power & appliance store.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Resend for transactional email (OTP, contact form)
- Deployed on Vercel

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
OTP_FROM_EMAIL="Leaf Solar <no-reply@leafsolar.ng>"
OTP_TO_EMAIL=abodjaneb@gmail.com
CONTACT_TO_EMAIL=hello@leafsolar.ng
NEXT_PUBLIC_SITE_URL=https://leafsolar.ng
```

## Develop
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Go to https://vercel.com/new → import the repo.
3. Paste the environment variables above.
4. Click **Deploy**.
5. In Vercel → Domains, add `leafsolar.ng` and `www.leafsolar.ng`.
6. At your DNS host, set the A/CNAME records Vercel gives you (typically:
   - `@` → `76.76.21.21` (A record)
   - `www` → `cname.vercel-dns.com` (CNAME))

While DNS is propagating, the current WordPress site keeps running untouched. When the Vercel deploy is live and you've verified it on the `*.vercel.app` preview URL, switch the DNS.

## Routes
- `/` — Home
- `/products` — Catalog
- `/packages` — Solar packages
- `/about`
- `/contact`
- `/blog`
- `/demo` — Wells Fargo demo (the same PWA you've been using, hosted as a route)
- `/api/contact` — contact form
- `/api/otp/send-code`, `/verify-code`, `/forgot` — OTP endpoints (replace the WordPress ones)
