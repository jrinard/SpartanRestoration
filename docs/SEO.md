# SEO & Brand Launch Guide

Use this document when taking a **playground theme + section stack** and shipping it as a **real client site**.

---

## Status: SEO infrastructure in place

The starter now includes:

- **`lib/seo-content.ts`** — per-page titles/descriptions + trade-demo copy for JSON-LD
- **`lib/seo-schema.ts`** — Organization, WebSite, LocalBusiness schema builders
- **`lib/seo.ts`** — metadata factory with Open Graph + Twitter images
- **`components/seo/JsonLd.tsx`** — structured data components
- **HeroWashing h1** — sr-only (v1) or visible (v2)
- **`<main id="main-content">`** on preview home pages and scaffold routes
- **`robots.ts`** — disallows `/playground` and `/preview`
- **Service anchor fix** — `#organic-growth` matches footer links
- **Theme-aware testimonial/ticker colors** — uses CSS variables

---

## Brand swap checklist (in order)

### 1. Site identity — `config/site.ts`

| Field | SEO use |
|-------|---------|
| `name` | Title, Open Graph, logo alt, schema |
| `domain` / `url` | Canonical, sitemap, robots |
| `description` | Default meta description |
| `phone`, `email`, `address` | NAP, LocalBusiness schema |
| `social.*` | `sameAs` in schema (replace `#` placeholders) |
| `assets.ogImage` | Default Open Graph / Twitter image |

### 2. Page copy — `lib/seo-content.ts`

Update `pageSeo` for each route and `tradeDemoSeo` for trade-services demos.

### 3. Section copy — `lib/demo-content.ts`

All playground section text — headlines, services, testimonials, footer links.

### 4. Section wiring — production homepage

Copy `HomePage` sections without `SectionSwitcher`. Ensure exactly **one `<h1>`** per page.

### 5. Images

Replace `public/` logos and add a **1200×630** `public/og.jpg` (update `assets.ogImage`).

### 6. Go live

- Remove `noIndex` from root layout / homepage metadata
- Update `app/sitemap.ts` with final routes
- Verify JSON-LD in [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## File reference

| Purpose | Path |
|---------|------|
| Site config | `config/site.ts` |
| Page SEO copy | `lib/seo-content.ts` |
| Schema builders | `lib/seo-schema.ts` |
| Metadata factory | `lib/seo.ts` |
| JSON-LD components | `components/seo/JsonLd.tsx` |
| Section demo copy | `lib/demo-content.ts` |
| Sitemap | `app/sitemap.ts` |
| Robots | `app/robots.ts` |

---

## Future agent prompt

```
Launch [CLIENT NAME] from lifespring-starter:

1. Update config/site.ts (NAP, domain, nav, social, ogImage)
2. Update lib/seo-content.ts page descriptions
3. Replace lib/demo-content.ts with client copy
4. Build production homepage (no SectionSwitcher)
5. Remove noIndex from /
6. Add public/og.jpg
7. Verify one H1 per page, footer anchors match section ids

See docs/SEO.md
```
