# New Client Setup — Boilerplate v1

**For AI / developer:** When the user says *“read `docs/NEW-CLIENT.md` — the customer is [NAME]”*, follow this file. Replace every `[CUSTOMER]` placeholder with the real business name and fill in details they provide (or ask once for anything missing).

This repo is **LifeSpring Starter**. Each client gets their own forked repo. Do not treat LifeSpring Design branding as the client brand unless explicitly told otherwise.

**Integrations (contact email + reCAPTCHA):** see [Integrations (every clone)](#integrations-every-clone) below — or the focused guides [`docs/resend-setup.md`](./resend-setup.md) and [`docs/recaptcha.md`](./recaptcha.md).

---

## Quick intake (ask or infer from user)

| Field | Example | Used in |
|-------|---------|---------|
| Business name | Spartan Restoration | `config/site.ts`, SEO, schema |
| Domain | spartanrestoration.com | `config/site.ts`, canonical URLs |
| Phone | (real) | site config, footer, schema, CTAs |
| Email | (real) | site config, footer, contact |
| Address | (real or service area) | footer, LocalBusiness schema |
| Industry | Water damage / restoration | copy tone, services, keywords |
| Color theme | `spartan` | `lib/color-themes.ts` default |
| Service area | Vancouver WA, Portland OR | hero, SEO, schema |
| Logo files | in `public/` | `config/site.ts` assets |

**Theme IDs available:** `dark` (Dark-Space), `lifespring`, `light`, `stone`, `spartan`, `ocean`

Set `defaultColorThemeId` in `lib/color-themes.ts` to the client theme so `/playground` opens correctly.

---

## Work order (do in this sequence)

Two launch moments:

1. **Soft launch** — client domain live with **Under Construction** on `/` while you theme on `/playground`
2. **Full launch** — replace `/` with the real homepage when the design is approved

---

### Phase 1 — Identity (minimum for soft launch)

**1. `config/site.ts`**

Swap LifeSpring placeholders for `[CUSTOMER]`:

- `name`, `domain`, `url`
- `tagline`, `description` — shown on the under construction page
- `phone`, `email`, `address`
- `nav` — can stay minimal for now; Playground/Preview are dev-only
- `social` — real URLs when ready (optional for soft launch)
- `assets.logo` — client logo on under construction page (`public/[client-slug]/logo.png` or path you set)
- `assets.ogImage` — optional for soft launch; add before full launch

**2. `lib/seo-content.ts` — homepage (under construction)**

Update `pageSeo.home` for `[CUSTOMER]`:

- `title` — e.g. `"Coming Soon"` or `"Under Construction"`
- `description` — one sentence about `[CUSTOMER]` and what they do
- `noIndex` — **keep `true` during build** OR set `false` if the client wants the domain indexed with a coming-soon message (ask the user)

**3. `public/`**

- Drop client logo at the path used by `config/site.ts` `assets.logo` (e.g. `/lsd/logo.png` on the official site, or `/your-slug/logo.png` on a client clone)

**4. `package.json`** (optional)

- Change `"name"` to a slug like `spartanrestoration`

---

### Integrations (every clone)

Do this early — contact works on `/playground` and `/preview` before full launch. Details: [`docs/resend-setup.md`](./resend-setup.md) · [`docs/recaptcha.md`](./recaptcha.md).

**5. Environment — `.env.local`**

```bash
cp .env.local.example .env.local
```

| Variable | Per clone? | Notes |
|----------|------------|--------|
| `RESEND_API_KEY` | Usually **same** | One agency Resend account |
| `RECAPTCHA_PROJECT_ID` | **Same** | One Google Cloud project for all clients |
| `RECAPTCHA_API_KEY_SECRET` | **Same** | Project secret or `AIzaSy` API key |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Same or per client | Option A: one key, all domains. Option B: key per client |
| `CONTACT_LEAD_TO` | Optional | Defaults to `config/site.ts` → `email` |
| `CONTACT_LEAD_FROM` | **Per client** (production) | Verified domain, e.g. `Spartan Restoration <contact@spartanrestoration.com>` |

Restart `npm run dev` after any env change. Mirror the same vars in Vercel (or host) before deploy.

**6. Contact form (modal, not a separate page)**

- Header, footer, and hero CTAs open a **contact modal** — no `/contact` page required for launch
- Form lives in `components/forms/ContactForm.tsx` → `POST /api/leads`
- Set `config/site.ts` → `email` (and `phone`) so leads and CTAs show the right info
- Test on `/playground` (Contact-v1 section) or `/preview` after env is set

**7. reCAPTCHA (spam protection)**

1. In Google Cloud → reCAPTCHA → add **client domain** + `localhost` to the site key (Option A: shared key; Option B: client’s own key → update `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`)
2. Leave all three reCAPTCHA vars blank to **disable** verification on a clone (form still submits)

**8. Resend (lead email)**

1. Local/sandbox: `RESEND_API_KEY` only — sends from `onboarding@resend.dev`; recipient must be allowed (often your Resend signup email, or set `CONTACT_LEAD_TO`)
2. Production: Resend → **Domains** → verify client domain → set `CONTACT_LEAD_FROM` → redeploy

**Integrations checklist**

- [ ] `.env.local` copied and filled (at minimum `RESEND_API_KEY`; reCAPTCHA vars if enabled)
- [ ] `config/site.ts` → `email` set to client inbox
- [ ] Client domain added to reCAPTCHA key in Cloud Console
- [ ] Contact form tested on `/playground` — email arrives in Resend dashboard
- [ ] Hosting env vars match `.env.local` before production deploy
- [ ] Client domain verified in Resend + `CONTACT_LEAD_FROM` set before go-live

---

### Phase 2 — Soft launch (under construction)

**Goal:** Domain goes live. Visitors see a branded holding page. You keep building on `/playground`.

**9. Confirm `/` is under construction**

Default: `config/site.ts` → `launch.mode` is `"under-construction"`. `app/page.tsx` reads that switch and renders `<UnderConstruction />`. **Do not publish yet.**

The holding page reads from `siteConfig`:

- `assets.logo` — optional logo in the brand card
- `underConstruction.brandTitleLines` — optional split title (e.g. `["Spartan", "Restoration"]`); defaults to `name`
- `underConstruction.headline` / `subheadline` — main messages
- `teamContacts` — contact cards; if empty, falls back to site `phone` / `email`

Override `--uc-*` CSS variables under `.under-construction` in `app/globals.css` for client brand colors (gold/slate for Spartan, etc.).

**10. Set default theme for your workspace**

`lib/color-themes.ts` → set `defaultColorThemeId` to the client theme (e.g. `"spartan"`). This only affects `/playground`, not the public `/` page.

**11. Deploy to Vercel**

- New Vercel project → client repo
- Connect `[CUSTOMER]` domain
- Verify:
  - `https://[domain]/` → under construction + client logo
  - `https://[domain]/playground` → section builder (not in nav for public; noIndex + robots disallow)

**Soft launch checklist**

- [ ] `config/site.ts` has client name, domain, tagline, logo path
- [ ] `lib/seo-content.ts` → `pageSeo.home` updated for client
- [ ] Client logo in `public/`
- [ ] `config/site.ts` → `launch.mode` is `"under-construction"`
- [ ] Vercel deployed with client domain
- [ ] `/playground` and `/preview` not linked from public nav (optional: password-protect later)

**You can stop here and theme in `/playground` whenever ready.**

---

### Phase 3 — Content (while soft launch is live)

**12. `lib/demo-content.ts`**

Replace all demo / OSP copy. Key exports:

| Export | Sections using it |
|--------|-------------------|
| `washingHero` | HeroWashing-v1/v2 |
| `washingFlipCards`, `fourFlipCards` | FlipCards |
| `washingServiceSections` | Services-v3 |
| `washingTestimonials` | Testimonials-v3 |
| `associationLogos`, `associationHeading` | Testimonials-v3, LogoBar |
| `washingFooter` | Footer-v4 |
| `heroDemo`, `testimonials`, etc. | Agency-style sections on `/preview` |

Rules:

- Write for `[CUSTOMER]` services and geography
- Every `washingServiceSections[].id` must match a footer link in `washingFooter.serviceLinks` (e.g. `#pressure-washing`)
- One clear primary keyword per service block
- Replace placeholder testimonials with real or approved client copy

**13. `lib/seo-content.ts`** (remaining routes)

- `pageSeo` — unique title + description per route for `[CUSTOMER]`
- `tradeDemoSeo` — headline, description, `areaServed`, `serviceTypes` for JSON-LD

**14. `public/`** (full site assets)

- Client logos (light + dark if using theme headers with BrandLogo)
- Hero banner, service photos
- `og.jpg` (1200×630) → `assets.ogImage`
- LifeSpring demo assets live in `public/lsd/` (logos, portfolio, section icons); trade demo stays in `public/osp/`

---

### Phase 4 — Theme & layout on `/playground`

**15. Design on `/playground`**

- Run `npm run dev` → open `/playground`
- Creative Bar (bottom): pick client **theme** and **font**
- Section dropdowns: lock header, hero, services, testimonials, footer variants
- Reference stack lives in `components/pages/HomePage.tsx` defaults

Common trade/restoration stack:

- Header-v3 · HeroWashing-v2 · FlipCards · Services-v3 · Testimonials-v3 · Footer-v4

**16. Header logo vs wordmark**

`components/ui/HeaderBrand.tsx` shows a **theme wordmark** in preview for every theme except `lifespring`. For the **live client site**, use the real logo (`BrandLogo`) once assets exist — update HeaderBrand or production homepage wiring so `/` is not stuck on placeholder text.

---

### Phase 5 — Full site (publish homepage)

**17. Publish from `/playground`**

When layout is approved:

1. Check **Preview** on each section you want on the live homepage
2. Click **Publish to /** in the playground Creative Bar (dev only — `npm run dev`)
   - Saves section stack + theme settings to `lib/homepage-config.json`
   - Sets `config/site.ts` → `launch.mode` to `"live"`
3. **Commit and deploy** — publish writes local files; production needs a git push + Vercel redeploy (env vars included)
4. Update `lib/seo-content.ts` → `pageSeo.home` (title, description, set `noIndex: false`)
5. Verify `/` locally — real homepage with JSON-LD; `/preview` and `/playground` stay noIndex

**Revert:** **Back to construction** sets `launch.mode` back to `"under-construction"` (keeps saved config for re-publish). Commit + deploy again after revert.

Manual override: edit `launch.mode` in `config/site.ts` directly.

**18. Scaffold pages**

Update copy and `createMetadata()` in each:

- `app/about/page.tsx`
- `app/services/page.tsx`
- `app/contact/page.tsx` (optional fallback — contact modal is primary)
- `app/blog/page.tsx` (drop from nav if unused)

**19. JSON-LD**

- Playground already adds `LocalBusinessJsonLd` on `/playground`
- Production homepage should include appropriate schema via `components/seo/JsonLd.tsx` when going live

---

### Phase 6 — Full launch

**20. Pre-launch checklist** (details in `docs/SEO.md`)

- [ ] Published from `/playground` — `launch.mode` is `"live"` and `/` shows real homepage
- [ ] `pageSeo.home` updated — `noIndex: false` when ready to index
- [ ] Remove Playground & Preview from `config/site.ts` nav (if added)
- [ ] Confirm `app/sitemap.ts` lists only public routes
- [ ] `/playground` and `/preview` stay noIndex (already configured)
- [ ] Real social URLs in `config/site.ts`
- [ ] Test footer anchor links match service section ids
- [ ] Redeploy Vercel

---

## File map (what to touch per client)

```
.env.local.example → .env.local  ← Resend + reCAPTCHA (every clone — see Integrations)
config/site.ts              ← business identity + launch.mode switch (under-construction | live)
lib/homepage-config.json    ← published section stack (written by Publish to /)
lib/seo-content.ts          ← pageSeo.home first, then other routes
public/lsd/                 ← LifeSpring assets (logos, portfolio, section icons); trade demo stays in public/osp/
app/page.tsx                ← reads launch.mode; do not edit manually for go-live
lib/color-themes.ts         ← default theme for /playground
lib/demo-content.ts         ← section copy (Phase 3+)
public/                     ← full assets (Phase 3+)
app/*/page.tsx              ← inner pages (Phase 5+)
components/ui/HeaderBrand.tsx  ← logo on live site (Phase 5+)
components/under-construction/UnderConstruction.tsx  ← optional copy tweaks
app/globals.css             ← only if theme tweaks beyond existing palette
package.json                ← project name slug (optional)
```

**Usually do not edit:** `lib/section-registry.tsx` structure, `components/dev/*`, theme system plumbing — unless adding new sections.

---

## Theme quick reference

| Theme ID | Use case |
|----------|----------|
| `spartan` | Restoration / trades — slate, gold, blue water accents |
| `ocean` | Pressure washing / blue-cyan service sites |
| `stone` | Warm neutral local business |
| `lifespring` | LifeSpring agency demos only |
| `dark` | Dark-Space purple aesthetic |
| `light` | Clean generic light UI |

Spartan CSS lives in `app/globals.css` under `.creative-preview[data-color-theme="spartan"]`.

---

## Prompt template for user

Copy, fill in, paste to chat:

```
Read docs/NEW-CLIENT.md and set up this client:

Customer: [BUSINESS NAME]
Domain: [domain.com]
Theme: [spartan | ocean | stone | etc.]
Industry: [e.g. water damage restoration]
Service area: [cities/regions]
Phone: [ ]
Email: [ ]

Phase 1–2 first: config/site.ts, pageSeo.home, client logo, soft launch on Under Construction.
Integrations: cp .env.local.example .env.local, set up Resend + reCAPTCHA per docs/resend-setup.md and docs/recaptcha.md.
Then theme on /playground. Don't click Publish to / until I say full launch.
```

---

## Version

- **Boilerplate v1.3** — Publish to / (homepage-config.json + launch.mode switch); README + AGENTS.md aligned
- **Boilerplate v1.2** — adds Integrations section (env, contact modal, Resend, reCAPTCHA)
- Pair with `docs/SEO.md` for metadata / schema / go-live detail
- Pair with `docs/resend-setup.md` and `docs/recaptcha.md` for contact form setup
