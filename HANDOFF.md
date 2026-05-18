# Semco App — Handoff Document

---

## RULES FOR THIS SESSION — READ FIRST

1. **One task at a time.** Complete it, commit, push, then STOP.
2. **Wait for user approval** before starting the next task. Do not chain tasks.
3. **No parallel work.** No "while I'm at it" additions. Scope = exactly what was asked.
4. **Test before reporting done.** Run `npx tsc --noEmit` after every change. Zero errors required.
5. **Update HANDOFF.md** at the end of each session to reflect what changed and what's next.

---

## Project Overview

React Native (Expo SDK 51) iOS app for managing Saskatchewan's **$8,000/year ASD-IF (Autism Spectrum Disorder Individualized Funding)** grant. Single parent account, multiple children, each with their own $8,000 grant per year.

**Stack:** Expo + expo-router 3.5, TypeScript, Supabase, expo-location

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
- **⚠️ Native rebuild pending (2026-05-18):** expo-location added. User MUST install the new native build from expo.dev — OTA alone will not include location support.

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
    _layout.tsx             — 5 tabs: Home 🏠 Expenses 🧾 Calendar 📅 Providers 📍 Mileage 🚗 Profile 👤
                              (Claims tab exists but is hidden via href:null)
    index.tsx               — Dashboard: rainbow arc budget, mileage pill, greeting, location permission prompt
    expenses.tsx            — Expense logging, receipt camera/PDF, OCR, FABs
                              🚗 FAB → navigates to /(tabs)/mileage
                              ＋ FAB → add expense (OCR auto-fills amount, provider, mileage)
    mileage.tsx             — Dedicated Mileage tab: month navigator, km/$ stats,
                              Add Trip modal (provider search + auto-distance), trip list
    claims.tsx              — Monthly Claims: grouped by month, submit to SK portal, batch # field, expense PDF
    appointments.tsx        — Calendar / appointment reminders (1hr / 2hr / day before)
    providers.tsx           — Provider directory: location-sorted, category pills, Call/Email/Book,
                              Approved badge, km distance shown per card, Maps directions in detail
    profile.tsx             — Parent profile (home address required for mileage fallback)

lib/
  supabase.ts               — Supabase client
  types.ts                  — All TypeScript types
  mileageUtils.ts           — SK rates: SOUTHERN $0.6410/km, NORTHERN $0.6910/km
                              analyseReceipt(uri, mimeType) — works for images AND PDFs
                              buildMileageProposal(home, provider, ocrAddress?) — OCR address priority
  pdfForms.ts               — SK mileage PDF + SK expense claim PDF generators
  ocr.ts                    — Google Vision OCR: images via images:annotate, PDFs via files:annotate
  providerMatcher.ts        — Provider fuzzy-match from OCR business name
  geocoding.ts              — Nominatim geocoding with rural SK fallback + OSRM driving distance
  notifications.ts          — Push notifications with configurable offset (1hr/2hr/day before)

context/
  AuthContext.tsx            — Session + profile (.catch+.finally so loading always resolves)
  ChildContext.tsx           — Active child state, persisted to AsyncStorage

constants/
  colors.ts                 — Pastel palette, purple #7C5CFC, bg #FAF8FF

supabase/
  schema.sql                — Full DB schema
  monthly_claims.sql        — ⚠️ NOT YET RUN — must run in Supabase SQL Editor
  functions/submit-claim/   — Edge Function: email claim via Resend (not yet deployed)
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
- All TextInputs in FlatList must go in static header, not `ListHeaderComponent` (keyboard dismiss bug)
- `gap` works (RN 0.74.5+)
- Apple Sign In removed — deferred to App Store release
- OCR requires `app.json extra.googleVisionApiKey` — gracefully skipped when not set

---

## Location Permission Flow

1. **First launch:** dashboard detects permission = 'undetermined' → shows `LocationPermissionModal`
2. Modal explains: "used for mileage auto-fill AND finding nearby providers"
3. User taps "Allow" → system dialog fires
4. **Providers tab:** reads existing permission (no dialog) → GPS if granted → geocode `home_city` as fallback
5. Providers sorted by Haversine distance using hardcoded SK city centroids
6. Each card shows "• X.X km away"

---

## Receipt OCR & Mileage Flow

1. User takes photo or picks PDF receipt
2. Google Vision extracts: business name, address, amount
   - Images → `images:annotate` (sync, base64)
   - PDFs → `files:annotate` (sync, base64, page 1 only)
3. Business name fuzzy-matched against providers DB
4. If confident match (score ≥ 0.45): provider auto-selected, mileage auto-calculated
5. Mileage destination priority: **OCR receipt address** → DB provider address → city fallback

---

## Completed Tasks

### ✅ TASK 0 — Splash Screen Fix
- `AuthContext.tsx`: `.catch(() => {}).finally(() => setLoading(false))` — loading always resolves
- `_layout.tsx`: try/catch around `SplashScreen.hideAsync()` + 5s timeout fallback to login

### ✅ TASK 2 — Receipt Filename Sanitizer
- `sanitizeReceiptFilename()` strips digits from filenames before SK portal upload

### ✅ TASK 3 — Expense PDF Form
- `generateAndShareExpensePdf()` in `lib/pdfForms.ts`
- "📄 SK Form PDF" button in Claims detail modal

### ✅ TASK 4 — Exp Batch # Field
- `batch_number TEXT` column (in `monthly_claims.sql`)
- Editable in Claims detail modal — saves on blur

### ✅ TASK 4c — Maps Directions in Provider Directory
- "🗺️ Directions" chip on provider cards → Apple Maps (iOS) / Google Maps (Android)
- Location row in detail modal is tappable

### ✅ TASK 4d — PDF Receipt OCR
- PDFs go through Google Vision `files:annotate` (same zero-input flow as photos)
- Response nested at `responses[0].responses[0].fullTextAnnotation.text`

### ✅ TASK 4e — OCR Address as Mileage Destination
- When provider has no DB address, OCR receipt address used as destination
- Priority: OCR address → DB address → city fallback

### ✅ TASK 5a — Appointment Reminder Timing
- User picks reminder offset: 1 hr / 2 hrs / day before
- Push notification title changes dynamically: "Tomorrow:" / "In 2 hours:" / "In 1 hour:"
- Calendar alarm uses same offset (`relativeOffset: -reminderOffset`)

### ✅ TASK 6 — Dashboard Polish
- **Rainbow arc budget ring:** 5 SVG bands (red→orange→yellow→green→blue), animated progress dot
- **Time-aware greeting:** Good Morning/Afternoon/Evening + motivational tagline
- **Mileage pill row** below the arc showing total mileage reimbursement for active year
- Removed old 4-stat cards (stats now inside the ring)

### ✅ TASK 7 — Dedicated Mileage Tab
- `app/(tabs)/mileage.tsx`: month navigator (‹ ›), km total + dollar total stats card
- Add Trip modal: date, provider search, auto-distance calc via OSRM, round-trip toggle, notes
- Trip list: provider name, date, km, reimbursement per trip
- Claims tab hidden from tab bar (`href: null`); Mileage tab added in its place
- 🚗 FAB on Expenses screen now navigates to Mileage tab

### ✅ TASK 8 — Providers Screen Redesign
- Hero header: large "Providers" title + "Find approved services and supports near you. 💙"
- Category pills collapse to top 4 + "More ∨" toggle
- Cards: icon circle (category colour), category label in colour, ✅ Approved Provider badge, Call/Email/Book buttons, chevron
- Section header: "Nearby Approved Providers" with location label
- Footer banner: 🛡️ "All providers are approved by the Autism Funding Program."

### ✅ TASK 9 — Location-Sorted Providers
- `expo-location` installed; iOS permission string added to `app.json`
- First-launch prompt on dashboard explains why (mileage + providers) before system dialog
- Providers sorted nearest-first using Haversine distance + hardcoded SK city centroids
- Falls back to `profile.home_city` geocoded via Nominatim if GPS denied

---

## Pending Tasks

### ⚠️ TASK 1 — DB Migration (User action required)
Run in **Supabase SQL Editor** → paste `supabase/monthly_claims.sql`
Claims tab crashes without the `monthly_claims` table + `batch_number` column.

### ⏳ TASK 4b — Provider Addresses CSV Import
- 447/457 providers have `address = null`
- ChatGPT agent scraping SK site for addresses spreadsheet
- When ready: paste spreadsheet here → Claude writes SQL UPDATE script

### ⏳ TASK 10 — Portal API / Email Submission
- User emailed `autismif@gov.sk.ca` requesting email batch submission or API access
- If approved: user provides Resend API key → deploy `submit-claim` edge function
- If rejected: escalate to MLA

### ⬜ TASK 11 — Google Vision API Key (Final Testing)
- Add to `app.json extra.googleVisionApiKey` when ready to test OCR
- Without it: OCR silently skipped, manual entry required
- Free tier: 1,000 requests/month

### ⬜ TASK 12 — Apple Sign In
- Deferred to App Store release
- Needs ASC API key for EAS provisioning

---

## Recent Commits (this session)

```
35dce48  feat: location-sorted providers with first-setup permission prompt
7ddd9b5  feat: redesign Providers screen to match reference UI
0eac0a1  feat: add dedicated Mileage tab with trip logging
70ef65d  feat: dashboard polish — rainbow arc, greeting, mileage pill, motivational tagline
...
```

---

## Session Checklist (run at start of every session)

```bash
git status                          # should be clean
npx tsc --noEmit                    # should be zero errors
git log --oneline -5                # confirm you're on the right branch
```
