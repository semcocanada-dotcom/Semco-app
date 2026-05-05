# Semco App — Handoff Summary

## Project Overview
A React Native (Expo SDK 51) iOS app for managing Saskatchewan's **$8,000/year ASD-IF (Autism Spectrum Disorder Individualized Funding)** grant. Built for a single parent account managing multiple children, each with their own $8,000 grant. Stack: Expo + expo-router, TypeScript, NativeWind, Supabase (auth + database + storage + edge functions).

---

## Repository
- **Repo:** `semcocanada-dotcom/semco-app`
- **Active branch:** `claude/autism-grant-app-eUE6R`
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

### 2. Government Email Submission — WAITING ON RESPONSE
The user emailed `autismif@gov.sk.ca` asking for permission to submit monthly claims by email (batch format) rather than through their one-at-a-time web portal. The email also asked whether their portal has an API for direct integration.

**If approved:** User provides:
- Resend API key (from resend.com)
- A verified sender email/domain
- Government receiving email address

Then set these as Supabase Edge Function environment secrets:
```
RESEND_API_KEY=re_xxxx
GOVT_EMAIL=autismif@gov.sk.ca
FROM_EMAIL=Autism Fund Tracker <noreply@yourdomain.com>
```
Then deploy: `supabase functions deploy submit-claim`

**If rejected:** Pivot to portal automation — `autismfunding.saskatchewan.ca` is a single-page app (`#/expensesubmit`). Inspect its network requests to find the underlying API endpoint. If found, the app can submit directly and receive the official Exp Batch # confirmation automatically.

---

## Next Steps (Priority Order)

1. **Run `supabase/monthly_claims.sql`** in Supabase SQL Editor (Claims tab broken without this)
2. **Receipt filename sanitizer** — Saskatchewan portal rejects filenames containing numbers. When uploading receipts to Supabase Storage, strip/replace numbers from the filename before saving
3. **Expense PDF form** — Same as the mileage PDF but for therapy/equipment expenses. Build a filled expense claim form using expo-print
4. **Portal API investigation** — Inspect network requests on `autismfunding.saskatchewan.ca` to find the API endpoint behind the submission form. If found, submit directly from the app and capture the Exp Batch # confirmation number
5. **Store that Exp Batch # in the app** — Add a `batch_number` field to `monthly_claims` table. After submission user can enter it; the claim card then shows the official confirmation number
6. **Apple Sign In** — Deferred to App Store release. Needs ASC API key to set up provisioning profile with the entitlement
7. **App Store submission** — Production EAS profile needs ASC API key for non-interactive CI builds

---

## Government Advocacy Status
User has contacted SK government (`autismif@gov.sk.ca`) requesting email batch submission approval. Key arguments made in the email:
- Portal requires 10+ individual submissions per month (one per expense)
- Mileage requires manual calculation, file renaming (no numbers allowed in filenames), manual entry
- Email batch submission is easier for government staff to process than individual portal entries
- User built the app at personal expense; it standardizes every submission
- Asked specifically whether the portal has an API or bulk upload option

If government says no at the program level, next step is escalating to the user's MLA (contact info not yet looked up).

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
