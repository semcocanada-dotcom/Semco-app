# Semco Pro Release Submission Status

Last updated: 2026-08-07

## Release Goal

Replace rejected iOS version 1.0 build 22 with a fully tested installer-only build and resubmit after all external requirements are complete.

## Application

- App name: Semco Pro
- Marketing version: 1.0
- Next iOS build: 23 or later (production auto-increment from build 22)
- iOS bundle identifier: com.semcocanada.semcopro
- Apple app ID: 6790031528
- Expo project: @kitzul88/semco-pro
- Expo project ID: cc9001d8-b1f9-44b2-b59c-c7b35d8c6129

## Implemented for the Replacement Build

- Immediate permanent in-app account deletion, including private files and associated account data.
- Versioned customer authorization before project customer data is collected or synced.
- Customer-facing authorization before sign-off fields/signature are collected; the audit notice is stored with the record and PDF.
- The iOS system photo picker is used without requesting broad Photos-library permission; camera access is requested only after a camera action.
- Semco Guide is installed and deterministic; remote AI, Firebase AI, semantic retrieval, and cloud conversation sync were removed.
- Native administrator, dealer-portal, assistant-debug, rewards, prize, and travel-promotion routes were removed.
- The nonfunctional microphone affordance was removed.
- App version and runtime are aligned to the active App Store Connect version 1.0.

## Verified Backend State

- Project customer-consent columns are live.
- The hardened delete-account function is deployed and JWT-protected.
- The legacy semantic-search endpoint is a JWT-protected 410 tombstone and is not referenced by the mobile app.
- The dedicated installer reviewer account authenticates successfully and contains a fictional sample project/calculation.

## Local Validation

Final release verification completed on 7 August 2026:

- Jest: 12 suites / 41 tests passed.
- TypeScript: passed.
- ESLint: passed with zero warnings.
- Deno checks: delete-account, privacy-policy, and the disabled embed-and-search tombstone passed.
- Clean iOS Expo export: passed with 2,057 modules and 113 assets.
- Generated bundle scan: no executable remote-AI/retrieval, reward/prize, portal/admin, or microphone feature remained.
- Bundle SHA-256: `34C85DB37E5F5C8DF0B10C39AB48E464F001879CD1356F92E6F0C70723089644`.

## Required Before Build and Submission

- Verify `https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy` in mobile Safari immediately before submission and use the same URL in the app and App Store Connect.
- Replace all eight July screenshots. They show stale Ask Semco AI/reward/microphone content and cannot be reused.
- Capture new iPhone and iPad screenshots from the exact final build using only fictional data.
- Complete clean-install iPhone and iPad smoke tests for login, project sync, photo/camera denial, calculations, sign-off PDF upload, material request, and account deletion with a disposable account.
- Verify the Apple Developer seller/legal entity is authorized to publish the official Semco Canada app and retain written trademark/content authorization.
- Update App Store Connect privacy labels, review notes, URLs, reviewer credentials, and the replacement build, then obtain fresh confirmation immediately before saving/submitting.

See `APP_STORE_CONNECT_ANSWERS.md` for the final metadata, Guideline 3.2 explanation, review path, privacy-label inventory, and reviewer-account handling.
