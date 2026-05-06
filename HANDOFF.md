# Semco App — Handoff Summary

## Project Overview
A React Native (Expo SDK 51) iOS app for managing Saskatchewan's **$8,000/year ASD-IF (Autism Spectrum Disorder Individualized Funding)** grant. Built for a single parent account managing multiple children, each with their own $8,000 grant. Stack: Expo + expo-router, TypeScript, NativeWind, Supabase (auth + database + storage + edge functions).

---

## Repository
- **Repo:** `semcocanada-dotcom/semco-app`
- **Active branch:** `claude/continue-project-SpBVZ` (merged from `claude/autism-grant-app-eUE6R`)
- **All development must stay on this branch**

---

## Deployment Setup
- **Native builds:** EAS Build (preview profile, internal distribution — install from expo.dev, NOT TestFlight)
- **Live OTA updates:** Every push to the branch automatically triggers `eas update` via GitHub Actions (~30 seconds to deploy)
- **BUILD_TRIGGER file:** Committing a change to this file triggers a full native rebuild instead of OTA update
- **EXPO_TOKEN** is stored in GitHub Actions secrets
- **Supabase project ID:** `6300fb3b-12f9-4b5c-9d1d-66dba1f328ee`
- **Supabase URL:** `https://wowlxyxaltgxbbsbcxao.supabase.co`

---

## App Structure
```
app/
  (auth)/login.tsx          — Email/password login (Apple Sign In removed, deferred to App Store)
  (tabs)/
    _layout.tsx             — 6 tabs: Home 🏠 Expenses 🧾 Claims 📤 Calendar 📅 Providers 📍 Profile 👤
    index.tsx               — Dashboard with budget ring, stat cards, child selector
    expenses.tsx            — Full expense + mileage logging with receipt camera, OCR, FABs
    claims.tsx              — Monthly Claims (NEW)
    appointments.tsx        — Calendar/appointments
    providers.tsx           — Provider directory with city filter + search
    profile.tsx             — Parent profile
lib/
  supabase.ts               — Supabase client + db helpers (includes monthlyClaims())
  types.ts                  — All TypeScript types including MonthlyClaim
  mileageUtils.ts           — SK mileage rates (SOUTHERN: $0.6410/km, NORTHERN: $0.6910/km)
  pdfForms.ts               — Official SK mileage invoice PDF generator
  ocr.ts, providerMatcher.ts, geocoding.ts, notifications.ts
context/
  AuthContext.tsx, ChildContext.tsx
supabase/
  schema.sql                — Full DB schema
  monthly_claims.sql        — ⚠️ NEEDS TO BE RUN in Supabase SQL Editor
  functions/submit-claim/index.ts — Supabase Edge Function for email submission
```

---

## Key Features Built

### Core (Working)
- Multi-child support, each with their own $8,000 funding year
- Expense logging with camera receipt capture + Google Vision OCR auto-fill
- Mileage logging with auto-calculation at SK government rates
- Budget ring dashboard showing spent/pending/remaining
- Provider directory pre-seeded with ~50 SK autism providers, city filter, search
- Appointments/calendar tab with device calendar sync

### Expense Entry Improvements (Done — branch `claude/continue-project-SpBVZ`, PR #2)
- **"Scan Receipt or Invoice" card** is now the primary action at the top of the Add Expense modal — Camera / Gallery / File PDF buttons front and centre
- **Full OCR auto-fill**: after scanning, amount, date, provider name, and category all fill in automatically. Previously only the provider name was matched.
- **Date extraction**: `lib/ocr.ts` now parses dates from receipt text in ISO, NA (MM/DD/YYYY), European (DD/MM/YYYY), and written-month ("January 5, 2024") formats
- **Prominent add button**: "＋ Add Expense" gradient button in the screen header — no more hunting for the FAB
- **Empty-state CTA**: empty list shows a large "📷 Add First Expense" button
- **Filename sanitizer**: `sanitizeFilename()` strips all digits before upload to Supabase Storage (SK portal rejects filenames with numbers)

### Monthly Claims Tab (NEW — needs DB migration)
- Groups all expenses + mileage by month automatically
- List view: ✅ submitted months, 📋 ready months with totals
- Detail modal: itemized expense + mileage list
- **📄 SK Form PDF button** — generates the official Saskatchewan ASD-IF Monthly Mileage Invoice Form, pre-filled with all data, shareable via iOS share sheet
- **Submit Claim button** — calls Supabase Edge Function to email claim to government (blocked until email submission is approved — see Government Email section below)
- **+ Add Expense or Mileage button** — always visible, closes modal and navigates to Expenses tab

---

## Pending Setup Steps (Action Required)

### 1. Run in Supabase SQL Editor — CRITICAL
The Claims tab will not load until this is done. Open Supabase → SQL Editor → paste and run the contents of:
```
supabase/monthly_claims.sql
```

### 2. Government Email Submission — RESOLVED (different approach)
The user received a reply from `autismif@gov.sk.ca` (Jibina):
> "You are welcome to submit a whole year worth of the same type of appointment as one expense. Many families ask their service provider for a print out of all the appointments for their approval year and upload it as a single expense entry. Similarly for mileage you are welcome to enter one expense for the whole year of mileage."

**This changes the submission model:**
- Track individual expenses in the app throughout the year (for your own records and budget tracking — keep doing this)
- At year-end, get a printout from each provider → upload as a **single expense entry** per provider type
- For mileage → enter **one total mileage entry** for the whole year
- The app's year-end summary / totals view (future task) will make this easy

The Resend API / email submission edge function is now lower priority. The portal submission is manageable with the annual batch approach.

---

## Next Task — Mileage Calculation Bugs ⚠️ START HERE

**Problem:** When entering mileage (especially via provider auto-select from OCR), users are getting wrong distances or the same distance regardless of provider. The round-trip flag may also not be working correctly.

**What needs to be fixed and verified:**
1. **Geocoding accuracy** — `lib/geocoding.ts` uses OSRM open routing. Verify it correctly reads the user's home address from their profile and the provider's address/city. Log or surface the raw geocode result during testing to confirm the right coordinates are being used.
2. **Provider address data** — Many seeded providers only have a city, no street address. When only a city is available, the geocode destination is `"City, SK, Canada"` which may resolve to the city centre and give a plausible but imprecise result. Check whether this is causing the "same mileage" symptom.
3. **Round-trip logic** — The `is_round_trip` checkbox doubles the distance for display and saving. Confirm this is reflected correctly in both the mileage log record and the reimbursement calculation.
4. **Auto-mileage from OCR** — When a provider is auto-selected from a scanned receipt, `buildMileageProposal()` is called automatically. If the home address is missing from the profile, this silently fails. Confirm the failure is handled gracefully and the user is prompted to add their address.
5. **Rate selection** — SOUTHERN ($0.6410/km) vs NORTHERN ($0.6910/km) is determined by whether the provider is north of the 54th parallel. Verify this is correct for providers the user actually uses.

**Key files:**
- `lib/geocoding.ts` — geocodes addresses, calls OSRM for route distance, checks 54th parallel
- `lib/mileageUtils.ts` — `buildMileageProposal()` orchestrates geocoding → rate selection → proposal
- `app/(tabs)/expenses.tsx` — `tryMileage()` calls `buildMileageProposal()` after provider select; `MileageOnlyModal` for standalone mileage entry
- `constants/mileage.ts` — SK government rate constants

---

## Remaining Backlog (after mileage is fixed)

1. **Expense PDF form** — Same as the mileage PDF but for therapy/equipment expenses. Build a filled expense claim form using expo-print
2. **Year-end summary view** — A screen that groups all expenses by provider/category and shows annual totals, making it easy to prepare the single annual submission per provider type
3. **Apple Sign In** — Deferred to App Store release. Needs ASC API key for provisioning profile
4. **App Store submission** — Production EAS profile needs ASC API key for non-interactive CI builds

---

## Government Communication Status
- ✅ User emailed `autismif@gov.sk.ca` asking about batch/email submission and portal API
- ✅ Response received from Jibina (Autism IF SS): annual batch submission per provider type is allowed; one mileage entry for the whole year is also fine
- Submission model updated accordingly — see "Pending Setup Steps" above

---

## Important Technical Notes
- `supabase/functions/` is excluded from TypeScript compilation in `tsconfig.json` (Deno runtime, not Node)
- Mileage `reimbursement_amount` is a PostgreSQL generated column — never set it manually in queries
- **FlatList keyboard fix:** All search/filter UI must be placed OUTSIDE FlatList (not in `ListHeaderComponent`) — putting inputs inside ListHeaderComponent causes the keyboard to dismiss on every keystroke because the callback reference changes with state
- `gap` CSS property works (React Native 0.74.5+)
- Path aliases configured: `@lib/*`, `@components/*`, `@hooks/*`, `@context/*`, `@constants/*`
- Apple Sign In (`expo-apple-authentication`) was removed — the provisioning profile didn't include the entitlement and EAS can't regenerate it non-interactively without an ASC API key
- Google Sign In uses `expo-web-browser` (opens OAuth in browser, no native entitlement needed)

---

## Key Files Reference

| File | Purpose |
|---|---|
| `app/(tabs)/claims.tsx` | Monthly Claims screen — main new feature |
| `lib/pdfForms.ts` | Generates official SK mileage invoice PDF |
| `supabase/monthly_claims.sql` | ⚠️ Run this in Supabase SQL Editor |
| `supabase/functions/submit-claim/index.ts` | Edge Function — emails claim via Resend API |
| `lib/types.ts` | All DB + UI TypeScript types |
| `lib/supabase.ts` | Supabase client + all table helpers |
| `constants/colors.ts` | Design tokens — pastel purple/blue palette |
| `.github/workflows/eas-build.yml` | CI/CD — OTA update on every push, native build when BUILD_TRIGGER changes |
| `eas.json` | EAS build profiles (preview = internal, production = App Store) |
| `BUILD_TRIGGER` | Touch this file to trigger a full native rebuild |
