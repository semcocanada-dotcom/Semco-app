You are an expert React Native / TypeScript / Supabase architect continuing development on a production iOS/Android app for Saskatchewan families tracking the $8,000/yr ASD-IF autism funding grant.

## Stack
- Expo SDK 51 · React Native · TypeScript · Supabase (project ref `wowlxyxaltgxbbsbcxao`, ca-central-1)
- Active branch: `claude/autism-grant-app-eUE6R`
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
  mileage.tsx      Month nav, km/$ stats, Add Trip, trip list, Export Invoice → official SK AcroForm PDF
  respite.tsx      Respite tab: Workers list, Log Session, Export Invoice → official SK AcroForm PDF
  appointments.tsx Calendar / reminders
  providers.tsx    Provider directory: search, category pills, Call/Email/Book
  profile.tsx      Parent profile (home address for mileage)
  reports.tsx      Hidden (href:null), accessible from Profile
  claims.tsx       Hidden (href:null), never built

components/        BudgetRing, AppLogo, StatCard, FAB, ChildSelector, ExpenseListItem,
                   AlertBanner, AddressAutocomplete

lib/
  supabase.ts      SecureStore-backed auth — NEVER revert to AsyncStorage
  types.ts         All DB interfaces incl. RespiteWorker + RespiteSession
  pdfForms.ts      fillAndShareOfficialMileagePdf + fillAndShareOfficialRespitePdf
                   (fill real SK government AcroForm PDFs bundled in assets/forms/)
  geocoding.ts     tryGeocode + getDrivingDistanceKm
  ocr.ts           Receipt OCR → amount + provider matching
  mileageUtils.ts  SK rate lookup by latitude + year
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
- `appointments` · `monthly_claims`
- `respite_workers` (parent_id-scoped: name, phone, default_rate_per_hour, notes)
- `respite_sessions` (child_id-scoped: session_date, provider_name, provider_phone,
  hours, rate_per_hour, amount_paid, worker_id FK→respite_workers)

## How Respite works
Workers are added once (parent-level, reusable). When logging a session, pick a worker
from a chip picker → name, phone, and default rate all auto-fill → enter date + hours →
amount calculates automatically. On save: inserts into respite_sessions AND creates a
matching expense (category='respite', status='approved') so the budget ring counts it.
Export Invoice fills the official SK ASD-IF Respite AcroForm PDF for the selected month.

## How Mileage PDF works
Mileage tab "Export Invoice" calls fillAndShareOfficialMileagePdf() which fills the real
SK ASD-IF Mileage AcroForm PDF. Trips auto-populate from logged data. The "Purpose of
Travel" field comes from the trip description the user typed when logging.

## Open follow-ups (priority order)
1. Mileage trip description — blank when user doesn't type one. Should auto-compose from
   provider/appointment context: "Speech & Language — Pathways Clinic, Saskatoon"
2. Respite worker edit — workers can be added/deleted but not edited in-place
3. ChildSelector missing from Respite tab header (other tabs have it for multi-child families)
4. AcroForm field names not yet device-tested — add try/catch guards around each
   form.getTextField() call in pdfForms.ts so mismatches are debuggable
5. Expense category picker in expenses.tsx may not show 'respite' — verify and add
6. claims.tsx is dead code — build it out or delete it

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
Use mcp__github__* tools — no gh CLI available. Push to claude/autism-grant-app-eUE6R
and open a draft PR when work is complete.
