# Semco App — Handoff Document

---

## RULES FOR THIS SESSION — READ FIRST

1. **One task at a time.** Complete it, commit, push, then STOP.
2. **Wait for user approval** before starting the next task. Do not chain tasks.
3. **Maximum 100 lines changed per task.** If a task requires more, split it and ask.
4. **No parallel work.** No "while I'm at it" additions. Scope = exactly what was asked.
5. **Test before reporting done.** Run `npx tsc --noEmit` after every change. Zero errors required.
6. **Update HANDOFF.md** at the end of each session to reflect what changed and what's next.

---

## Project Overview

React Native (Expo SDK 51) iOS app for managing Saskatchewan's **$8,000/year ASD-IF (Autism Spectrum Disorder Individualized Funding)** grant. Single parent account, multiple children, each with their own $8,000 grant per year.

**Stack:** Expo + expo-router 3.5, TypeScript, NativeWind, Supabase

---

## Repository & Branch

- **Repo:** `semcocanada-dotcom/semco-app`
- **Branch:** `claude/autism-grant-app-eUE6R` — all work goes here, no exceptions
- **Push command:** `git push -u origin claude/autism-grant-app-eUE6R`

---

## Deployment

- **OTA updates:** Every push auto-triggers `eas update` via GitHub Actions (~30 sec to deploy)
- **Native rebuild:** Commit a change to the `BUILD_TRIGGER` file → triggers full EAS native build
- **Install on device:** expo.dev → install preview build (NOT TestFlight)
- **EXPO_TOKEN:** stored in GitHub Actions secrets

---

## Supabase

- **Project ID:** `6300fb3b-12f9-4b5c-9d1d-66dba1f328ee`
- **URL:** `https://wowlxyxaltgxbbsbcxao.supabase.co`
- **Anon key:** in `app.json` under `extra.supabaseAnonKey`

---

## App Structure

```
app/
  (auth)/login.tsx          — Email/password login
  (tabs)/
    _layout.tsx             — 6 tabs: Home 🏠 Expenses 🧾 Claims 📤 Calendar 📅 Providers 📍 Profile 👤
    index.tsx               — Dashboard: budget ring, stat cards, child selector
    expenses.tsx            — Expense + mileage logging, receipt camera, OCR, FABs
    claims.tsx              — Monthly Claims screen
    appointments.tsx        — Calendar/appointments
    providers.tsx           — Provider directory, city filter, search
    profile.tsx             — Parent profile

lib/
  supabase.ts               — Supabase client + db helpers
  types.ts                  — All TypeScript types
  mileageUtils.ts           — SK rates: SOUTHERN $0.6410/km, NORTHERN $0.6910/km
  pdfForms.ts               — Official SK mileage invoice PDF generator
  ocr.ts                    — Google Vision receipt OCR
  providerMatcher.ts        — Provider auto-match from OCR
  geocoding.ts              — Address geocoding
  notifications.ts          — Push notifications

context/
  AuthContext.tsx            — Session + profile state
  ChildContext.tsx           — Active child state, persisted to AsyncStorage

constants/
  colors.ts                 — Pastel palette, purple #7C5CFC, bg #FAF8FF

supabase/
  schema.sql                — Full DB schema
  monthly_claims.sql        — ⚠️ NOT YET RUN — must run in Supabase SQL Editor
  functions/submit-claim/   — Edge Function: email claim via Resend API
```

---

## Path Aliases

```
@lib/*        → ./lib/*
@components/* → ./components/*
@hooks/*      → ./hooks/*
@context/*    → ./context/*
@constants/*  → ./constants/*
```

---

## Key Technical Rules

- `supabase/functions/` excluded from TypeScript (Deno, not Node) — see `tsconfig.json`
- `reimbursement_amount` is a **PostgreSQL generated column** — never set it in queries
- All search/filter inputs must be placed **outside FlatList** — putting them in `ListHeaderComponent` causes keyboard to dismiss on every keystroke
- `gap` works (RN 0.74.5+)
- Apple Sign In removed — deferred to App Store release

---

## Task Queue — Work Through In Order

### TASK 1 — DB Migration (User does this, not Claude)
**Action:** Open Supabase → SQL Editor → run `supabase/monthly_claims.sql`
**Why:** Claims tab crashes without the `monthly_claims` table
**Status:** ⚠️ NOT DONE

---

### TASK 2 — Receipt Filename Sanitizer
**What:** When uploading a receipt photo to Supabase Storage, strip all numbers from the filename before saving.
**Why:** SK government portal rejects receipt files with numbers in the filename.
**Where:** `app/(tabs)/expenses.tsx` — find the upload function, sanitize filename before `storage.upload()`
**Rule:** Filename sanitize = replace any digit `[0-9]` with empty string, collapse double dashes/underscores.
**Status:** ⬜ NOT STARTED

---

### TASK 3 — Expense PDF Form
**What:** Generate a filled PDF for therapy/equipment expenses (not mileage).
**Why:** User needs a paper trail for non-mileage expenses too.
**Where:** Add a new export to `lib/pdfForms.ts` + wire a PDF button into the Claims detail modal expenses section (mirror the mileage PDF button already there).
**Status:** ⬜ NOT STARTED

---

### TASK 4 — Exp Batch # Field
**What:** After user submits through the government portal and receives their "Exp Batch #000___" confirmation, they should be able to type it into the app.
**Where:** 
1. `supabase/monthly_claims.sql` — add `batch_number TEXT` column (new SQL file)
2. `app/(tabs)/claims.tsx` — on submitted claim cards, show a text input to enter/display the batch number
**Status:** ⬜ NOT STARTED

---

### TASK 5 — Portal API Investigation
**What:** The government portal at `autismfunding.saskatchewan.ca/#/expensesubmit` is a single-page app. Research its network requests to find the underlying API endpoint. If found, the app could submit directly and receive the Exp Batch # automatically.
**Status:** ⬜ NOT STARTED — waiting on government email response first

---

### TASK 6 — Government Email Submission (waiting on approval)
**What:** Enable the Submit Claim button in `app/(tabs)/claims.tsx` to send via Resend API.
**Blocked by:** User emailed `autismif@gov.sk.ca` requesting permission for email batch submission. Awaiting response.
**When unblocked:** User provides Resend API key + verified sender domain. Set as Supabase Edge Function secrets, then deploy `submit-claim` function.
**Status:** ⏳ WAITING ON GOVERNMENT RESPONSE

---

### TASK 7 — Apple Sign In (App Store release)
**What:** Re-add `expo-apple-authentication`, set up ASC API key for provisioning.
**Why removed:** Provisioning profile didn't include the entitlement and EAS can't regenerate non-interactively without an ASC API key.
**Status:** ⬜ DEFERRED TO APP STORE RELEASE

---

## Government Advocacy Status

User sent an email to `autismif@gov.sk.ca` making the case for email batch submission instead of one-at-a-time portal entry. Arguments:
- 10+ portal submissions per month per family
- Manual mileage calculation + file renaming (no numbers allowed)
- Email batch is easier for government to process
- Asked if portal has an API for direct integration

If rejected → escalate to user's MLA (not yet looked up).

---

## Recent Commits

```
9460878  feat: Add Expense button in Claims detail modal always visible
a197ed2  feat: SK mileage PDF form generator + tsconfig Deno exclude
a7da6a5  feat: Monthly Claims — group expenses by month, one-tap submit to SK government
dde0db9  Trigger native build — embed expo-updates for live OTA updates
3539a72  Setup EAS Update for live OTA updates
b227701  Fix provider search keyboard, city filter, pre-fill mileage rate, always show FABs
```

---

## Session Checklist (run at start of every session)

```bash
git status                          # should be clean
npx tsc --noEmit                    # should be zero errors
git log --oneline -5                # confirm you're on the right branch
```
