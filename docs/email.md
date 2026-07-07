# Contact form email (Resend)

**Setup checklist (minimal):** [`docs/resend-setup.md`](./resend-setup.md) — read that first when enabling email on a new clone.

**Agents / future devs:** read this before changing `lib/send-lead-email.ts`, `lib/email-config.ts`, or email handling in `app/api/leads/route.ts`.

Submissions flow: **ContactForm** → **POST /api/leads** → reCAPTCHA verify → **Resend email** to the site owner.

---

## Clone-friendly setup

| Env var | Per clone? | Notes |
|---------|------------|--------|
| `RESEND_API_KEY` | Usually **no** | One Resend account for the agency |
| `CONTACT_LEAD_TO` | Optional | Defaults to `siteConfig.email` in `config/site.ts` |
| `CONTACT_LEAD_FROM` | Usually **yes** | Verified sending domain per client |

If `RESEND_API_KEY` is **empty**, the API still returns success and logs the lead in dev (no email sent). Set the key in production.

---

## Key files

| File | Role |
|------|------|
| `docs/resend-setup.md` | **Minimal setup checklist** |
| `docs/email.md` | This doc — reference + troubleshooting |
| `lib/email-config.ts` | Env helpers, defaults from site config |
| `lib/send-lead-email.ts` | Resend SDK wrapper + HTML/text body |
| `app/api/leads/route.ts` | reCAPTCHA + email after validation |
| `config/site.ts` | Default `email` recipient per clone |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Success in UI but no email | `RESEND_API_KEY` not set — check dev terminal for `[LifeSpring Lead]` log |
| 500 on submit | Wrong `CONTACT_LEAD_FROM`, unverified domain, or `CONTACT_LEAD_TO` not allowed in sandbox |
| Email goes to wrong person | Set `CONTACT_LEAD_TO` or update `siteConfig.email` |

Check the [Resend dashboard](https://resend.com/emails) for delivery logs and errors.
