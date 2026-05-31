# SIP Manual Knowledge Assistant Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make the Semco assistant answer installer questions from the SIP manual as the base source of truth, with clear source-backed responses and room to add tech sheets later.

**Architecture:** Keep the current assistant flow, but make the SIP manual the authoritative knowledge source. Ingest the provided PDF into the knowledge store, then ensure the AI prompt and UI explicitly frame answers as knowledge-manual responses instead of a generic chatbot.

**Tech Stack:** Expo Router, React Native, TypeScript, Anthropic Claude Sonnet 4.6, Supabase embeddings/RAG, local PDF ingestion scripts.

---

### Task 1: Make the assistant explicitly knowledge-manual focused

**Objective:** Update the assistant prompt and UI labels so the app behaves like a knowledge manual, not a generic chat bot.

**Files:**
- Modify: `src/services/ai/claude.ts`
- Modify: `src/services/ai/assistant.ts`
- Modify: `src/components/assistant/ChatBubble.tsx`
- Modify: `src/components/assistant/TypingIndicator.tsx` if needed for visual cleanup
- Modify: `app/(app)/assistant/index.tsx` if wording still references chat/assistant language

**Step 1: Edit the system prompt**
- Make the prompt say the SIP manual is the primary source of truth.
- Require concise, source-backed answers.
- Require the model to say when the knowledge base does not contain an answer.

**Step 2: Update response labeling**
- Replace generic “product library” language with “SIP manual” or “knowledge manual”.
- Ensure offline or fallback responses are clearly source-labeled.

**Step 3: Verify**
- Run ESLint on the touched files.
- Confirm no lingering “generic assistant” wording remains in the main assistant surfaces.

---

### Task 2: Ingest the SIP manual as the base knowledge source

**Objective:** Process the provided PDF and populate the knowledge store so Claude can answer from the manual.

**Files:**
- Use: `scripts/ingest-pdf.ts`
- Use: `scripts/lib/pdf-renderer.ts`
- Use: `scripts/lib/claude-extractor.ts`
- Use: `scripts/lib/text-chunker.ts`
- Use: `scripts/lib/embedder.ts`

**Step 1: Run the ingestion pipeline on the SIP manual**
- Use the supplied PDF path from the current session.
- Treat it as the manual source of truth.
- Store the source document name as the manual name.

**Step 2: Verify the ingest output**
- Confirm pages were rendered.
- Confirm text was extracted.
- Confirm chunks were created and stored.
- Confirm source document and page metadata are present.

**Step 3: Verify the knowledge is queryable**
- Ask a simple question that should appear in the manual.
- Confirm the response includes manual-derived context.

---

### Task 3: Tighten answer behavior around source-backed knowledge

**Objective:** Ensure the assistant uses retrieved manual content before answering and avoids invented details.

**Files:**
- Modify: `src/services/ai/rag.ts`
- Modify: `src/services/ai/claude.ts`
- Modify: `src/services/ai/offline-search.ts` if the fallback wording needs to match the manual framing

**Step 1: Improve retrieval context formatting**
- Include page/source metadata in the context block when available.
- Make retrieved chunks easier for Claude to reference.

**Step 2: Add answer guardrails**
- The assistant should prefer the manual context.
- If the context does not support the answer, it should say so.

**Step 3: Verify**
- Run a sample Q&A path and check that the model response stays grounded.

---

### Task 4: Final verification and user handoff

**Objective:** Make sure the app is ready for manual testing.

**Files:**
- All modified files from Tasks 1–3

**Step 1: Run lint/tests**
- Run `npx eslint ...` on the touched files.
- Run any relevant app-level smoke checks if available.

**Step 2: Confirm git state**
- Ensure the working tree is clean except for intended changes.
- Commit and push to `semco-pro-preview`.

**Step 3: Report readiness**
- Tell the user the build is ready to test.
- Include what changed and what to look for in the app.
