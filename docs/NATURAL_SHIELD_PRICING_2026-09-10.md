# Natural Shield pricing update

Status: published to the production OTA channel for compatible iOS and Android installations using runtime 1.0.2 on 10 September 2026. Both downloadable production bundles match the verified local export. No physical-phone test was performed.

## Approved pricing

The user authorized using the same markup as other products after the email/quote search did not establish Mike's exact Natural Shield retail prices. Spreadsheet comparison confirmed a common 45% markup on dealer cost for the core catalog products. These are user-approved derived prices, not a claim that Mike quoted these exact values.

| Product | SKU | Retail price CAD |
| --- | --- | ---: |
| Natural Shield, 1-gallon pail | NAS501 | $211.70 |
| Natural Shield, 5-gallon pail | NAS505 | $838.55 |

The shared catalog supplies the same prices to Modern Arc and Innovative Finishes estimates. Existing prices, calculator coverage values, purchase-volume rounding and dealer routing are unchanged. Wholesale costs and customer quote documents are not included in the app assets.

## Quantity fix

The Natural Shield calculator layer stores purchased gallons, not a count of pails. The missing package mapping caused the estimate to show `60 x NATURAL-SHIELD`. It now uses the existing 1-/5-gallon package splitter.

The screenshot reproduction (9,800 sq ft pool, no waste, five fabric rolls) still requires 56 gallons and recommends purchasing 60 gallons. The estimate now correctly prices **12 x 5-gallon pails at $838.55 = $10,062.60**. All other material rows are unchanged. The material subtotal before separately selected pigment tint is $97,072.67.

Small jobs can display a 1-gallon pail. Saved six-gallon purchases split into one 5-gallon and one 1-gallon pail. Zero quantities add no charge. Genuinely unpriced products retain the pending-price warning and prevent an incomplete overall total from being presented as final.

Both calculator and order screens use the shared estimate card. The order email already uses the calculator's correct purchase label; no email-generation change was needed. The existing offline guide release is preserved.

## Verification

- Focused pricing and rendered estimate-card tests: 27 passed.
- Complete Jest suite: 34 suites / 352 tests passed.
- TypeScript: `npx tsc --noEmit` passed.
- ESLint: `npm run lint` passed.
- `git diff --check` passed; only Git's Windows line-ending notices were printed.
- Existing Jest output includes SafeAreaView deprecation and a VirtualizedList `act` warning in the assistant screen tests; no tests failed.
- Combined iOS/Android export: `.release-natural-shield-production-20260910`.
- Both platform asset lists are identical to the preceding production export. No private pricing evidence or customer quote files appear in the asset map.
- Shared UI tests confirm the correct line amount, complete subtotal, identical eastern/western prices and pending-price safeguards.
- No physical iPhone/Android interaction, account signup or order submission was performed for this pricing-only change.

## Publication

- Published at: `2026-09-10T23:34:43.143Z`.
- Channel / branch: `production` / `production`.
- Runtime: `1.0.2`, both platforms.
- Group: `a648116a-5a27-4043-93ed-700c8309bfe7`.
- iOS update: `01a08dac-6ec7-7446-8ecf-670a226a028b`.
- Android update: `01a08dac-6ec7-7189-9aa3-49f6c99646c5`.
- Message: `Natural Shield retail pricing and correct pail quantities`.
- Previous production group retained for rollback: `e4d76c32-ad22-4b59-9888-339796f7572e`.
- Published from the frozen export using `--skip-bundler`; mobile source did not change between export and publication.

At `2026-09-10T23:34:55.941Z`, the production client manifest returned both new update IDs. The verifier downloaded each launch bundle using Expo's supplied authorization headers and confirmed that its SHA-256 matched both the manifest and the tested local bundle. Authorization headers were not logged or saved.

| Platform | Downloaded bytes | SHA-256, base64url |
| --- | ---: | --- |
| iOS | 8,759,363 | `h45_Eut7i9OiesIf0d6ME0pMH1wxS0LbTNPJw0O2z30` |
| Android | 8,756,174 | `VSgbUp3PvKvNMlJohSAI8zWXi3cbkWrefTgQu04U1Yw` |

Report: `.release-natural-shield-production-20260910/production-verification.json`.

Compatible existing production installations include iOS 1.0.2 build 25 and Android 1.0.2 build 24, including the production-channel direct-install APK. This does not prove that any particular phone has downloaded or launched the update. Older runtime 1.0.1 preview installations do not receive it.

This was an OTA pricing update, not a new App Store or Google Play binary submission. To refresh, fully close and reopen the app while online, allow the update to download, then fully close and reopen again. Do not uninstall to refresh pricing.
