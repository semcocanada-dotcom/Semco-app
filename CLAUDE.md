# CLAUDE.md — Semco / Autism Fund Tracker

> Context for Claude Code sessions. Read this first.

## What this is
Expo **SDK 51** / React Native / TypeScript / Supabase **iOS app** for tracking
Saskatchewan's **ASD-IF autism funding program** (one parent account,
multiple children, each with their own grant). Handles **children's health card
numbers and PII** — treat data protection as critical.

- **Release branch:** `agent/fix-autism-review-login`; legacy CI and GitHub Pages still follow `claude/autism-grant-app-eUE6R`, so fast-forward that branch only after the release commit is verified.
- **Supabase project ref:** `wowlxyxaltgxbbsbcxao` (region ca-central-1)
- Secrets come from `.env` via `app.config.ts` (fallback to `app.json`). Copy
  `.env.example` → `.env` locally.

## Dev / visual loop (Windows + Android emulator or iPhone Expo Go)
```
npm install
npx expo start            # press 'a' = Android emulator, or scan QR with Expo Go (iPhone)
```
Claude can see the UI on an **Android emulator**:
```
adb exec-out screencap -p > screen.png   # then read screen.png
```
iOS Simulator is macOS-only — for true iOS fidelity use Expo Go on a real
iPhone and review screenshots. Expo Go (SDK 51) supports every native module
this app uses, so no dev build is needed for design work.

## Must pass before every commit
```
npx tsc --noEmit          # 0 errors (hard requirement)
npm run lint              # 0 errors (8 known behavioral warnings are OK)
npm test                  # all green
npx expo export --platform ios   # bundles with no resolver errors
```

## Architecture
```
app/(auth)/login.tsx        Email/password login (only place AppLogo is used)
app/(tabs)/
  _layout.tsx               Tab bar: Home Expenses Calendar Providers Mileage (Profile via header)
  index.tsx                 Dashboard: greeting + BudgetRing rainbow arc + stat cards + recent expenses
  expenses.tsx              Expense logging, receipt camera/PDF, OCR, FABs
  mileage.tsx               Mileage tab: manual distance/rate entry, month nav, km/$ stats
  providers.tsx             Private provider records + official Saskatchewan registry link
  appointments.tsx          Calendar / reminders
  profile.tsx               Parent profile and account/privacy controls
components/                 BudgetRing (SVG rainbow arc), AppLogo (SVG), StatCard,
                            AlertBanner, FAB, ChildSelector, ExpenseListItem
lib/                        supabase.ts (SecureStore-backed auth), types.ts,
                            ocr.ts, mileageUtils.ts, providerMatcher.ts, textMatch.ts (pure),
                            pdfForms.ts, notifications.ts
hooks/                      useBudget, useChildren, useExpenses, useAppointments
context/                    AuthContext (session+profile), ChildContext (active child)
constants/                  colors.ts, mileage.ts (SK rates + getRateForLatitude)
  supabase/                   schema.sql is the SINGLE SOURCE OF TRUTH (RLS, policies,
                            buckets, and legacy deletion-compatible tables). The former
                            submit endpoint is a non-networked HTTP 410 tombstone.
__tests__/                  Jest unit tests (pure logic only)
```
Path aliases: `@lib/* @components/* @hooks/* @context/* @constants/*`

## Design intent (the 3 reference mockups)
Clean, friendly, pastel; purple `#7C5CFC`, bg `#FAF8FF`; rounded cards, soft shadows.
- **Home:** "Good Evening, <name> 💙", "Annual Grant Progress" card with a
  **rainbow arc** (BudgetRing) + % pill, Remaining/Recorded/Mileage Estimate/Total Grant,
  three summary cards, Recent Expenses list.
- **Providers:** official Government of Saskatchewan registry link plus private,
  user-created provider records. The app does not reproduce the public directory.
- **Mileage:** hero, "This Month" card (km + recorded mileage estimate + rate
  badge), Add Trip button, Recent Trips list, secure footer.

**Current visual gap:** layout/copy match the mockups, but hero illustrations
and the brand mark are **emoji/SVG placeholders** (`🏥`, `🚗`, `🌈`). The
mockups show rendered illustrations (clinic-house, car-on-road) and a 4-colour
**puzzle-heart** logo not yet in the app (`assets/` has only icon/splash/
favicon). Closing this is the main design task: build SVG illustrations + a
puzzle-heart logo component used across tab headers, and tinted category icons.
Do **not** restructure screens or change flows — only elevate visuals.

## SECURITY INVARIANTS — do not break (verified secure; data isolation proven)
1. **Never** commit/ship the `service_role` key or use it in app code (it
   bypasses RLS). Only the edge function reads it from env.
2. **Never** disable RLS or write a `USING (true)` policy on a data table.
   Run Supabase security advisors after any schema change.
3. New table → enable RLS + owner-scoped policy before it holds data.
4. New view → `security_invoker = on`. New `SECURITY DEFINER` function →
   `SET search_path` + `REVOKE EXECUTE FROM anon, authenticated`.
5. `receipts` bucket stays **private**. Store object paths; read via
   short-lived `createSignedUrl` — never `getPublicUrl`.
6. Keep Supabase auth on the **SecureStore** adapter in `lib/supabase.ts`
   (never revert to AsyncStorage). Secrets stay in `.env`, never in git.
7. Mirror every applied DB migration into `supabase/schema.sql`.

## Conventions
- No dead code, no speculative abstractions, minimal comments (only non-obvious why).
- `mileage_logs.reimbursement_amount` is a generated column — never set it.
- TextInputs in FlatList go in a static header (RN keyboard-dismiss bug).
- Commit messages: imperative, concise; do not mention model/tooling identity.
- See `CHANGELOG.md` for what the audit/security pass changed and open follow-ups.
