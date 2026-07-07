# Resend — get contact email working

**Agents:** when the user asks how to set up email, start here. Minimal steps only. Technical details → [`docs/email.md`](./email.md).

Contact form → `POST /api/leads` → **Resend** → inbox at `siteConfig.email` (or `CONTACT_LEAD_TO`).

---

## Testing locally (5 minutes)

1. **Resend account** — [resend.com](https://resend.com) → sign up → **API Keys** → create key.

2. **`.env.local`** (copy from `.env.local.example` if needed):
   ```bash
   RESEND_API_KEY=re_...
   ```
   Optional if recipient isn’t `siteConfig.email`:
   ```bash
   CONTACT_LEAD_TO=you@your-resend-signup-email.com
   ```

3. **Restart dev server** — `npm run dev` (env only loads on start).

4. **Submit the contact form** on `/playground` or `/preview`.

5. **Confirm delivery** — [resend.com/emails](https://resend.com/emails)

### Sandbox limits (no custom domain yet)

| Setting | Value |
|---------|--------|
| **From** (automatic) | `onboarding@resend.dev` |
| **To** | Must be allowed by Resend — often the email on your Resend account, or set `CONTACT_LEAD_TO` |
| **Looks like** | Sender shows Resend, not your brand — normal until step below |

---

## Production (custom domain — the norm)

1. **Resend → Domains** → add the site domain (e.g. `lifespringdesign.com`).

2. **DNS** — add the TXT/MX records Resend shows; wait until verified.

3. **Env** (`.env.local` + hosting dashboard):
   ```bash
   RESEND_API_KEY=re_...                                    # same agency key is fine
   CONTACT_LEAD_FROM=LifeSpring Design <contact@lifespringdesign.com>
   CONTACT_LEAD_TO=josh@lifespringdesign.com                  # optional — defaults to config/site.ts email
   ```

4. **Restart / redeploy** and test again.

Emails will come **from your domain**, not `onboarding@resend.dev`.

---

## Cloning this starter for another site

| What | Action |
|------|--------|
| `RESEND_API_KEY` | Usually **same** on every clone (one Resend account) |
| `config/site.ts` → `email` | Set who receives leads for that client |
| `CONTACT_LEAD_FROM` | That client’s verified from address |
| Resend dashboard | Add the client’s domain (or use one key with all domains listed) |

---

## Env cheat sheet

| Variable | Required? | Default if empty |
|----------|-----------|------------------|
| `RESEND_API_KEY` | Yes (for real email) | No email sent; form still succeeds in dev |
| `CONTACT_LEAD_TO` | No | `siteConfig.email` |
| `CONTACT_LEAD_FROM` | No | `onboarding@resend.dev` |

---

## Something wrong?

| Problem | Fix |
|---------|-----|
| Form works, no email | `RESEND_API_KEY` missing or server not restarted |
| 500 on submit | Sandbox: wrong `CONTACT_LEAD_TO` or bad `CONTACT_LEAD_FROM` before domain verified |
| From shows `onboarding@resend.dev` | Expected until domain verified + `CONTACT_LEAD_FROM` set |
| Wrong inbox | Set `CONTACT_LEAD_TO` or update `config/site.ts` → `email` |

Logs: dev terminal `[LifeSpring Lead email]` · dashboard [resend.com/emails](https://resend.com/emails)

---

## Code map (don’t duplicate — see `docs/email.md`)

- `lib/email-config.ts` — env + defaults
- `lib/send-lead-email.ts` — sends via `resend` npm package
- `app/api/leads/route.ts` — API called by the form
