# LifeSpring Starter

A **Next.js website starter** built by [LifeSpring Design](https://lifespringdesign.com) — design client marketing sites in `/playground`, preview on `/preview`, publish to `/`, and ship with contact forms, SEO, and structured data built in.

---

## What you get

- **Modular sections** — headers, heroes, services, testimonials, contact, footers (`components/sections/`)
- **Design workflow** — `/playground` to pick theme, font, and section variants; **Save to /preview** for client staging
- **Publish to /** — saves the checked section stack to `lib/homepage-config.json` and flips `config/site.ts` → `launch.mode` to `"live"`
- **Under construction** — default `/` shows a branded holding page until you publish
- **Contact form** — modal on header/footer/hero CTAs → `POST /api/leads` → **Resend** email (+ optional **reCAPTCHA Enterprise**)
- **SEO-ready** — metadata, sitemap, JSON-LD

---

## Tech stack

- **Next.js** (App Router) · **TypeScript** · **Tailwind CSS**
- **Resend** — contact form email (optional until `RESEND_API_KEY` is set)
- Deployed on **Vercel**

---

## Local setup

**Requirements:** Node.js 20+ and npm.

```bash
git clone <your-repo-url>
cd lifespring-starter
npm install
cp .env.local.example .env.local   # optional — contact email + reCAPTCHA
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Purpose |
|-------|---------|
| `/` | Live site — under construction until published |
| `/playground` | Section builder — **Save to /preview** and **Publish to /** |
| `/preview` | Client staging (committed layout, noIndex) |

```bash
npm run build   # Production build
npm run start   # Run production build locally
npm run lint    # Lint
```

### Environment variables

Copy **`.env.local.example`** → **`.env.local`** (gitignored). The app runs without env vars; contact email and reCAPTCHA are optional until you fill them in.

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Send contact form leads via Resend |
| `CONTACT_LEAD_TO` | Inbox (defaults to `config/site.ts` → `email`) |
| `CONTACT_LEAD_FROM` | Verified sender domain (production) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `RECAPTCHA_PROJECT_ID` | Shared Google Cloud project |
| `RECAPTCHA_API_KEY_SECRET` | Project secret or API key |

Setup guides: **`docs/resend-setup.md`** · **`docs/recaptcha.md`**

Mirror the same vars in Vercel (or your host) before production deploy.

---

## New client project

**Start here:** **`docs/NEW-CLIENT.md`** — full checklist for cloning this starter per client (identity, soft launch, content, theme, publish, integrations).

Quick flow:

1. **`config/site.ts`** — business name, domain, contact info, logos, `launch.mode`
2. **`.env.local`** — Resend + reCAPTCHA (usually same agency keys across clones)
3. **`lib/demo-content.ts`** + **`public/`** — client copy and assets
4. **`/playground`** — design; check **Preview** on sections you want live
5. **Save to /preview** — writes `lib/homepage-staging-config.json` for client review (commit + deploy)
6. **Publish to /** — writes `lib/homepage-config.json`, sets `launch.mode` to `"live"` (dev only — then commit and deploy)
6. **`docs/SEO.md`** — metadata and go-live SEO

---

## Deployment

1. Push to GitHub (include `lib/homepage-config.json` and `config/site.ts` after publish)
2. Import the repo in [Vercel](https://vercel.com)
3. Set production domain in Vercel and in `config/site.ts`
4. Add env vars from `.env.local.example` in the Vercel dashboard

No env vars required for a basic build; contact email needs `RESEND_API_KEY` on the host.

---

## Docs

| Doc | When to read |
|-----|----------------|
| [`docs/NEW-CLIENT.md`](docs/NEW-CLIENT.md) | Setting up a new client clone |
| [`docs/resend-setup.md`](docs/resend-setup.md) | Contact form email |
| [`docs/recaptcha.md`](docs/recaptcha.md) | Spam protection |
| [`docs/SEO.md`](docs/SEO.md) | Metadata, sitemap, launch SEO |

---

## About LifeSpring Design

LifeSpring Design builds modern marketing websites for businesses that want a polished online presence without unnecessary complexity.

**Questions or want to hire?** [lifespringdesign.com](https://lifespringdesign.com)
