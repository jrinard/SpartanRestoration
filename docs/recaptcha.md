# reCAPTCHA Enterprise — LifeSpring contact form

**Agents / future devs:** read this before changing anything under `lib/recaptcha-*`, `components/forms/Recaptcha*`, or contact-form verification in `app/api/leads/route.ts`.

This starter is **cloned per client/site**. reCAPTCHA has **no hardcoded keys** — only env vars.

**You do not need a new Google Cloud project per client.** One project (e.g. `retrospect-173717`) can serve every clone.

---

## One GCP project for all clients (recommended)

Use a **single** Google Cloud project for LifeSpring and all customer sites.

| Env var | Per clone? | Notes |
|---------|------------|--------|
| `RECAPTCHA_PROJECT_ID` | **No** — same everywhere | Your one GCP project ID |
| `RECAPTCHA_API_KEY_SECRET` | **No** — same everywhere | One secret or `AIzaSy` API key for the project |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | **Depends** — see below | Site key shown in the browser |

### Option A — One reCAPTCHA key, all domains (simplest clones)

1. One score-based key in your project
2. Add **every** client domain + `localhost` to that key’s domain list
3. **Same three env vars on every clone** — copy `.env.local` as-is, zero reCAPTCHA changes per site

Google allows many domains per key (up to 250; more with allow-all-domains + hostname checks).

### Option B — One key per client, same project (cleaner isolation)

1. Still **one** `RECAPTCHA_PROJECT_ID` and **one** `RECAPTCHA_API_KEY_SECRET` on every clone
2. Create a separate reCAPTCHA **site key** per client in the **same** project
3. Only swap `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` per clone; add that client’s domains to **their** key

Server verification uses the project-level credential — it works with any site key in that project.

---

## Cloning for a new site

1. Copy the env template:
   ```bash
   cp .env.local.example .env.local
   ```
2. Set shared agency values once (same on every clone):
   ```bash
   RECAPTCHA_PROJECT_ID=retrospect-173717      # your GCP project
   RECAPTCHA_API_KEY_SECRET=...                # your project secret or AIzaSy API key
   ```
3. Per client (Option B only): new site key in Cloud Console → update `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and add their domains to that key. Option A: add their domain to the shared key, no env change.
4. Restart dev server or redeploy with the same hosting env vars.
5. Leave all three blank to **disable** reCAPTCHA on a clone (form still works).

**Same codebase everywhere:** `contact_form` action, verification logic, and form UI are identical.

---

Google is migrating reCAPTCHA to **Fraud Defense** in Google Cloud. The **siteverify** server path still works today but will likely be retired — plan to use the **assessments API** long term.

---

## What we use

| Layer | Technology |
|-------|------------|
| **Browser** | reCAPTCHA Enterprise v3 — `enterprise.js` + `grecaptcha.enterprise.execute()` |
| **Form** | `ContactForm` → token on submit |
| **API** | `POST /api/leads` → `verifyRecaptchaToken()` in `lib/recaptcha-server.ts` |
| **Action name** | `contact_form` (defined in `lib/recaptcha-config.ts`) — alphanumeric + underscores only |

---

## Environment variables (`.env.local`, gitignored)

Template: **`.env.local.example`** (committed — copy per clone).

```bash
# Public site key — Integration tab on the reCAPTCHA key in Cloud Console
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# Google Cloud project ID (project picker at top of Cloud Console)
RECAPTCHA_PROJECT_ID=

# Server credential — see "Two server paths" below
RECAPTCHA_API_KEY_SECRET=

# Optional — defaults to contact_form if unset
# RECAPTCHA_ACTION=contact_form
```

If `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is empty, reCAPTCHA is disabled (form still submits; verification skipped).

---

## Two server verification paths

`RECAPTCHA_API_KEY_SECRET` format selects the path automatically in `lib/recaptcha-server.ts`:

### Path A — Secret key + siteverify (current default)

- **Value format:** `6Le...` / `6Len...` (secret key from key → **Integration** tab)
- **Endpoint:** `https://www.google.com/recaptcha/api/siteverify`
- **Works with:** Enterprise client tokens today
- **Risk:** Google may deprecate this endpoint — migrate to Path B when siteverify stops working

### Path B — Cloud API key + assessments API (preferred long term)

- **Value format:** `AIzaSy...` (API key from **APIs & Services → Credentials**)
- **Also requires:** `RECAPTCHA_PROJECT_ID` + **reCAPTCHA Enterprise API enabled** on the project
- **Endpoint:** `POST https://recaptchaenterprise.googleapis.com/v1/projects/{PROJECT_ID}/assessments?key={API_KEY}`
- **This is what Google’s Fraud Defense docs describe as the supported REST path**

To migrate: replace `RECAPTCHA_API_KEY_SECRET` with an `AIzaSy...` key. No code changes needed — routing is automatic.

---

## Google Cloud setup checklist

1. [Security → reCAPTCHA](https://console.cloud.google.com/security/recaptcha) — create a **score-based (v3)** web key
2. **Domains:** add `localhost`, production domain(s) — no scheme, path, or port (e.g. `localhost` not `localhost:3000`)
3. Copy **site key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
4. For Path A: copy **secret key** (Integration tab) → `RECAPTCHA_API_KEY_SECRET`
5. For Path B:
   - Enable [reCAPTCHA Enterprise API](https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com)
   - Create API key → `RECAPTCHA_API_KEY_SECRET`
   - Set `RECAPTCHA_PROJECT_ID`

---

## Key files

| File | Role |
|------|------|
| `docs/recaptcha.md` | This doc |
| `lib/recaptcha-config.ts` | Site key, action name, `isRecaptchaEnabled()` |
| `lib/recaptcha-server.ts` | Server verification (siteverify + assessments) |
| `components/forms/RecaptchaProvider.tsx` | Loads `enterprise.js`, exposes `executeRecaptcha()` |
| `components/forms/ContactForm.tsx` | Gets token, posts to `/api/leads` |
| `app/api/leads/route.ts` | Validates token, accepts lead payload |
| `app/layout.tsx` | Wraps app in `RecaptchaProvider` |
| `types/recaptcha.d.ts` | `window.grecaptcha.enterprise` types |

---

## Local testing

1. Restart dev server after env changes: `npm run dev`
2. Open contact modal or Contact section on `/playground` or `/preview`
3. Submit form — success message means client + server both passed
4. **DevTools → Network:** `enterprise.js` should load; `POST /api/leads` should return `{ success: true }`
5. On failure, check terminal for `[reCAPTCHA] siteverify` or `[reCAPTCHA] enterprise` logs

Common issues:

- **"reCAPTCHA could not load"** — domain not on key, ad blocker, or script blocked
- **"reCAPTCHA verification failed"** — wrong server credential type (secret vs `AIzaSy` API key), API not enabled, or action mismatch

---

## Production (Vercel / hosting)

Set the same env vars in the host dashboard **per clone/deployment** (mirror `.env.local.example`). Add that site’s production domains to its reCAPTCHA key. Prefer Path B (assessments + `AIzaSy` API key) for new deployments.

---

## When siteverify is retired

1. Create a Google Cloud API key (`AIzaSy...`)
2. Enable reCAPTCHA Enterprise API on the project
3. Set `RECAPTCHA_API_KEY_SECRET` to the API key (not the `6Len...` secret)
4. Confirm `RECAPTCHA_PROJECT_ID` is set
5. Remove or gate `verifyViaSiteverify()` in `lib/recaptcha-server.ts` once Google confirms deprecation

Until then, both paths remain in code intentionally.
