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

**Stack:** Expo + expo-router 3.5, TypeScript, Supabase

---

## Repository & Branch

- **Repo:** `semcocanada-dotcom/semco-app`
- **Branch:** `claude/autism-grant-app-eUE6R` — all work goes here, no exceptions
- **Push command:** `git push -u origin claude/autism-grant-app-eUE6R`

---

## Deployment

- **OTA updates:** Every push auto-triggers `eas update` via GitHub Actions (~30 sec to deploy)
- **Native rebuild:** Commit a change to the `BUILD_TRIGGER` file → triggers full EAS native build (~15 min)
- **Install on device:** expo.dev → install preview build (NOT TestFlight)
- **EXPO_TOKEN:** stored in GitHub Actions secrets
- **⚠️ Native rebuild pending:** A new build was triggered on 2026-05-18. User must install from expo.dev before OTA updates will work.

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
    index.tsx               — Dashboard: budget ring, stat cards, child selector, always shows mileage stat
    expenses.tsx            — Expense + mileage logging, receipt camera/PDF, OCR, FABs
                              🚗 FAB → mileage log history modal
                              ＋ FAB → add expense (OCR auto-fills amount, provider, mileage)
    claims.tsx              — Monthly Claims: grouped by month, submit to SK portal, batch # field, expense PDF
    appointments.tsx        — Calendar/appointments
    providers.tsx           — Provider directory, city/category filter, search, Maps directions
    profile.tsx             — Parent profile (home address required for mileage)

lib/
  supabase.ts               — Supabase client + db helpers
  types.ts                  — All TypeScript types
  mileageUtils.ts           — SK rates: SOUTHERN $0.6410/km, NORTHERN $0.6910/km
                              analyseReceipt(uri, mimeType) — works for images AND PDFs
                              buildMileageProposal(home, provider, ocrAddress?) — OCR address takes priority
  pdfForms.ts               — SK mileage PDF + SK expense claim PDF generators
  ocr.ts                    — Google Vision OCR: images via images:annotate, PDFs via files:annotate
  providerMatcher.ts        — Provider fuzzy-match from OCR business name
  geocoding.ts              — Nominatim geocoding with rural SK fallback (city+postal → city-only)
  notifications.ts          — Push notifications

context/
  AuthContext.tsx            — Session + profile state (.catch+.finally so loading always resolves)
  ChildContext.tsx           — Active child state, persisted to AsyncStorage

constants/
  colors.ts                 — Pastel palette, purple #7C5CFC, bg #FAF8FF

supabase/
  schema.sql                — Full DB schema
  monthly_claims.sql        — ⚠️ NOT YET RUN — must run in Supabase SQL Editor (adds monthly_claims table + batch_number column)
  functions/submit-claim/   — Edge Function: email claim via Resend API (not yet deployed)
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
- OCR requires `app.json extra.googleVisionApiKey` — gracefully skipped when not set

---

## Receipt OCR & Mileage Flow

1. User takes photo or picks PDF receipt
2. Google Vision extracts: business name, address, amount
   - Images → `images:annotate` (sync, base64)
   - PDFs → `files:annotate` (sync, base64, page 1 only)
3. Business name fuzzy-matched against providers DB
4. If confident match (score ≥ 0.45): provider auto-selected, mileage auto-calculated
5. Mileage destination priority: **OCR receipt address** → DB provider address → city fallback
6. Mileage shown as round trip with toggle to include/exclude

---

## Task Queue

### TASK 0 — Splash Screen Fix
**Status:** ✅ DONE
- `AuthContext.tsx`: `.catch(() => {}).finally(() => setLoading(false))` — loading always resolves
- `_layout.tsx`: try/catch around `SplashScreen.hideAsync()` + 5s timeout fallback to login

---

### TASK 1 — DB Migration (User runs this, not Claude)
**Action:** Open Supabase → SQL Editor → paste and run `supabase/monthly_claims.sql`
**Why:** Claims tab crashes without the `monthly_claims` table. Also adds `batch_number` column.
**Status:** ⚠️ NOT DONE — do this before testing the Claims tab

---

### TASK 2 — Receipt Filename Sanitizer
**Status:** ✅ DONE
- `sanitizeReceiptFilename()` in `expenses.tsx` strips all digits, collapses separators, falls back to 'receipt'
- SK government portal rejects filenames with numbers

---

### TASK 3 — Expense PDF Form
**Status:** ✅ DONE
- `generateAndShareExpensePdf()` in `lib/pdfForms.ts`
- "📄 SK Form PDF" button in Claims detail modal (expenses section)

---

### TASK 4 — Exp Batch # Field
**Status:** ✅ DONE
- `batch_number TEXT` column in `supabase/monthly_claims.sql`
- Editable text input in Claims detail modal — saves to DB on blur
- Stores the "Exp Batch #000___" confirmation number from the SK portal

---

### TASK 4b — Provider Addresses CSV Import
**Status:** ⏳ WAITING ON SPREADSHEET
- 447/457 providers in DB have `address = null`
- ChatGPT agent scraping SK government website for addresses
- When spreadsheet arrives: paste here → Claude writes SQL UPDATE script
- Workaround active: OCR reads address from receipt and uses it for mileage

---

### TASK 4c — Maps Directions in Provider Directory
**Status:** ✅ DONE
- "🗺️ Directions" chip on every provider card (if address or city exists)
- Location row in detail modal is tappable → Apple Maps (iOS) / Google Maps (Android)

---

### TASK 4d — PDF Receipt OCR
**Status:** ✅ DONE
- PDFs now go through Google Vision `files:annotate` instead of being skipped
- Same zero-input flow as photos: provider matched, mileage calculated, amount filled
- Requires Google Vision API key (deferred to final testing stage)

---

### TASK 5 — Portal API Investigation
**Status:** ⬜ NOT STARTED — waiting on government email response
- Portal at `autismfunding.saskatchewan.ca/#/expensesubmit` is a single-page app
- Goal: find underlying API to submit directly and get Exp Batch # automatically

---

### TASK 6 — Government Email Submission
**Status:** ⏳ WAITING ON GOVERNMENT RESPONSE
- User emailed `autismif@gov.sk.ca` requesting permission for email batch submission
- When approved: user provides Resend API key + verified sender domain → deploy `submit-claim` edge function

---

### TASK 7 — Apple Sign In
**Status:** ⬜ DEFERRED TO APP STORE RELEASE
- Needs ASC API key for EAS provisioning profile entitlement

---

### TASK 8 — Google Vision API Key Setup
**Status:** ⬜ DEFERRED TO FINAL TESTING
- Add key to `app.json` under `extra.googleVisionApiKey`
- Without it: OCR silently skipped, all fields must be entered manually
- Free tier: 1,000 requests/month (sufficient for personal use)

---

## Government Advocacy Status

User sent an email to `autismif@gov.sk.ca` arguing for email batch submission:
- 10+ portal submissions per month per family
- Manual mileage calculation + file renaming burden
- Asked if portal has an API for direct integration

If rejected → escalate to user's MLA (not yet looked up).

---

## Recent Commits

```
3d28086  feat: provider address opens Apple Maps / Google Maps
7d5a50e  feat: OCR support for PDF receipts — extract address, amount, business name
6d45631  chore: trigger native rebuild — install fresh from expo.dev
62f9ea1  fix: use OCR receipt address as mileage destination when provider has no DB address
f130f6b  fix: simplify expenses UX — remove filter pills, add mileage log view
39e4f98  feat(TASK 3): expense PDF form — SK ASD-IF monthly expense claim
47a580d  fix(ci): pin eas-cli@18.13.0, safe multiline commit message handling
dc57c60  fix: city required minimum for mileage — enforce in profile + expenses
8a1edef  fix: geocoding fallback for rural/unrecognized SK street addresses
88b5ef0  feat(TASK 4): Exp Batch # field on submitted claims
```

---

## Session Checklist (run at start of every session)

```bash
git status                          # should be clean
npx tsc --noEmit                    # should be zero errors
git log --oneline -5                # confirm you're on the right branch
```
