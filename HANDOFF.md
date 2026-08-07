You are an expert React Native / TypeScript / Supabase architect continuing development on a production iOS/Android app for Saskatchewan families tracking an ASD-IF funding amount they enter from their actual approval.

## Stack
- Expo SDK 51 · React Native · TypeScript · Supabase (project ref `wowlxyxaltgxbbsbcxao`, ca-central-1)
- Release branch: `agent/fix-autism-review-login`; legacy CI and GitHub Pages still follow `claude/autism-grant-app-eUE6R`.
- Path aliases: `@lib/* @components/* @hooks/* @context/* @constants/*`
- Secrets in `.env` via `app.config.ts`. Copy `.env.example` → `.env` to run locally.
- Dev: `npx expo start` → press `a` for Android emulator / scan QR with Expo Go (iPhone)
- Screenshot: `adb exec-out screencap -p > screen.png`

## Must pass before every commit
```
npx tsc --noEmit
npm run lint
npm test
npx expo export --platform ios
```

## Architecture

```
app/(tabs)/
  index.tsx        Dashboard: greeting, BudgetRing rainbow arc, stat cards, recent expenses
  expenses.tsx     Expense logging, receipt camera/PDF, OCR, FABs, edit modal
  mileage.tsx      Month nav, km/$ stats, Add Trip, trip list, Export Worksheet → independent PDF
  respite.tsx      Respite tab: Workers list, Log Session, Export Worksheet → independent PDF
  appointments.tsx Calendar / reminders
  providers.tsx    Official Saskatchewan registry link + private provider records
  profile.tsx      Parent profile and account/privacy controls
  reports.tsx      Hidden (href:null), accessible from Profile

components/        BudgetRing, AppLogo, StatCard, FAB, ChildSelector, ExpenseListItem,
                   AlertBanner

lib/
  supabase.ts      SecureStore-backed auth — NEVER revert to AsyncStorage
  types.ts         All DB interfaces incl. RespiteWorker + RespiteSession
  pdfForms.ts      Generates unbranded expense, mileage, and respite recordkeeping worksheets.
                   No Saskatchewan government PDF, Crown logo, or wordmark is bundled or reproduced.
  ocr.ts           Receipt OCR → amount + provider matching
  mileageUtils.ts  Receipt analysis + private-provider matching; distance is manual
  providerMatcher  Fuzzy provider matching from OCR text
  textMatch.ts     Pure normalize/similarity helpers (unit tested)
  notifications.ts Appointment reminders

hooks/             useBudget, useChildren, useExpenses, useAppointments
context/           AuthContext (session+profile), ChildContext (activeChild)
constants/         colors.ts (purple #7C5CFC, bg #FAF8FF), mileage.ts (SK rates)
```

## DB Tables (all RLS-secured, mirrored in supabase/schema.sql)
- `profiles` · `children` · `funding_years` · `expenses` · `providers`
- `mileage_logs` (reimbursement_amount is a generated column — never set it)
- `appointments` · legacy `monthly_claims` (deletion compatibility only; no app route/client)
- `respite_workers` (parent_id-scoped: name, phone, default_rate_per_hour, notes)
- `respite_sessions` (child_id-scoped: session_date, provider_name, provider_phone,
  hours, rate_per_hour, amount_paid, worker_id FK→respite_workers)

## How Respite works
Workers are added once (parent-level, reusable). When logging a session, pick a worker
from a chip picker → name, phone, and default rate all auto-fill → enter date + hours →
amount calculates automatically. On save: inserts into respite_sessions AND creates a
matching recorded expense so the budget ring counts it. The existing database enum value is an internal compatibility detail and is never presented as a government decision.
Export Worksheet generates an independent, unbranded respite record worksheet for the selected month.
It is prominently labeled unofficial and is not submitted to the government.
Open Official Respite Form launches the untouched PDF hosted on publications.saskatchewan.ca externally.

## How Mileage PDF works
Mileage tab "Export Worksheet" generates an independent, unbranded mileage record worksheet.
Trips auto-populate from logged data, and the trip-purpose column comes from the description
the user typed when logging. The worksheet is prominently labeled unofficial and is not a
Government of Saskatchewan form or submission.
Open Official Mileage Form launches the untouched PDF hosted on publications.saskatchewan.ca externally.

### Done
1. ✅ Mileage trip description now auto-composes from the selected provider as
   "Speech & Language — Pathways Clinic, Saskatoon" (category — name, city). It pre-fills the
   editable "Purpose of Travel" field on provider select and is the save-time fallback.
2. ✅ Respite worker in-place editing — pencil icon on each worker card expands an inline
   edit form pre-filled with current values; Save issues a Supabase UPDATE.
3. ✅ ChildSelector added to the Respite tab header (shown for multi-child families).
4. ✅ Removed the embedded Saskatchewan government forms and all Crown logo/wordmark
   reproductions. PDF exports are independent Autism Fund Tracker worksheets with prominent
   non-affiliation and unofficial-form notices. Do not add government artwork or form copies
   without documented reproduction permission; factual links to the official portal are fine.
5. ✅ Verified — 'respite' is already in expenses.tsx CATEGORY_CONFIG and the picker.

## Security invariants — never break
1. Never commit/use service_role key in app code (edge function only)
2. Never disable RLS or write USING (true) on a data table
3. New table → RLS + owner-scoped policy before it holds data
4. New view → security_invoker = on
5. receipts bucket is private — createSignedUrl only, never getPublicUrl
6. Auth stays on SecureStore adapter in lib/supabase.ts
7. Mirror every DB migration into supabase/schema.sql

## Conventions
- No dead code, no speculative abstractions, minimal comments (only non-obvious why)
- TextInput inside FlatList → put in a static header component (RN keyboard-dismiss bug)
- Commit messages: imperative, concise, no model/tooling identity
- Design: purple #7C5CFC, bg #FAF8FF, rounded cards, soft purple shadows

## Supabase MCP
Project ref: wowlxyxaltgxbbsbcxao
Use apply_migration for DDL (not execute_sql). Run get_advisors after schema changes.

## GitHub
Repo: semcocanada-dotcom/semco-app
Push release work to `agent/fix-autism-review-login`. Fast-forward
`claude/autism-grant-app-eUE6R` only after the release commit passes every gate,
because that branch remains the legacy CI and GitHub Pages source.
