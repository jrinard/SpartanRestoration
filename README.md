# LifeSpring Starter

A **Next.js website starter** built by [LifeSpring Design](https://lifespringdesign.com) — the foundation used to design, preview, and launch client marketing sites that are fast, accessible, and search-engine friendly.

If you are evaluating LifeSpring for a new website, this repo reflects how projects are built: modular page sections, live design preview, and SEO handled from the start — not added as an afterthought.

---

## What you get

- **Flexible page sections** — headers, heroes, services, testimonials, calls-to-action, footers
- **Design preview** — try layouts, colors, and typography before launch
- **SEO-ready** — page metadata, sitemap, structured data for search engines
- **Simple configuration** — business name, contact info, navigation, and logos in one place

The live homepage (`/`) currently shows an under-construction screen while projects are in development.

---

## Tech stack

- **Next.js** (App Router) · **TypeScript** · **Tailwind CSS**
- Deployed on **Vercel**
- No database or paid services required to run locally

---

## Local setup

**Requirements:** Node.js 20+ and npm.

```bash
git clone <your-repo-url>
cd lifespring-starter
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # Production build
npm run start   # Run production build locally
npm run lint    # Lint
```

### Environment variables

The project runs without env vars by default. For future integrations (email, CRM, analytics), use `.env.example` as a template and keep secrets in a local `.env` file — never commit it.

---

## New client project

1. Update **`config/site.ts`** — business name, domain, contact info, navigation, logos
2. Replace copy and images in **`public/`**
3. Build out pages from the section components in **`components/sections/`**
4. Deploy to Vercel and connect the client’s domain

A detailed launch checklist (metadata, sitemap, go-live steps) lives in **`docs/SEO.md`**.

---

## Deployment

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set the production domain in Vercel and in `config/site.ts`

No API keys or secrets are needed for the default build.

---

## About LifeSpring Design

LifeSpring Design builds modern marketing websites for businesses that want a polished online presence without unnecessary complexity.

**Questions or want to hire?** [lifespringdesign.com](https://lifespringdesign.com)
