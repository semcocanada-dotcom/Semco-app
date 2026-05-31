# Changelog

## Audit & Cleanup Pass

A focused audit to bring the app to a clean, stable, production-ready state.
No UX redesign or folder restructure — bug fixes, reliability, dead-code
removal, tooling, and SQL consolidation only.
## 2026-05-31
- OTA: Respite tab + 6-tab layout + auto-update on foreground
### Fixed
- **`app.json` invalid JSON**: removed a trailing comma in the `plugins`
  array that broke strict JSON parsing (surfaced once `app.config.ts` was
  added; would also break other strict tooling).
- **`home_postal_code` schema drift**: the app reads/writes
  `profiles.home_postal_code` but no repo migration created it. Added
  `supabase/add_home_postal_code.sql`, recorded the (idempotent) migration on
  the live Supabase project, and folded the column into `schema.sql`. The
  column already existed in the live DB, so no production data was affected.
- **`lib/geocoding.ts`**: `tryGeocode` and `getDrivingDistanceKm` now check
  `res.ok` before parsing JSON, preventing unhandled rejections on HTTP errors.
- **`context/AuthContext.tsx`**: `getSession()` now awaits `fetchProfile`
  before clearing `loading`, removing a post-login window where `profile`
  was briefly `null`.
- **Data hooks** (`useBudget`, `useChildren`, `useExpenses`,
  `useAppointments`): wrapped fetches in `try/catch/finally` so a thrown
  network error can no longer leave `loading` stuck `true` with stale state.
- **`lib/supabase.ts`**: warns once if `supabaseUrl`/`supabaseAnonKey` are
  missing instead of silently constructing a broken client.

### Removed (dead code)
- `app/(tabs)/expenses.tsx`: the never-updated `filter` state, the unused
  `FilterType`/`FILTERS`, the no-op `filtered` derivation, and an unreferenced
  `filter` style. List now renders `expenses` directly.
- `lib/mileageUtils.ts`: unused `PARALLEL_54` export (code uses
  `PARALLEL_54_LATITUDE` from `@constants/mileage`).
- Unused imports: `SectionList` & `cancelNotification` (appointments),
  unused `err` binding (claims), `useCallback` (profile), `Platform`
  (reports), `Colors` (AlertBanner), `View` (StatCard).
- Dependencies: `@expo/vector-icons` and `expo-status-bar` (zero imports).

### Changed (structure)
- Extracted pure helpers `normalize`/`similarity` from
  `lib/providerMatcher.ts` into a dependency-free `lib/textMatch.ts` so they
  are unit-testable without the Supabase/RN import chain.
- `supabase/schema.sql` is now the single source of truth: profile address
  columns, provider `organization`/`postal_code`/`notes`, and the
  `monthly_claims` table/RLS are folded in. Incremental `add_*.sql` /
  `monthly_claims.sql` files are kept for history.

### Added
- `app.config.ts` + `.env.example`: secrets resolve from environment
  variables (EAS/CI/`.env`) with fallback to `app.json` so existing builds
  keep working.
- ESLint (`eslint`, `eslint-config-expo`, `.eslintrc.js`) + `npm run lint`.
- Jest (`jest-expo`, `jest`) + `npm test` with unit tests for the mileage
  rate selection and the fuzzy-match helpers.
- `.gitignore`: generated `nativewind-env.d.ts` / `expo-env.d.ts`.

### Verification
- `npx tsc --noEmit` — 0 errors
- `npm test` — 8/8 passing
- `npm run lint` — 0 errors (8 behavioral warnings intentionally left)
- `npx expo export --platform ios` — bundles successfully (1587 modules)

## Security Hardening Pass

Adversarial review focused on protecting children's health card numbers and
PII. Core RLS data-isolation was already correct; these close the gaps an
attacker would actually exploit against the (public) anon key.

### Database (applied live + folded into `schema.sql`)
- **Provider directory no longer client-writable**: split the `FOR ALL`
  policy so global rows (`parent_id IS NULL`) are read-only; INSERT/UPDATE/
  DELETE restricted to the owner. Closes a phishing vector (an attacker
  could rewrite "approved provider" phone/email/website for all families).
- **`handle_new_user()` `EXECUTE` revoked** from `anon`/`authenticated`/
  `PUBLIC` — removes a publicly-callable `SECURITY DEFINER` RPC.
- **`set_updated_at()`** pinned with `SET search_path = ''`.
- **Receipts bucket**: created the correct **private** `receipts` bucket
  (code/policy casing mismatch meant uploads were broken and would have
  tempted a "make it public" fix that exposes every medical receipt). RLS
  on `storage.objects` confirmed default-deny.
- Supabase security advisors: **4 → 1** warnings.

### Code
- **Receipts**: `uploadReceipt` now stores the private object **path**
  instead of `getPublicUrl(...)`. Viewers must mint short-lived signed URLs.
- **Session tokens**: replaced plaintext `AsyncStorage` with an encrypted,
  chunked `expo-secure-store` adapter (Keychain/Keystore) — defeats token
  theft from a lost/rooted device or Android backup extraction.
- **`submit-claim` edge function** (not yet deployed): all interpolated
  email fields HTML-escaped (was HTML-injectable); health card, line items
  and totals re-derived from the DB under verified ownership instead of
  trusting the client; CC restricted to the caller's own account email
  (was an authenticated open email relay); generic error responses.

### Manual follow-ups (cannot be done in-repo)
- **Enable Supabase "Leaked Password Protection"** (Auth settings) — last
  remaining security advisor; protects against credential-stuffing →
  account takeover → child health data.
- **Delete the stray empty `Receipts` bucket** in the Storage dashboard
  (Storage API blocks SQL deletion; it is empty + private so not exposed).
- Add a privacy policy / DPAs for third-party PII egress (Google Vision OCR
  receives receipt images; Nominatim/OSRM receive the child's home address).
  Prefer proxying OCR server-side so the API key never ships on-device.
- Native rebuild required (adds `expo-secure-store`); existing logged-in
  users will re-authenticate once (session moves stores).
- **Rotate the Google Vision API key** in `app.json` — it is in git history;
  restrict it by API + app and move the value to an EAS/CI env var.
- Full native EAS build + on-device testing (camera/OCR, location,
  notifications, calendar) still required.
- `submit-claim` edge function deploy remains pending (out of scope).
