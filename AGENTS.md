<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LifeSpring Starter — agent notes

**New client clone:** read **`docs/NEW-CLIENT.md`** first (identity, integrations, soft launch, publish).

| Task | Doc |
|------|-----|
| Client setup | `docs/NEW-CLIENT.md` |
| Contact email (Resend) | `docs/resend-setup.md` |
| reCAPTCHA | `docs/recaptcha.md` |
| SEO / go-live | `docs/SEO.md` |
| Env template | `.env.local.example` |

**Key behavior:** `/` is under construction until **Publish to /** on `/playground` (dev only) writes `lib/homepage-config.json` and sets `config/site.ts` → `launch.mode` to `"live"`. Contact form → `POST /api/leads` → Resend (+ optional reCAPTCHA).
