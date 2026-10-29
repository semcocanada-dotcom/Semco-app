# Semco Guide eval baseline (Phase 1)

Recorded 29 October 2026 from `backup/2026-10-28-live-ota-guide-education` plus the Phase 1 hygiene changes. Free offline guide only. No OTA, no paid model.

Harness: `src/services/ai/__eval__/questions.json` (29 installer questions) and `src/services/ai/__eval__/guide-eval.test.ts`.

A result is **answered-with-cite** when the reply states a listed key fact and cites an expected document or page, and it is not only a file list. **Partial** means a key fact or an expected document, but not both as a taught answer. **Cannot-confirm** means neither. A document list of the expected file stays partial. Forbidden phrases (`mustNotSay`) fail the run; this baseline had none.

The confidence bar is the live substring rule again (`2+ chunks` or `topScore >= 2`). A score under 10 is not treated as an empty answer. Phase 2 (BM25 and an answer composer) is not in this baseline.

## Rates

| Verdict | Count | Share |
|---|---:|---:|
| Answered with cite | 9 | 31% |
| Partial | 18 | 62% |
| Cannot confirm | 2 | 7% |
| Total | 29 | 100% |

## Per question

| Question | Verdict | Why it landed there |
|---|---|---|
| What's the difference between Satin Stone and Natural Shield? | answered-with-cite | Product teaching plus a SIP or stocked-sealer citation |
| What is the difference between X-Bond and MicroBond? | answered-with-cite | Same |
| What is the difference between X-Bond Liquid and Liquid Membrane? | answered-with-cite | Same |
| What is Liquid Membrane used for? | answered-with-cite | Role plus SIP page 28 |
| What does substrate mean? | partial | Glossary fact, no page citation |
| What does pot life mean? | partial | Glossary fact, no page citation |
| What is a mil? | partial | Glossary fact, no page citation |
| What does cure mean? | partial | Glossary fact, no page citation |
| The coating is peeling. What should I check? | partial | Asks the next check; no page on that first question |
| My sealer looks cloudy. Can you help? | partial | Asks which sealer; no page yet |
| How do I prepare a clean, unsealed concrete floor before X-Bond? | partial | Related material or a shortened step, not fact plus cite together |
| How do I prepare a concrete pool before X-Bond? | partial | Same |
| How do I apply Natural Shield on X-Bond? | partial | Same |
| How do I mix Satin Stone? | answered-with-cite | Mix ratio and SIP page 45 |
| What sealer should I use on a standard Canadian interior shower? | partial | Did not clear both the Satin Stone fact and the policy cite |
| What is Matte sealer for? | answered-with-cite | Role and limit, with the stocked-sealer policy. No coat count |
| How many coats of Matte sealer do I need? | partial | Does not teach a coat count. The verified-sheet sentence was not the reply |
| How do colour samples work? | partial | States the installed $40 / 500 sq ft policy from calculator constants, without a document cite |
| How is job tint priced? | partial | States the per-ounce policy, without a document cite |
| How do I mix a Brown Coat? | answered-with-cite | Recipe plus SIP page 30 |
| How do I use reinforcement fabric with Liquid Membrane? | partial | Related teaching or cite, not both |
| What is the difference between Stone Soap, Power Cleaner, and Nu-Lift? | answered-with-cite | Cleaner roles plus a SIP cite |
| There are pinholes in the dried liquid membrane. What should I check? | cannot-confirm | Did not reach the pinhole check or a matching cite |
| How do I install a shower over existing tile? | partial | May name a shower document. No approved shower-over-tile procedure is taught |
| Can you look at this photo and tell me if the bond failed? | partial | Refuses to inspect a photo. Does not diagnose the bond |
| Hello | partial | Asks for the product and surface. No cite |
| How do I install X-Bond on plywood? | partial | Related SIP material, not a taught plywood procedure with a cite |
| How do I mix Titan Gloss? | answered-with-cite | Tells the installer not to borrow the Satin Stone ratio |
| Hello, can you please help? | cannot-confirm | No product and no matching document |

## Not in this baseline

- BM25, synonyms, typo tolerance, and the extractive answer composer (Phase 2)
- New corpus documents, fact cards, and troubleshooting cases (Phase 3)
- Matte coat counts. The Canadian Matte sheet is not approved for teaching
- Device QA, OTA, and store submission
