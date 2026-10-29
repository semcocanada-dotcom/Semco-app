# Semco Guide: free offline instructor update

Status: published to the production OTA channel for compatible iOS and Android installations using runtime 1.0.2 on 8 September 2026. Downloaded production bundles were verified against the tested export. Physical-device smoke testing remains outstanding.

## What changed

- Guided troubleshooting for peeling/lifting, cracks, bubbles/pinholes, uneven colour or haze, slow drying/stickiness, and mixing consistency.
- Short questions collect installer observations before giving a next check. Suggestions in the guide's own replies are not treated as observed job facts.
- Different jobs reset the troubleshooting and calculator context. Long procedures can be reviewed one whole step at a time or shown in full.
- References expand to the actual saved manual page text when available. Missing pages are labelled honestly; Product Docs links are not presented as exact-page links.
- Sample and tint explanations use the existing shared policies: a $40 prepared quart of X-Bond Liquid including pigment, waived on qualifying orders of 500 sq ft or more; job pigment is $2 CAD per machine ounce.
- The installed tool promotion is explained with an explicit dealer availability check, not a live offer guarantee.
- Area parsing preserves thousands separators, rejects invalid measurements, and either adds clearly separate areas or asks for a total. Described contamination reaches the existing calculator prep selection.
- Coverage explanations use the calculator constants, including the existing dry-drywall allowance and four-coat submerged membrane system. No coverage rates or package-selection rules were changed.
- Saved chat history is no longer silently truncated at 80 messages. The calculation/reasoning input window remains bounded to the latest 80 messages.
- Expanding older answers/references no longer unconditionally scrolls to the bottom. A Latest message control allows an explicit return.
- Chat operations are serialized to prevent double sends and old answers mixing into a newly selected job. Save failures are shown instead of silently ignored. Dealer-summary drafts support native text selection for copying.

## Boundaries

This is deterministic on-device teaching logic, not a newly trained language model. No paid AI API, API key, remote model or cloud chat processing was added. It does not autonomously learn from installer chats.

The guide cannot inspect photos, certify a diagnosis, approve a repair or warranty, confirm live stock/pricing/promotion availability, or send a dealer message. Dealer summaries are copyable drafts only. Active leaks, movement, uncertain failed layers and missing product-specific repair data require qualified review.

Conflicting inch/mil thickness wording in the existing field notes was removed without inventing a replacement specification. Installers are directed to confirm the selected finish thickness with SEMCO.

The previously discussed installer opportunity inbox is not included in this update. Existing calculator package/rounding findings and cloud-sync audit findings are separate work, not fixed by this guide update.

## Keeping the free guide educated

1. Obtain the approved SEMCO document or an explicit reviewed commercial policy before adding a technical or pricing claim.
2. Link any new procedure to an installed document ID and page. Keep missing or conflicting specifications visible as a knowledge gap.
3. Add realistic multi-turn tests: vague opening, short answer, correction, a new job, an unrelated question, and a condition requiring review.
4. Check that UI starter prompts and suggested replies reach the intended branch and do not loop back to the same question.
5. Run the complete Jest suite, TypeScript and lint, then export iOS and Android bundles.
6. Perform native-device smoke tests before publication: offline conversation, saved chat reload, references, scrolling, a new job and installer/dealer escalation wording.

Do not treat passing unit tests or an Expo export as proof of a physical-device test or publication.

## Verification on 8 September 2026

- Complete Jest suite: 33 suites, 342 tests passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with no errors or warnings.
- `git diff --check`: passed (only Git's Windows line-ending notices).
- Final iOS Expo export: passed, `dist-offline-guide-ios-verified-20260908`.
- Final Android Expo export: passed, `dist-offline-guide-android-verified-20260908`.
- Tests include an explicit network-failure guard proving the troubleshooting conversation does not call `fetch`.
- Final combined production export: passed, `.release-guide-production-20260908`. This frozen export was published with `--skip-bundler`; the mobile source was not changed between export and publication.
- Interactive Chrome preview at 390 x 844: passed for multi-turn peeling diagnosis, retained user observations, saved manual page expansion, copyable dealer-summary drafts, new-chat separation, whole-step lesson navigation, saved-chat reopening, and the $40 prepared sample / 500 sq ft waiver explanation.
- The isolated preview rendered the actual AssistantScreen, chat hook and offline answer engine with temporary in-memory persistence, local auth fixtures, and blocked network APIs. Fonts/icons/router/typing animation were stubbed. This was not a production-account, native-font or physical-phone test.
- Browser console contained three extension-style asynchronous message-channel errors; no guide render failure was observed.
- Physical iPhone/Android interaction: not performed; no connected phone or configured Android emulator was available.
- This release was an OTA publication, not an App Store or Google Play binary submission or approval.

The Jest run still prints the existing React Native SafeAreaView deprecation notices; these are not failed tests.

## Production publication

- Published at: `2026-09-08T20:00:19.080Z`.
- Channel / branch: `production` / `production`, runtime `1.0.2`, both platforms.
- Update group: `e4d76c32-ad22-4b59-9888-339796f7572e`.
- iOS update: `01a0829b-6c88-7195-bddd-90256fbe4b97`.
- Android update: `01a0829b-6c88-7489-adfa-2f4b8b473aa0`.
- Message: `Free offline instructor: guided troubleshooting and clearer job context`.
- Previous production group retained for rollback: `7d7c4bd6-0624-4311-a52a-3141f30ec374` (`Stop colour picker scroll jump`).

At `2026-09-08T20:01:37.079Z`, requests using the production client channel and runtime returned the new platform update IDs. Both downloadable launch bundles matched their manifest SHA-256 and the frozen local bundles byte-for-byte. The verifier follows Expo's supplied asset authorization headers without logging or saving them. Report: `.release-guide-production-20260908/production-verification.json`.

- iOS: 8,758,871 bytes; SHA-256 (base64url) `Qv9tm6cHLeg62h6eyckE4PR9NfNGANdtCDkgZovaX3o`.
- Android: 8,755,220 bytes; SHA-256 (base64url) `Rq6cDrrEG-GvnlRlRNlx0CTHf2ppLKG9T8wvH2JrNOk`.

Compatible existing production-channel installations include the iOS 1.0.2 build 25 and Android 1.0.2 build 24 (including the direct-install APK). Older runtime 1.0.1 preview installations do not receive this release. This does not verify that a particular user's phone has downloaded or launched it.

The default update flow downloads during an online cold launch and applies on a subsequent cold launch. Fully close and reopen the app, allow the download to finish while online, then fully close and reopen it again. Do not uninstall to refresh the guide. Reference: https://docs.expo.dev/eas-update/download-updates/.
