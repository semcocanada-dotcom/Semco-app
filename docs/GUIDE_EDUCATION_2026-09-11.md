# SEMCO Guide teaching and troubleshooting update

Status: implemented and locally verified; **not published to production** in this task.

## Installer experience

- The existing Saved Chats list lets an installer choose and continue a previous conversation. Chats are local to the device and installer account; there is no cross-device/cloud conversation sync.
- Full active-job conversation history is available to the local guide. The old six-user-message extraction window and 80-message hook window no longer discard older facts.
- Only installer statements count as job evidence. Assistant answer choices and product comparisons do not become selected job facts. Explicit corrections/negations and new-job resets are handled.
- Troubleshooting asks one missing question at a time. Free text can supply several facts at once. “Not sure” leads to a simple, non-destructive check; unresolved details remain unknown instead of being marked confirmed or asked forever.
- Peeling, cracks, bubbles/pinholes, colour/haze, drying and mix-consistency paths now include useful diagnostic checks, process explanations and next-step progression. Existing failure/structural/leak decisions still need appropriate on-site review. The guide does not inspect photos or approve warranties.
- Product explanations distinguish purpose, normal use and limitations. Included topics cover X-Bond Stone/Liquid/Additive, MicroBond, Liquid Membrane, reinforcement fabric, Brown Coat, three cleaners and four currently stocked sealers.
- Simple terminology explanations include substrate, scratch coat, primer, tacky, wet-on-wet, pot life, cure, pinholes, sound surface, wet film, mil and penetrating sealer.
- Product/application follow-ups can keep a lesson in progress and remember a missing cleaner/exposure answer after saving/reopening the chat.

## Local database and cost

`guide_knowledge` is an additive SQLite table. App startup seeds versioned reviewed product notes, terminology and video metadata. Product teaching reads current-version rows, validates them against reviewed bundled content, and falls back to bundled notes for missing, stale or malformed rows.

Existing `conversations.messages` JSON retains the full conversation plus optional lesson, education-topic and video-link metadata. No installer projects, photos or conversations are deleted by this update.

The answer engine remains a deterministic offline guide, **not an LLM or a self-training AI**. No API key, paid model, new package, background learning, chat upload, Supabase migration or remote-account access was added. Installer conversation content is not promoted into shared technical knowledge.

## YouTube coverage and limits

Reviewed the public long-form catalogue of [SEMCO Modern Seamless Surface (@semcomfg)](https://www.youtube.com/@semcomfg/videos): 66 listings across four pages to the end of the public continuation list. Added 21 relevant, verified title/publisher/URL references with local topic matching.

Official-channel provenance was cross-checked using SEMCO's [Liquid Membrane page](https://www.semcosurfaces.com/liquid-waterproofing-membrane) and [Natural Shield page](https://www.semcosurfaces.com/natural-shield-sealer), channel listings and public video metadata.

Individual watch pages were rate-limited; no transcripts or visual procedures were fully reviewed. Private/deleted videos and Shorts were not verified. This is a catalogue/link audit, **not a claim to have watched or learned every video**. No new technical procedure was derived from video titles.

Video references open only after a tap and only for exact allowlisted catalogue URLs. They require internet access. Older demonstrations are labelled. Current Canadian product/shower/pool specifications take precedence; videos never change calculator coverage, pricing, product availability, coat counts or cure rules. Wrong-product application requests for a Canadian shower/pool withhold that product's recipe and video link.

## Verification

- Final full Jest run: 39 suites / 442 tests passed.
- TypeScript `npx tsc --noEmit`: passed.
- ESLint `npm run lint`: passed.
- iOS and Android production-format Expo exports: passed. Final frozen export after agent/source changes: `.release-guide-education-final-20260911` (ignored).
  - iOS: `_expo/static/js/ios/entry-0667c831a84805283f1b2330b20ca6da.hbc`.
  - Android: `_expo/static/js/android/entry-e0fe81b48f284b396a32968a95da244f.hbc`.
- Local browser fixture at 390 × 844: actual AssistantScreen, ChatBubble, useAssistant and local answer engine checked for comparison → MicroBond application, new chat → Saved Chats → restored prior conversation. Database/auth/navigation/icons are isolated fixture implementations; **not a native-device or real-account test**.
- Focused regressions cover long chat memory, corrections, free-text fact collection, uncertainty progression, saved/reopened troubleshooting and cleaner conversations, glossary/lesson continuation, product-policy conflicts, relevant video routing, link safety and offline operation.

Existing SafeAreaView deprecation warnings remain in UI tests. No App Store / Google Play submission or EAS production update was performed. The final frozen export is ready for a separately authorized release; re-export if application source changes again.
