# Migration from lifespring-starter

Synced from `/Users/joshuarinard/Desktop/lifespring-starter` into this Spartan Restoration repo.

## What was copied (lifespring-starter → Spartan)

### Publish & launch workflow
- [x] `lib/launch-mode.server.ts` — read/write `launch.mode` in `config/site.ts`
- [x] `lib/homepage-config.ts`, `homepage-config.server.ts`, `homepage-config.json`
- [x] `lib/homepage-export-client.ts`, `homepage-settings.ts`
- [x] `app/api/homepage-config/route.ts` — dev-only publish/revert API
- [x] `app/page.tsx` — dynamic `/` (under-construction OR live published site)
- [x] `components/pages/LiveHomePage.tsx`, `components/layout/SiteShell.tsx`
- [x] `components/dev/HomepageLaunchButtons.tsx` — **Publish to /** and **Back to construction**

### Playground (full builder)
- [x] `lib/playground-sections.ts`, `playground-section-id.ts`, `use-playground-sections.ts`
- [x] `components/dev/PlaygroundSectionSlot.tsx`, `SectionPreview.tsx`
- [x] Client-driven `HomePage.tsx` / `PreviewPage.tsx` with drag/drop + preview checkboxes
- [x] Per-section preview tuning libs + `*PreviewContext.tsx` components
- [x] New sections: `Contact-v1`, `Reviewbox-v1`, `Spacer`, `Hero-v2.1`, scaffold `*A` variants
- [x] Expanded `lib/section-registry.tsx` (spacer, reviewbox, contact groups)
- [x] `app/home/page.tsx` dev preview route

### Contact / email
- [x] `app/api/leads/route.ts` — Resend + reCAPTCHA
- [x] `components/contact/*`, `RecaptchaProvider.tsx`
- [x] `lib/send-lead-email.ts`, `email-config.ts`, `recaptcha-*`
- [x] `.env.local.example` + docs (`docs/email.md`, `recaptcha.md`, `resend-setup.md`)

### Shared infrastructure
- [x] Updated dev components (`CreativeBar`, `PreviewShell`, `SectionSwitcher`, etc.)
- [x] Updated layout sections (Header-v3, Footer-v3, Services-v1, Portfolio-v1, etc.)
- [x] `public/lsd/**`, portfolio assets, Reviewbox demo assets
- [x] `docs/NEW-CLIENT.md`, expanded `AGENTS.md`

## What was kept Spartan-specific

- [x] `config/site.ts` — Spartan branding, contacts, domain, `brandTitleLines: ["Spartan", "Restoration"]`
- [x] `public/Spartan-Logo-1.JPG`
- [x] Spartan under-construction CSS tokens in `app/globals.css` (gold/blue, not LifeSpring purple)
- [x] `lib/seo-content.ts` — Spartan UC metadata + contact summary in description
- [x] `app/robots.ts` — blocks placeholder routes + playground/preview
- [x] `app/sitemap.ts` — only `/` while `launch.mode === "under-construction"`
- [x] `next.config.ts` — `X-Robots-Tag` on playground/preview
- [x] `app/playground/layout.tsx`, `app/preview/layout.tsx` — noindex metadata
- [x] `@vercel/analytics` in `app/layout.tsx`
- [x] `vercel.json`, Node `>=24`, package name `spartan-restoration`
- [x] `lib/color-themes.ts` — default theme `spartan`
- [x] `lib/homepage-config.json` — starts with `colorThemeId: "spartan"`

## How to use the new workflow

1. Run locally: `npm run dev`
2. Open `/playground` — drag sections, toggle **Preview** checkboxes, tune colors/fonts
3. Open `/preview` — see only checked sections
4. Click **Publish to /** (dev only) — writes `homepage-config.json`, sets `launch.mode` to `"live"`
5. Visit `/` — live published homepage
6. Click **Back to construction** to revert

## Optional setup (contact form)

Copy `.env.local.example` → `.env.local` and add Resend + reCAPTCHA keys. See `docs/resend-setup.md`.

## Still demo / LifeSpring content

`lib/demo-content.ts` and playground JSON-LD still use OSP/trade-washing demo copy from the starter. Replace with Spartan content when building the full site in playground.
