# Semco Pro — Claude Code Handout

**For the next Claude Code session continuing this project.**

---

## IMPORTANT: How to Work on This Project

**Complete ONE task fully before starting the next.**
Do not run tasks in parallel. Each step may affect the next — test, commit, and verify before moving on. This prevents compounding errors and keeps the git history clean and traceable.

---

## App Objective

**Semco Pro** is a React Native mobile app (iOS + Android) for certified Semco microcement installers in Canada.

It gives installers a professional field tool with five core capabilities:

1. **AI Assistant** — Ask technical questions about Semco products. Online: Claude (claude-sonnet-4-6) answers using RAG over ingested TDS PDFs. Offline: FTS5 full-text search over the locally seeded product library.

2. **Material Calculator** — Enter area (m²) and substrate type. The app calculates exact quantities (kg, packs) for every product layer (primer → base coat × 2 → finish coat × 2 → sealer), with configurable waste percentage.

3. **Colour Formula Library** — Standard Semco XBond colours with pigment ratios in mL-per-quart / mL-per-gallon / mL-per-5-gallon. Installers can also save custom colour formulas.

4. **Project Manager** — Track client jobs: site address, substrate, colour, finish type, photo documentation by application stage (substrate → primer → base coat → finish coat → sealed → final), batch logs for warranty traceability.

5. **Product Library** — Offline-first product reference with full TDS content for every Semco SKU.

**Tech stack:**
- Expo SDK 53 / React Native 0.76 / TypeScript
- Expo Router v4 (file-based routing)
- Drizzle ORM + expo-sqlite (local SQLite)
- Supabase (auth, Postgres, storage, edge functions)
- PowerSync (real-time offline sync between SQLite ↔ Supabase)
- Zustand (state management)
- Anthropic SDK (`@anthropic-ai/sdk`) — Claude claude-sonnet-4-6
- OpenAI SDK (`openai`) — text-embedding-3-small for RAG embeddings
- pgvector (semantic search in Supabase)

---

## What Has Been Done

### Commit history (oldest → newest)

| Commit | What was built |
|---|---|
| `8c0a220` | Initial commit — blank repo |
| `0c2c3d2` | Full app scaffold: all screens, components, services, hooks, stores, DB schema, seed data, Supabase migrations, edge function |
| `6ac4f17` | PDF ingestion pipeline (`scripts/ingest-pdf.ts` + `scripts/lib/*`) — renders PDFs to images, sends to Claude for structured extraction, chunks text, embeds with OpenAI, upserts to Supabase |
| `d760498` | XBond mL colour formula system — rewrote `PigmentRatio` interface to mL-per-batch (quart/gallon/5-gallon), updated `color-scaler.ts`, `FormulaDisplay.tsx` (batch size picker), `colors/[id].tsx`, `colors/create.tsx`, CSV ingestion script (`scripts/ingest-colors-csv.ts`) |
| `c4cea89` | Claude Code permissions config (`.claude/settings.json`) — git, npm, npx, supabase CLI all allowed without prompting |
| `637810d` | `CODEBASE.txt` — full codebase dump for reference (not production code) |

### Files built

```
app/
  _layout.tsx                          Root layout (auth gate, DB init, seed, PowerSync init)
  (auth)/
    _layout.tsx                        Auth stack layout
    login.tsx                          Email/password login screen
    forgot-password.tsx                Password reset screen
  (app)/
    _layout.tsx                        Tab bar layout (5 tabs)
    assistant/index.tsx                AI chat screen
    calculator/index.tsx               Material calculator screen
    colors/
      index.tsx                        Colour library list
      [id].tsx                         Colour detail + formula viewer
      create.tsx                       Create custom colour
    products/
      index.tsx                        Product list
      [id].tsx                         Product TDS detail
    projects/
      index.tsx                        Project list
      [id].tsx                         Project detail + photos + batch logs
      create.tsx                       New project form

src/
  components/
    assistant/  ChatBubble, OfflineBanner, TypingIndicator
    calculator/ MaterialBreakdownCard, SubstratePicker, WasteToggle
    colors/     ColorSwatch, FormulaDisplay (with batch size selector)
    projects/   PhotoTimeline, ProjectCard
    ui/         Badge, Button, Card, Input (design system primitives)
  constants/
    substrates.ts       8 substrate types with primer requirements
    theme.ts            Semco dark theme (colours, typography, spacing, radius)
    waste-factors.ts    Default waste % per product category
  database/
    client.ts           Drizzle + expo-sqlite setup, initDatabase()
    powersync.ts        PowerSync schema + connector init
    schema/             Drizzle table definitions (products, colors, projects, project_photos, batch_logs, calculations, conversations)
    seed/
      products.json     8 Semco products with full TDS text
      colors.json       3 placeholder colours (to be replaced by CSV ingest)
      application-matrix.json  Layer stacks per substrate type
      index.ts          seedDatabase() — runs once on first app launch
  hooks/
    useAssistant.ts     Chat state management + routing (online/offline)
    useCalculator.ts    Calculator form state + calculate()
    useColorCamera.ts   Camera capture + Supabase Storage upload
    useNetworkStatus.ts Subscribes to expo-network, updates Zustand
  services/
    ai/
      assistant.ts      Top-level router: online → Claude+RAG, offline → FTS5
      claude.ts         Anthropic SDK wrapper with system prompt
      offline-search.ts FTS5 search over local SQLite products table
      rag.ts            Calls embed-and-search edge function
    calculator.ts       Pure calculation logic (no UI state)
    camera.ts           ImagePicker + Supabase Storage upload
    color-scaler.ts     mL formula scaling + PigmentRatio builder
    supabase.ts         Supabase client (AsyncStorage session persistence)
    sync/status.ts      expo-network wrapper (getNetworkStatus, subscribeToNetworkChanges)
  store/
    auth.ts             Zustand: session, user, signIn, signOut
    network.ts          Zustand: isOnline, syncPending
    ui.ts               Zustand: toast queue

supabase/
  functions/embed-and-search/index.ts  Deno edge function: embed query → pgvector search → return chunks
  migrations/
    001_initial.sql     All tables, RLS policies, match_product_embeddings() function, triggers
    002_ingestion.sql   Adds source_document + page_number to product_embeddings; widens category check

scripts/
  ingest-pdf.ts         CLI: ingest a TDS PDF → chunks → embeddings → Supabase
  ingest-colors.ts      CLI: ingest colours from a structured JSON file
  ingest-colors-csv.ts  CLI: ingest Semco XBond colour formulas from a CSV file
  lib/
    claude-extractor.ts Uses Claude Vision to extract structured data from PDF page images
    embedder.ts         OpenAI text-embedding-3-small wrapper + Supabase upsert
    pdf-renderer.ts     pdfjs-dist: renders PDF pages to canvas PNG images
    text-chunker.ts     Splits TDS text into overlapping chunks for embedding

.env.example            All required environment variables documented
.claude/settings.json   Automation permissions (git, npm, supabase CLI)
```

---

## What Is Left to Do

Complete each item below **one at a time**, in order.

---

### Step 1 — Create the `.env` file

Copy `.env.example` to `.env` and fill in all six values:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_POWERSYNC_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Where to find them:
- Supabase URL + keys: supabase.com → Project → Settings → API
- PowerSync URL: PowerSync dashboard → your instance URL
- Anthropic key: console.anthropic.com → API Keys
- OpenAI key: platform.openai.com → API Keys

The `.env` file is gitignored — it must never be committed.

---

### Step 2 — Run Supabase migrations

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This runs `001_initial.sql` and `002_ingestion.sql` against your Supabase Postgres instance. It creates all tables, RLS policies, the `match_product_embeddings()` function, and enables the `pgvector` extension.

Verify in the Supabase dashboard that these tables exist: `products`, `product_embeddings`, `colors`, `projects`, `project_photos`, `batch_logs`, `calculations`, `conversations`.

---

### Step 3 — Deploy the edge function

```bash
npx supabase functions deploy embed-and-search
```

Then set the function's secrets in the Supabase dashboard (Settings → Edge Functions → Secrets):
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected, verify it appears)

Test the function is live by calling it from the Supabase dashboard or via curl.

---

### Step 4 — Ingest Semco TDS PDFs

For each Semco product TDS PDF you have:

```bash
npx tsx scripts/ingest-pdf.ts --file ./pdfs/PRIMER-2K.pdf --sku PRIMER-2K
```

Run this for each PDF, one at a time. The script:
1. Renders each PDF page to an image
2. Sends the image to Claude (claude-sonnet-4-6) for text extraction
3. Chunks the extracted text
4. Embeds each chunk with OpenAI (text-embedding-3-small)
5. Upserts into `product_embeddings` in Supabase

After ingestion, test the AI assistant: ask "what is the pot life of the 2K primer?" — it should return the correct value from the TDS.

---

### Step 5 — Ingest real Semco XBond colour formulas

The current `src/database/seed/colors.json` contains three **placeholder** colours with made-up pigment ratios. They must be replaced with real Semco data.

**Option A — CSV from Semco:**
If Semco provides a CSV of colour formulas, run:
```bash
npx tsx scripts/ingest-colors-csv.ts --file ./data/semco-colors.csv
```

The CSV must have headers: `name,code,pigmentCode,pigmentName,mlPerQuart,mlPerGallon,mlPerFiveGallon`

**Option B — Manual entry:**
Edit `src/database/seed/colors.json` directly, following the existing structure. Each colour entry uses `PigmentRatio[]` with `mlPerQuart`, `mlPerGallon`, `mlPerFiveGallon` values per pigment.

After updating, rebuild and re-seed (delete the app's local SQLite DB on device/simulator and relaunch to trigger `seedDatabase()`).

---

### Step 6 — Configure PowerSync

1. Log into your PowerSync dashboard
2. Create a new PowerSync instance and connect it to your Supabase project (provide Supabase DB connection string)
3. Define sync rules in PowerSync to expose these tables to installers:
   - `projects` (filter by `installer_id = token_parameters.user_id`)
   - `project_photos` (filter by `installer_id`)
   - `batch_logs` (via project ownership)
   - `calculations` (filter by `installer_id`)
   - `colors` (all `is_standard = true` + own custom colours)
   - `conversations` (filter by `installer_id`)
4. Copy the PowerSync instance URL into `.env` as `EXPO_PUBLIC_POWERSYNC_URL`
5. Test sync: create a project on one device, verify it appears after going offline and back online

---

### Step 7 — Install dependencies and run the app

```bash
npm install
npx expo start
```

Test on a physical device (recommended) or simulator. Walk through:
- Sign up / log in
- Create a project
- Use the calculator (select substrate, enter area)
- Ask the AI assistant a product question (online and offline)
- View a colour formula in all three batch sizes
- Take a photo from the project screen

---

### Step 8 — Outstanding features to build

1. **Warranty PDF generation** ✅ DONE — `src/services/warranty-pdf.ts`; button in `projects/[id].tsx` when status = complete.

2. **Batch number QR/barcode scanner** ✅ DONE — `src/components/projects/BatchLogForm.tsx`; Add Batch button inline in `projects/[id].tsx`.

3. **Push notifications** — Notify the installer when a sync conflict is resolved, or when Semco pushes a product update. Use Expo Push Notifications + a Supabase database webhook.

4. **Admin panel** — A web interface (separate project or Supabase Studio + edge functions) for Semco staff to push product updates, view installer stats, and issue warranty revocations.

5. **Colour camera matching** — The `useColorCamera` hook already captures photos. The missing piece is sending the photo to Claude Vision to identify the closest matching Semco colour from the library.

6. **Calculation history** ✅ DONE — `app/(app)/calculator/history.tsx`; Save button in calculator; Calculations section in `projects/[id].tsx`.

7. **Onboarding flow** ✅ DONE — `app/(onboarding)/index.tsx`; 5-slide FlatList pager; AsyncStorage flag; redirected from `app/_layout.tsx` on first launch.

---

## Key Design Decisions (do not change without good reason)

- **mL-per-batch, not g/kg** — Colour formulas are stored as `mlPerQuart / mlPerGallon / mlPerFiveGallon`. This matches how Semco XBond tints are dispensed on-site. Do not revert to weight-based ratios.

- **Offline-first** — The app must work without internet. Local SQLite is the source of truth. Supabase is the sync target. The AI falls back to FTS5 when offline. Never make the app dependent on connectivity for core functions.

- **FTS5 on local SQLite** — The `products_fts` virtual table is created in `initDatabase()` with triggers to keep it in sync. The `searchProductsOffline()` function sanitises FTS5 query syntax before passing user input.

- **RLS everywhere** — Every Supabase table has Row Level Security enabled. Installers can only read/write their own data. Standard colours and products are read-only for all authenticated users. Do not disable RLS.

- **Service role key stays server-side** — `SUPABASE_SERVICE_ROLE_KEY` is used only in ingestion scripts and the edge function. It is never included in the Expo app bundle.

- **Colour seeding is one-time** — `seedDatabase()` exits early if any product row exists. To re-seed, delete the local SQLite file (`semco_pro.db`) on the device or simulator.

---

## Branch

All development is on:

```
claude/code-review-cleanup-ao5e5
```

Push all commits to this branch. Do not push to `main` without explicit approval.

```bash
git push -u origin claude/code-review-cleanup-ao5e5
```
