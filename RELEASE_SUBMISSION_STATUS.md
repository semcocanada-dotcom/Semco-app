# Semco Pro Release Submission Status

Last updated: 2026-08-12

## Release Goal

Publish Semco Pro 1.0.2 with the updated Liquid Membrane rules, SIP cleaner planning, and national supplier routing.

## Application

- App name: Semco Pro
- Marketing version: 1.0.2
- Next iOS build: 25 (production auto-increment from live build 24)
- Next Android version code: 23 (production auto-increment from code 22)
- iOS bundle identifier: com.semcocanada.semcopro
- Apple app ID: 6790031528
- Expo project: @kitzul88/semco-pro
- Expo project ID: cc9001d8-b1f9-44b2-b59c-c7b35d8c6129

## Implemented for Version 1.0.2

- Liquid Membrane can be omitted for non-wet walls when the selected substrate/system permits it.
- Wet walls and showers force the standard two-coat Liquid Membrane system; pools/submerged work force the four-coat system.
- SIP Type A-E preparation selection recommends the correct ordered cleaner passes and dilution ratios.
- Cleaner quantity ranges, 1/5-gallon package plans, and current national prices are included in estimates.
- Ontario/eastern material requests route to Modern Arc; Manitoba/western requests route to Innovative Finishes.
- Both suppliers use the same Semco Canada national price catalog.

- Immediate permanent in-app account deletion, including private files and associated account data.
- Versioned customer authorization before project customer data is collected or synced.
- Customer-facing authorization before sign-off fields/signature are collected; the audit notice is stored with the record and PDF.
- The iOS system photo picker is used without requesting broad Photos-library permission; camera access is requested only after a camera action.
- Semco Guide is installed and deterministic; remote AI, Firebase AI, semantic retrieval, and cloud conversation sync were removed.
- Native administrator, dealer-portal, assistant-debug, rewards, prize, and travel-promotion routes were removed.
- The nonfunctional microphone affordance was removed.
- App version and runtime are aligned to the new App Store Connect version 1.0.2.

## Verified Backend State

- Project customer-consent columns are live.
- The hardened delete-account function is deployed and JWT-protected.
- The legacy semantic-search endpoint is a JWT-protected 410 tombstone and is not referenced by the mobile app.
- The dedicated installer reviewer account authenticates successfully and contains a fictional sample project/calculation.
- National dealer routing is deployed. All 13 provinces/territories passed verification, with zero mismatched routable profiles or active material requests.

## Local Validation

Pre-build release verification completed on 12 August 2026:

- Jest: 16 suites / 112 tests passed.
- TypeScript: passed.
- ESLint: passed with zero warnings.
- Clean iOS Expo export: passed.
- Clean Android Expo export: passed.
- Phone-layout visual checks passed for dry-wall optional, wet-area required, submerged required, and invalid wet drywall states.

## Release Actions

- Verify `https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy` in mobile Safari immediately before submission and use the same URL in the app and App Store Connect.
- Build fresh iOS 1.0.2 and Android 1.0.2 production binaries.
- Reuse the current truthful calculator/Guide screenshots or replace them only if App Store Connect requires a new set.
- Complete clean-install iPhone and iPad smoke tests for login, project sync, photo/camera denial, calculations, sign-off PDF upload, material request, and account deletion with a disposable account.
- Verify the Apple Developer seller/legal entity is authorized to publish the official Semco Canada app and retain written trademark/content authorization.
- Add the 1.0.2 What’s New text, attach the processed build, and submit the update to App Review.
- Upload the Android App Bundle when the Innovative Finishes Inc. Google Play organization account is ready.

See `APP_STORE_CONNECT_ANSWERS.md` for the final metadata, Guideline 3.2 explanation, review path, privacy-label inventory, and reviewer-account handling.
