# Semco Pro App Handoff For Fable 5

Generated: 2026-07-07  
Repo: `C:\Users\TARS\Documents\Codex\semco pro app\Semco-app-semco-pro-preview\Semco-app-semco-pro-preview`  
Branch: `semco-pro-preview`  
Remote: `https://github.com/semcocanada-dotcom/Semco-app.git`  
Latest commit at handoff: `7504227 Route web root to portal`

## Critical Rules

1. Do not trigger an Expo build, push a build, publish, deploy, or submit to Apple unless Dieter explicitly says to do it.
2. Do not spend Expo build credits without explicit approval.
3. JavaScript-only no-credit Expo Updates can be pushed after checks when the user has asked to continue/push updates. Do not treat this as approval for a paid EAS build.
4. Native changes require a new EAS build. Examples: app icon, splash screen, bundle config, native plugins, iOS build number, Android version code, native permissions.
5. Warranty qualification requires stage-by-stage project photos. Treat this as a core workflow, not optional.
6. Installers should use the mobile app. Admin and dealer review should be through a separate Semco portal.
7. Material orders currently default to Modern Arc at `order@modernarc.ca` until a western dealer is active.
8. Do not put secrets, temp Supabase tokens, service-role keys, passwords, or Firebase private credentials in the repo or handoff files.

## Primary Fable 5 Objective

The next major product priority is to make Ask Semco feel like a capable field instructor, not a search result viewer.

Fable 5 should further build AI intelligence and interaction quality. The goal is not just longer answers. The goal is better reasoning, better questions, better context handling, and answers that guide an installer through the real job in a calm, practical way.

Success standard:

- Installer asks a messy real-world question.
- Assistant identifies the job type, substrate, exposure, system, product, and missing details.
- If key information is missing, it asks the right clarifying question before giving risky instructions.
- If enough information exists, it gives a practical step-by-step field answer.
- It remembers the current conversation and can continue naturally.
- It uses approved Semco information and current Semco Canada rules.
- It avoids invented ratios, coverage, coat counts, cure times, warranty rules, and product compatibility.
- It feels like a knowledgeable human installer coach, not an OCR dump or generic chatbot.

## Project Overview

This is the Semco Pro installer app built with Expo, React Native, Expo Router, Supabase, Firebase, SQLite, and Firebase AI/Gemini.

Main app purposes:

- Installer dashboard
- Projects and project records
- Stage photos for warranty qualification
- Product and technical library
- Colour fan deck and formulas
- Material calculators
- Material request/order workflow
- Ask Semco AI assistant
- Project sign-off forms and signatures
- Reward tier tracking
- Semco/dealer admin review portal

Current app version from `app.json`:

- Expo app version: `1.0.17`
- iOS build number: `19`
- Android version code: `19`
- Expo owner: `kitzul88`
- Expo project ID: `cc9001d8-b1f9-44b2-b59c-c7b35d8c6129`
- Runtime version policy: `appVersion`

## Current Route Structure

Important app routes:

- `/dashboard` - installer home screen
- `/projects` - project list
- `/projects/create` - create project
- `/projects/[id]` - project dashboard/detail
- `/add` - quick add actions
- `/library` - Semco library hub
- `/library/guides` - installation guides and diagrams
- `/products` and `/products/[id]` - product docs
- `/colors` and `/colors/[id]` - colour deck and formula detail
- `/calculator` - material calculators
- `/orders` - material request/order review
- `/assistant` - Ask Semco
- `/assistant/debug` - retrieval/debug view
- `/profile` - installer/company profile
- `/receipts` - purchase receipt submission
- `/rewards` - reward tiers
- `/more` - secondary app actions
- `/admin` - Semco admin-only mobile app route
- `/portal` - web admin/dealer portal

Root behavior:

- `app/index.tsx` redirects web users to `/portal`.
- Native/mobile app users redirect to `/dashboard`.

Tab bar:

- Defined in `src/components/navigation/AppTabBar.tsx`
- Five main tabs: Home, Projects, Add, Library, More
- Hidden on detail/admin/auth style routes.

## Current Working Tree Status

There are uncommitted local changes. Do not assume GitHub has them until committed and pushed.

Modified files:

- `.gitignore`
- `app/(app)/add/index.tsx`
- `app/(app)/admin/index.tsx`
- `app/(app)/library/index.tsx`
- `app/(app)/orders/index.tsx`
- `src/components/projects/SignaturePad.tsx`
- `src/components/rewards/RewardTrackerCard.tsx`
- `src/components/ui/ActionCard.tsx`
- `src/constants/dealers.ts`
- `src/services/ai/assistant-cache.ts`
- `src/services/ai/assistant.ts`
- `src/services/ai/providers/firebase-gemini.ts`
- `src/services/ai/reasoning.ts`
- `src/services/ai/semco-retrieval.ts`
- `supabase/migrations/005_admin_portal.sql`
- `supabase/migrations/007_dealer_portal_policies.sql`

New untracked file:

- `supabase/migrations/008_modern_arc_order_routing.sql`

Last verified diff size:

- 16 modified tracked files
- 343 insertions
- 66 deletions
- 1 new migration file

## Verification Already Run

Run from repo root:

```powershell
npx tsc --noEmit
npm run lint
```

Result:

- TypeScript passed.
- ESLint passed with zero warnings.

Local web app:

```powershell
npx expo start --web --port 19008
```

Last check:

- `http://localhost:19008` returned HTTP 200.

Assistant smoke tests run with `npx tsx`:

- `What procedure for a shower` now asks for substrate first.
- `What sealer for a shower` returns Satin Stone guidance.
- `How many coats for it being underwater` returns 3 coats of SEMCO Liquid Membrane.
- Follow-up context for `GlasRoc` was checked previously and returns a GlasRoc/similar wet-area-board shower procedure.

## Recent Completed Work

### Material Orders And Modern Arc Routing

Files:

- `app/(app)/orders/index.tsx`
- `src/constants/dealers.ts`
- `supabase/migrations/008_modern_arc_order_routing.sql`
- `app/(app)/add/index.tsx`

Implemented/current behavior:

- Orders default to Modern Arc.
- Modern Arc order email is `order@modernarc.ca`.
- Western dealer routing is intentionally not active yet.
- Installer-facing material request status actions were simplified.
- Installers now see actions that make sense from the app:
  - Draft
  - Submit for Dealer Review
- Removed installer-facing controls for statuses that are admin/dealer decisions:
  - Needs Revision
  - Approved
- Odd-item request support exists so installers can request individual products without running a full system calculator.
- Calculator quantities can feed the material request.
- Dealer estimate card shows dealer/pricing status.
- Mailto flow builds a dealer email for submitted requests.

Important design intent:

- The app should not auto-place external orders.
- The app sends/reviews requests first.
- Orders should eventually be routed by company profile postal code:
  - Ontario and east: Modern Arc
  - West: future western dealer when available
  - For now all orders default to Modern Arc

Need to verify next:

- Test the mailto on an actual iPhone.
- Confirm the email body includes odd items, calculator items, project info, and dealer routing cleanly.
- Confirm saved request appears in admin portal.
- Confirm dealer/admin status updates are not exposed as installer controls.

### Dealer Constants

File:

- `src/constants/dealers.ts`

Current state:

- `modern-arc` is active.
- Western routing currently defaults to Modern Arc with explanatory copy.
- Pricing label is `Modern Arc Ontario retail pricing 2026`.

Next:

- When a western dealer is live, update dealer routing and add a real west dealer record.
- Do not hardcode Diamond Arc as active until Dieter confirms.

### Admin And Dealer Portal

Files:

- `app/portal/index.tsx`
- `app/(app)/admin/index.tsx`
- `src/services/portal-cloud.ts`
- `src/services/admin-workbench.ts`
- `src/services/admin-access.ts`
- `supabase/migrations/005_admin_portal.sql`
- `supabase/migrations/007_dealer_portal_policies.sql`
- `supabase/migrations/008_modern_arc_order_routing.sql`

Current behavior:

- Web root `/` redirects to `/portal`.
- Native root redirects to dashboard.
- App admin route `/admin` is only for Semco admin users.
- Portal supports Semco admin/dealer role concepts.
- Installer accounts should not see admin portal.
- Admin portal should show installer company profiles, projects, photos, signoffs, material requests, purchase receipts, and reward credit records.

Known risk:

- The user had trouble loading tunnel links and wanted a cleaner Semco website link.
- A local tunnel is not a production portal.
- Production should be a stable hosted web build or site route, not a random localtunnel URL.

Next:

- Verify `/portal` in local web.
- Decide deployment path:
  - Expo web static hosting
  - Supabase hosted edge/static arrangement
  - Squarespace link to hosted portal
  - Dedicated subdomain such as `portal.semcocanada.com`
- Do not rely on localtunnel for real installer/dealer use.

### Supabase Database Work

Files:

- `supabase/migrations/005_admin_portal.sql`
- `supabase/migrations/007_dealer_portal_policies.sql`
- `supabase/migrations/008_modern_arc_order_routing.sql`

Schema areas:

- `admin_profiles`
- `dealer_accounts`
- `installer_profiles`
- `order_requests`
- `warranty_reviews`
- `purchase_receipts`
- `reward_credits`
- `project_signoffs`
- RLS policies for Semco admin and dealer admin access

Current migration intent:

- Semco admin has full review access.
- Dealer admins can view/update assigned dealer records.
- Installer records carry dealer assignment.
- Material requests carry dealer data.
- Reward progress can be based on verified square footage and/or submitted receipts.
- Modern Arc is the default active order routing target.

Important:

- A previous run reportedly applied live Supabase changes and created an admin auth/user role. Verify live Supabase state before assuming it is current.
- Do not paste or store Supabase temp tokens.
- If a temp token was used previously, ask Dieter to revoke/regenerate as needed.

Recommended verification:

```sql
select * from dealer_accounts;
select * from admin_profiles;
select count(*) from installer_profiles;
select count(*) from order_requests;
```

Then test RLS with:

- Semco admin user
- dealer admin user
- normal installer user

### Library Screen

File:

- `app/(app)/library/index.tsx`

Current changes:

- Hero title changed to `Semco Library`.
- Hero copy simplified.
- Colours were removed from Library because Colours is now on the main dashboard.
- Calculator was removed from Library.
- Library quick access now focuses on library/workflow items:
  - Install Guides
  - Product Docs
  - Photos
  - Project Forms
  - Ask Semco

Design intent:

- Library should not feel like a duplicate dashboard.
- Library should be for technical information, docs, guides, photos/stage references, forms, and Ask Semco.

Open issue:

- User wants official X-Bond install guide diagrams, not invented or generic diagrams.
- Need ingest/display real Semco documentation diagrams from `https://www.semcosurfaces.com/documentation` and local downloaded docs.
- The current guide UI may still include simplified visual cards. Replace/augment with actual PDF page images where appropriate.

### Shared Action Cards

File:

- `src/components/ui/ActionCard.tsx`

Current changes:

- Premium card sizing was increased.
- Icon size/container and typography were adjusted.
- This affects dashboard/library premium cards.

Open issue:

- User still wants the main dashboard top four cards to feel more premium.
- Cards should have consistent theme logic:
  - Orange for primary action/active/special CTA
  - Teal for supporting/navigation/system
  - Navy for text
  - No random orange/teal usage

### Reward Tracker

File:

- `src/components/rewards/RewardTrackerCard.tsx`

Current changes:

- Reward tracker shows verified progress and pending progress separately.
- Added legend:
  - Orange = Verified
  - Light teal = Pending
- Pending square footage is shown as pending review.

Design intent:

- Verified square footage is the official unlock progress.
- Pending receipts/orders/projects can preview progress but should not unlock rewards until reviewed.

Open issue:

- User asked whether dots/progress should be off center and wants a premium effect.
- The current tracker works but may need visual refinement.
- Consider replacing dotted/progress ring with a cleaner premium SVG ring:
  - Centered ring
  - Orange gradient verified arc
  - Teal ghost pending arc
  - Fewer/no off-center dots
  - Subtle inner glow/shadow

Reward tiers from user:

- Tier 1 Starter: 500 sq ft - 12 inch ProLite
- Tier 2 Bronze: 1,000 sq ft - 12 inch Bianko non-marking ProFlex
- Tier 3 Silver: 5,000 sq ft - full skim blade set with pole adapter
- Tier 4 Gold: 10,000 sq ft - gold trowel engraved with milestone
- Tier 5 Platinum: 25,000 sq ft - Co.Me platinum kit custom engraved
- Tier 6 Elite: 50,000 sq ft - marketing package and promo video
- Tier 7 100K Club: 100,000 sq ft - Las Vegas trip with custom painted trowel

Images have been provided in previous chat attachments. Make sure they are copied into project assets before relying on them.

### Signature And PDF Forms

Files:

- `src/components/projects/SignaturePad.tsx`
- `src/components/projects/ProjectSignoffPanel.tsx`
- project signoff/form-related services/components

Current recent change:

- Fixed React hook lint issue in `SignaturePad.tsx`.
- Uses stable `useCallback` for `syncPoints` and `getEventPoint`.

Earlier implemented behavior:

- Forms can be opened from project workflows.
- User can tap fields and sign.
- Signed forms sync for admin review.
- There is PDF/fillable form support in progress.

Known issues from latest user testing:

- Signature works better but user wants it darker and slightly larger on the PDF.
- Signature capture should remain smooth, not broken/dashed.
- PDF placement must be stable at any zoom.
- Form text fields were previously not lining up properly.
- User wants the form to behave like the exact provided PDF:
  - tap a field to enter text
  - tap signature spot to sign
  - save filled PDF to cloud
  - admin/dealer can see the saved copy
- Forms need fullscreen and zoom support.

Important acceptance requirements for signature:

- Phone: dedicated full-screen horizontal signing area.
- Phone portrait: show `Rotate your phone to sign.`
- iPad/tablet: large responsive signing modal/overlay, no forced landscape.
- Use pointer events on web, PanResponder/native where appropriate.
- Use DPR-aware canvas on web.
- Export cropped transparent PNG, not entire blank canvas.
- Preserve aspect ratio when embedding into PDF.
- Do not force signature image to both field width and field height.
- Keep signature above signature label and inside field bounds.

Recommended next specific fix:

- Increase PDF embedded signature opacity/stroke darkness.
- Increase fitted max field scale slightly while preserving aspect ratio.
- Verify on physical iPhone and iPad.
- Test saved/shared/printed PDF output, not just the on-screen preview.

### Project Forms

User provided PDF forms:

- `05_Project_Phase_Acceptance.pdf`
- `03_Mockup_Approval_Color_Acceptance_Form.pdf`
- `07_Surface_Protection_Sign_Off.pdf`
- `04_Project_Change_Order.pdf`
- `06_Final_Project_Acceptance.pdf`

User expectation:

- These exact forms should be available inside each project file.
- Project info entered at project creation should autofill forms.
- Customer should tap to fill remaining fields and sign.
- Saved copies should live in the cloud with the project, like photos.
- Admin and dealer should be able to review copies in the portal.

Open work:

- Make project dashboard the clear home for:
  - Job info
  - Chosen colour
  - Material estimate/request
  - Stage photos
  - Signoff forms
  - Warranty readiness
  - Receipts/rewards
- Photos and warranty tabs may overlap. Consider making warranty a checklist/status surface that uses photos rather than a duplicate photo area.

### Ask Semco Assistant

Files:

- `src/services/ai/assistant.ts`
- `src/services/ai/reasoning.ts`
- `src/services/ai/semco-retrieval.ts`
- `src/services/ai/providers/firebase-gemini.ts`
- `src/services/ai/assistant-cache.ts`

Current behavior:

- Uses retrieval plus local field-rule answers.
- Uses Gemini when available.
- Preserves conversation history enough for follow-up context.
- Has fallback local/manual answer behavior when Gemini is unavailable.
- Includes daily AI limit/caching concepts.
- `shouldUseLocalFieldAnswer` now routes more known field cases locally:
  - sealer application
  - membrane quantity
  - warranty photos
  - takeoff scope
  - material estimate

Current assistant improvements:

- Shower questions now ask for substrate first instead of assuming.
- Shower path includes:
  - substrate clarification
  - 2-coat Liquid Membrane/fabric detail for standard interior shower
  - X-Bond
  - Satin Stone in 2 coats
- Shower substrate options now mention GlasRoc/GlassRoc or similar wet-area board.
- Underwater/submerged membrane questions now answer 3 coats of SEMCO Liquid Membrane.
- Standard submerged/pool/exterior penetrating sealer guidance points to Natural Shield where appropriate.

Fable 5 AI work should focus on these areas:

#### 1. Conversation Intelligence

The assistant must understand follow-up questions from the active chat.

Examples:

- User: `How do I do X-Bond over exterior plywood deck?`
- Assistant gives the exterior plywood/OSB path.
- User: `Then what do I do for finish coats?`
- Assistant should understand `finish coats` refers to the same exterior plywood/OSB X-Bond deck job.

Required behavior:

- Keep the last few user questions and assistant answers available to the reasoning layer.
- Extract a current job context object from the conversation:
  - substrate
  - location/application
  - exposure
  - product/system
  - finish/sealer
  - project constraints
  - missing inputs
- Do not treat each question as brand new if the user is clearly continuing.
- If Gemini is unavailable, local fallback should still use conversation context.
- If a follow-up is ambiguous, ask one short clarifying question instead of dumping unrelated document text.

Suggested internal object:

```ts
type AssistantJobContext = {
  substrate?: 'concrete' | 'tile' | 'plywood_osb' | 'glasroc_board' | 'drywall' | 'metal' | 'icf' | 'pool_shell' | 'unknown';
  application?: 'floor' | 'wall' | 'shower' | 'pool' | 'pond' | 'deck' | 'exterior' | 'interior' | 'countertop' | 'unknown';
  exposure?: 'dry' | 'wet' | 'submerged' | 'exterior' | 'steam' | 'unknown';
  system?: 'x_bond' | 'liquid_membrane' | 'microbond' | 'sealer_only' | 'unknown';
  finish?: 'satin_stone' | 'natural_shield' | 'titan_gloss' | 'matte' | 'unknown';
  lastConfirmedAnswerId?: string;
  missingInputs: string[];
};
```

#### 2. Clarifying Question Logic

The assistant should ask for missing job-critical details before answering.

Ask for substrate first when:

- user asks a broad install procedure
- shower procedure is requested but substrate is not named
- deck procedure is requested but plywood/OSB/concrete/tile is not confirmed
- over-existing-surface question is vague

Ask for exposure when:

- pool, pond, fountain, exterior, shower, steam shower, waterproofing, submerged, wet area, or deck is implied but not clear

Ask for system/product when:

- user says `Semco`, `do this`, `the finish`, `coating`, or `material` without naming X-Bond, Liquid Membrane, MicroBond, Satin Stone, Natural Shield, Titan Gloss, or Matte

Clarifying question style:

- Short
- Practical
- One question at a time
- Provide tap choices when possible

Example:

```text
Before I give the steps, what is the shower substrate?

Concrete/board, GlasRoc or similar wet-area board, plywood/OSB, or existing tile?
```

Avoid:

- long explanations before asking the missing question
- assuming concrete when the user did not say concrete
- assuming X-Bond when the user asks about Liquid Membrane as the finish

#### 3. Human Installer Tone

The answer should sound like a knowledgeable field instructor.

Preferred answer style:

- Direct opening sentence
- Then clear steps
- Each step has a bold heading
- Add short explanation under each heading
- Use spacing between steps
- Use warning language only when needed
- End with a quick field check or photo/warranty reminder

Example format:

```text
For this shower, first confirm the substrate. The waterproofing detail changes depending on what is behind the X-Bond.

**Step 1: Confirm the substrate.**
Use this path only if the wall is concrete board, GlasRoc/GlassRoc, or a similar approved wet-area board. Do not treat regular drywall as a shower substrate.

**Step 2: Detail the wet areas.**
Use SEMCO Liquid Membrane with fabric at joints, inside corners, changes of plane, penetrations, and movement-risk areas.

**Step 3: Build the X-Bond system.**
Continue only after the membrane detail is ready and dry enough for the next coat.

**Step 4: Seal with Satin Stone.**
For a standard interior shower, use Satin Stone in 2 coats.

Before covering any stage, take photos for warranty review.
```

Avoid:

- `Direct answer`
- `Answer:`
- dumping citations inside the main text
- showing raw OCR text
- dense paragraphs with all steps run together
- saying `we will assume` for important substrate/product details

#### 4. Retrieval-Grounded Reasoning

The assistant must remain grounded in approved Semco docs and current Semco Canada business rules.

Requirements:

- Retrieve 4-8 relevant chunks when Gemini is used.
- Include document title and page number in metadata.
- Do not send entire manuals.
- Do not include low-relevance chunks just to fill count.
- If confidence is low, ask for more detail or say it cannot confirm from approved docs.
- Keep source chips below the answer for inspection/opening docs.
- Main answer should not be cluttered by a `Sources:` paragraph.

When supplied docs conflict with current Semco Canada policy, current Semco Canada policy provided by Dieter should be encoded as a clear local rule and cited as `Current Semco Canada rule` or similar.

Current Dieter rules already stated in chat:

- Stocked sealers: Satin Stone, Natural Shield, Titan Gloss, Matte.
- Natural Shield is used for pools/submerged/exterior penetrating-sealer needs, not X-Crete.
- Standard interior showers should use Satin Stone in 2 coats.
- Shower waterproofing path should include 2-coat Liquid Membrane/fabric detail.
- Underwater/submerged Liquid Membrane work should use 3 coats.
- Brown Coat is not automatic. It is only for leveling, filling larger voids, height correction, or when the detail calls for build-up.
- X-Bond Stone field rate should be treated around at least 75 sq ft per 50 lb bag finished.
- Liquid Membrane standard field coverage is often over 1000 sq ft per 5 gal pail unless submerged, but submerged work needs different coat logic.

Fable 5 must verify and encode these carefully, without inventing beyond them.

#### 5. Gemini Unavailable Fallback

Current fallback can show messy OCR. This must be improved.

Required fallback behavior:

- Do not show raw OCR garbage.
- Do not show unrelated document text.
- Use local rule answer when available.
- If local rule is not available, show:

```text
Gemini is unavailable right now, so I cannot build the full guided answer.

I found these Semco document matches you can open:
```

Then show source chips/cards.

If the question is a follow-up and Gemini is unavailable:

- Use conversation context and local deterministic rules if possible.
- If not possible, ask one clarifying question or offer document chips.

#### 6. Guided Answer UI

The response UI should support better interaction, not just text.

Recommended UI improvements:

- Collapsed preview for long answers with `Show full answer`.
- Step cards or strong step spacing.
- Source chips below answer.
- Follow-up buttons:
  - `Show prep only`
  - `Show materials`
  - `Show sealer steps`
  - `What photos are needed?`
  - `Open source docs`
- Typing indicator while Gemini is generating.
- Haptics on send/answer received.
- Keyboard should be easy to dismiss.
- Input bar should not block reading.
- Avoid bottom tabs covering assistant content.

#### 7. Assistant Test Set For Fable 5

Fable 5 should test and record outputs for these exact prompts:

```text
What procedure for a shower?
GlasRoc
What substrate should be used in a shower?
What sealer for a shower?
How do I do X-Bond over exterior plywood deck?
Then what do I do for the finish coats?
What is Brown Coat for?
How do I go over concrete from start to finish?
How do I prep concrete?
What's the process for doing a concrete pool?
I said pond not floor and the finish is Liquid Membrane not X-Bond.
How many coats for it being underwater?
Can I go over painted drywall?
Can X-Bond go over existing tile?
How do I prep tile?
What photos are needed for warranty?
How much area does one bag cover?
How much Liquid Membrane do I need?
```

For each answer, verify:

- It asks substrate/exposure when needed.
- It uses conversation context on follow-ups.
- It does not assume the wrong system.
- It does not invent coverage, ratios, or coat counts.
- It separates steps visually.
- It uses current Semco Canada sealer rules.
- It does not expose raw OCR as an answer.

#### 8. Implementation Pointers

Likely files to modify:

- `src/services/ai/reasoning.ts`
- `src/services/ai/assistant.ts`
- `src/services/ai/semco-retrieval.ts`
- `src/services/ai/providers/firebase-gemini.ts`
- `app/(app)/assistant/index.tsx`
- `src/services/ai/assistant-cache.ts`

Suggested implementation sequence:

1. Add conversation context extraction.
2. Add clarifying question rules.
3. Improve local deterministic answers for high-risk/common install questions.
4. Improve Gemini prompt to require human field-instructor tone and step formatting.
5. Improve fallback so it never dumps raw OCR.
6. Update assistant UI for step readability and source chips.
7. Add a repeatable local test script for the prompt set above.

Do not redesign unrelated screens while doing this.

Important user preference:

- Assistant must feel like a human instructor, not a dry manual extract.
- Each step should have a bold heading and spacing.
- Do not show `Direct answer` or `Sources:` in the main user-facing response unless explicitly needed.
- Source chips can remain clickable below the answer, but the main answer should be clean.
- The assistant should ask clarifying questions when substrate/application is ambiguous.
- It must not invent product ratios, coat counts, coverage, cure times, compatibility, or warranty rules.

Known risks:

- Some local hardcoded assistant answers include operational guidance. These must be validated against Semco docs and Dieter's current Canada rules.
- Retrieval fallback can still surface messy OCR text if Gemini is unavailable.
- Need better graceful fallback when Gemini is unavailable:
  - do not dump OCR garbage
  - say AI is unavailable and offer clean closest matching document/page chips
  - keep conversation context for retry

Need to test more:

- Shower over GlasRoc
- Shower over concrete board
- Shower over tile
- X-Bond over exterior plywood/OSB deck
- Concrete floor start to finish
- Concrete pond with Liquid Membrane finish
- Underwater coat count
- Satin Stone application
- Natural Shield application
- Titan Gloss and Matte
- Painted drywall
- ICF
- Metal
- Tile/grouted surfaces
- Pool/submerged
- Liquid Membrane quantity and coverage
- X-Bond liquid/microbond ratio and coverage

### AI Provider

Files:

- `src/services/ai/providers/firebase-gemini.ts`
- Firebase config in `app.config.js`
- Native Firebase files in `config/firebase/`

Current app config default model:

- `EXPO_PUBLIC_FIREBASE_AI_MODEL || 'gemini-3.5-flash'`

Important:

- Do not put a Gemini API key directly in the mobile app.
- Firebase AI Logic is the intended secure path.
- Firebase App Check should be used to reduce unauthorized AI use.
- If Gemini is unavailable, local search should still work without consuming AI quota.

### Calculators And Coverage

Current user concerns:

- Coverage must be accurate.
- X-Bond Stone field rate: user says at least 75 sq ft per 50 lb bag finished.
- X-Bond Liquid mixed with microcement/microbond needs correct ratio.
- User corrected MicroBond idea: roughly 1000 sq ft per 5 gal/30 lb pail, with around 2.5 gal liquid added per pail.
- Liquid Membrane often gets over 1000 sq ft per 5 gal pail unless submerged.
- Sealer on X-Bond should likely be at least 250 sq ft/gal depending product and use.
- Liquid pails should not display as drums in normal app ordering.

Known issue:

- User reported calculator/order output saying `Buy 2 x 55 gal drums` for X-Bond Liquid. That needs to be removed or hidden unless drums are actually sold/stocked for the app.

Next:

- Review calculator package rounding.
- For normal installer orders, prefer stocked package sizes:
  - 1 gal
  - 5 gal
  - 1.5 gal kits where applicable
  - 50 lb bags
- Remove 55 gal drums from installer-facing suggestions unless Dieter confirms they are valid order options.
- Make cost visible where material count is shown.
- Confirm retail price list mapping from `Semco Ontario - Dealer pricing 2026.pdf`.

### Colours

Current user preferences:

- Colours should be on main dashboard.
- Colour library should be organized like the original fan deck.
- Light colours on left, dark colours on right where appropriate.
- Colour swatches should be compact so more fit on screen.
- Colour detail/formula layout is liked, but:
  - add `tap to enlarge`
  - full-screen colour sample expansion must work
  - back should return to same scroll position in colours, not jump back through Library
  - include notice: colour is reference only; screen display may vary; verify with real sample

Open issue:

- User said they could not expand colour sample full screen.
- Back navigation from colour detail loses previous colour scroll position.

### Product Library And Diagrams

User concern:

- Product library did not have accurate products.
- Library docs should not be endless scrolling.
- Install guides should use actual diagrams from Semco documents, especially X-Bond install guides.
- Some current diagrams/cards were called not actual install diagrams.

Next:

- Ingest/render actual PDF page images for:
  - X-Bond floor details
  - Shower details
  - Liquid Membrane details
  - Pool/submerged details
  - Plywood/OSB deck details
  - GlasRoc/board shower detail
- Use real docs from:
  - `https://www.semcosurfaces.com/documentation`
  - local docs folder: `C:\Users\TARS\Business-Control-Tower\02_Semco\Technical_Docs\Semco West`
- Replace generic/simplified cards where user expects official diagrams.

### Dashboard

Current main cards:

- Projects
- Calculators
- Materials
- Colours

User preference:

- Dashboard should be cleaner and more premium.
- Remove redundant summary cards if they do not click or add value.
- Recent Projects below should show most recent activity.
- Reward tracker should be visible but polished.
- Main screen should have Semco logo up top.

Open work:

- Further premium polish for top cards.
- Make cards more readable and less generic.
- Ensure every visible card/button actually does something.
- If a UI element is just an indicator, make it visually read as an indicator, not a button.

### App Icon

User wants the app thumbnail/icon changed to Semco logo mark.

This requires native build if `assets/images/icon.png` or native app icon config changes.

Do not change and build automatically. Prepare assets first, then ask for explicit build approval.

## Commands For Fable 5

Open repo:

```powershell
cd "C:\Users\TARS\Documents\Codex\semco pro app\Semco-app-semco-pro-preview\Semco-app-semco-pro-preview"
```

Check status:

```powershell
git status --short
git diff --stat
git branch --show-current
```

Run checks:

```powershell
npx tsc --noEmit
npm run lint
```

Start local web:

```powershell
npx expo start --web --port 19008
```

Open:

```text
http://localhost:19008
http://localhost:19008/dashboard
http://localhost:19008/library
http://localhost:19008/orders
http://localhost:19008/assistant
http://localhost:19008/portal
```

Do not run paid/native EAS builds unless approved:

```powershell
# Do not run without explicit user approval because this can consume build credits:
eas build --platform ios
eas build --platform android
```

No-credit JavaScript Expo Updates:

```powershell
# Allowed after checks when Dieter has asked to continue/push updates:
eas update
```

## Suggested Next Work Order

1. Fix calculator/order packaging issue:
   - remove 55 gal drums from installer-facing X-Bond Liquid suggestions unless explicitly confirmed.
   - verify cost display beside material counts.

2. Finish assistant response formatting:
   - bold step headings
   - clear spacing
   - no `Direct answer`
   - sources as compact chips, not main answer text
   - better Gemini unavailable fallback

3. Validate assistant technical rules:
   - shower substrates including GlasRoc/similar
   - 2-coat Liquid Membrane for shower
   - Satin Stone 2 coats in standard interior shower
   - 3-coat Liquid Membrane for underwater/submerged
   - Natural Shield for pool/submerged/exterior penetrating-sealer needs

4. Fix signature PDF final polish:
   - darker
   - slightly larger
   - stable placement
   - test saved PDF output on iPhone and iPad

5. Refine dashboard:
   - remove/replace non-clickable summary controls
   - make top four cards more premium
   - reward tracker visual polish

6. Improve library/install guides:
   - replace generic diagrams with actual PDF page images
   - add missing X-Bond guide diagrams
   - add the additional shower detail image/doc

7. Fix colour UX:
   - full-screen enlarge
   - preserve scroll position/back behavior
   - reference-only colour disclaimer

8. Portal production path:
   - decide where `/portal` will be hosted
   - connect stable Semco website link
   - verify admin/dealer login roles with Supabase

9. Push/commit and no-credit update workflow:
   - review diff
   - commit to branch
   - push to GitHub
   - no-credit Expo Update is allowed after checks when Dieter asks to continue/push updates
   - paid/native Expo build still needs explicit approval

## Release Notes For Current Uncommitted Batch

If this batch is committed, suggested commit message:

```text
Polish material requests, assistant rules, library cards, and reward tracker
```

Suggested summary:

- Default material requests to Modern Arc routing.
- Add odd-item material request support.
- Simplify installer request actions to draft/submitted states.
- Add dealer context to material request estimates and emails.
- Update library quick access now that Colours is on dashboard.
- Add Project Forms entry point.
- Add verified/pending reward progress legend.
- Improve Semco Assistant rules for showers, Satin Stone, GlasRoc/similar board, and underwater membrane coat counts.
- Clean signature pad hook dependency and lint style warnings.
- Add Modern Arc routing migration.

Suggested QA before release:

- Create project.
- Run calculator.
- Open material request.
- Add odd item.
- Submit for dealer review.
- Confirm Modern Arc email opens.
- Confirm order saves.
- Confirm admin portal sees request.
- Ask Semco:
  - `What procedure for a shower`
  - `GlasRoc`
  - `What sealer for a shower`
  - `How many coats for it being underwater`
- Fill a project signoff form and sign.
- Save/share PDF.
- View dashboard reward tracker.
- Open Library and verify Colours is not duplicated.

## Known Do-Not-Forget Items

- User is sensitive to Expo credit usage. Say clearly whether something is an update or a build.
- User wants frequent updates when no credits are consumed.
- User wants actual functioning app behavior, not placeholder pages.
- Buttons that do nothing should be removed or made real.
- Installer-facing wording should be plain field language.
- Admin/dealer tools must not be visible to normal installers.
- Orders should be internal/dealer requests, not automatic external purchases.
- Warranty document generation depends on required stage photos and project records.
- Reward square footage should be based on verified purchases/projects/receipts, with pending shown separately.
- Keep theme consistent:
  - Semco Orange: `#CF451F` for primary actions, active states, important CTA
  - Dark Teal: `#008E90` for Semco surfaces/navigation/supporting UI
  - Light Teal: `#05BAC2` for secondary accents
  - Navy: `#00232D` for text
  - Soft Grey: `#F2F4F7` for app background
  - White: `#FFFFFF` for cards/bottom nav
