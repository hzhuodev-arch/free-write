# PRD: Free Write — LLM-Powered Markdown Editor

> This document reflects the current built state of the app. It replaces the original MVP spec, which described a single-pane, localStorage-only tool; the project has since grown into a multi-document editor with a Convex-backed sync engine.

## Problem Statement

Writing in Markdown is friction-heavy for users who don't have its syntax memorized. The common workaround — drafting prose, pasting into an LLM chat, asking for a formatted rewrite, copying it back — is tedious and breaks writing flow. Free Write collapses that loop into a single editor: you write however you want (prose, dashes, indentation, shorthand) and hit ⌘S to have an LLM rewrite it into clean Markdown in place.

## Solution

A web app with a document-oriented editor. Each document has content stored on the Convex backend. The editor supports three view modes (editor-only, split, preview-only) selectable via URL search params. On ⌘S the current content is sent to an LLM which streams a reformatted version back; the stream is rendered live in the preview pane, and on completion the editor content is replaced with the LLM output. Streams are persistent — they continue server-side even if the client disconnects — and can be cancelled with Escape. Documents are listed in a sidebar; creation is optimistic. Multi-tab coordination is handled via a session-claim mechanism so two tabs editing the same doc don't clobber each other.

## User Stories

1. As a writer, I want to type free-form prose without worrying about Markdown syntax, so that I can focus on content rather than formatting.
2. As a writer, I want to use informal signals (dashes, arrows, indentation, blank lines), so that the LLM can infer my intended structure.
3. As a writer, I want to press ⌘S (Ctrl+S) to trigger the LLM rewrite, so that the action feels native to my existing save habit.
4. As a writer, I want the editor to lock while the LLM is streaming, so that I don't accidentally type over content that is about to be replaced.
5. As a writer, I want the LLM response to stream into the preview pane in real time, so that the wait feels short and I can watch progress.
6. As a writer, I want the formatted markdown to replace my raw input when the stream completes, so that subsequent edits build on clean markdown.
7. As a writer, I want a live rendered preview at all times, so that I can verify the output looks correct.
8. As a writer, I want to toggle between "format" and "restructure" modes, so that I can choose whether the LLM preserves my order or reorganizes for clarity.
9. As a writer, I want to optionally attach an extra one-off instruction via a prompt bar, so that I can steer a single transform without changing my default mode.
10. As a writer, I want ESC to cancel an in-flight stream, so that I can abort a bad rewrite without losing my input.
11. As a writer, I want my work stored on the backend, so that refreshing or switching devices never loses content.
12. As a writer, I want multiple documents with a sidebar, so that I can keep different drafts organized.
13. As a writer, I want document creation to feel instant, so that I can start typing before the backend confirms.
14. As a writer, I want to switch between editor-only, split, and preview-only views, so that I can focus on writing or reading as the task demands.
15. As a writer, I want a stream started in one tab to keep running if I close that tab, so that I never lose an LLM response to an accidental navigation.
16. As a writer, I want a second tab to show "this doc is being edited elsewhere" rather than silently race with the first tab, so that I don't corrupt my own content.
17. As a writer, I want to take over an abandoned session from another tab, so that I'm never locked out of my own document.
18. As a writer, I want code blocks and inline code to be correctly inferred and formatted, so that technical documentation renders properly.
19. As a writer, I want to render mermaid diagrams in the preview, so that I can include visuals without leaving the editor.
20. As a writer, I want a light/dark theme toggle, so that the editor matches my environment.
21. As a future user, I want authentication and per-user documents, so that I can use this across devices without a shared anonymous pool.
22. As a future user, I want to export or download a document as a `.md` file, so that I can use my content outside the app.

## Implementation

### Stack

- **Frontend:** TanStack Start (Router + SSR shell), React 19 with the React Compiler
- **Editor:** CodeMirror 6 via `@uiw/react-codemirror` with markdown syntax highlighting
- **Preview:** `react-markdown` + `remark-gfm` + `remark-breaks` + `rehype-highlight`, plus a custom `Mermaid` renderer for fenced `mermaid` blocks
- **Styling:** Tailwind v4, shadcn/ui primitives (sidebar, sheet, tooltip, …), `lucide-react` icons
- **Backend:** Convex (reactive queries + mutations + HTTP actions) with `@convex-dev/persistent-text-streaming` for server-persisted LLM streams
- **LLM layer:** Effect v4 (`effect` ^4.0.0-beta) with `@effect/ai-anthropic` and `@effect/ai-openrouter`, composed via `ExecutionPlan` for multi-model retry/fallback
- **Deployment:** Vercel (frontend) + Convex (backend)

### Source layout

```
src/
  editor/           # editor pane, preview pane, toolbar, prompt bar, provider + hooks
  shell/            # app chrome: sidebar, header, theme toggle, root document
  design-system/    # shadcn primitives
  lib/hooks/        # cross-cutting hooks: use-session-id, use-user-id, use-persisted-state, …
  routes/           # / (doc entry), /about, /doc (layout), __root
convex/
  documents.ts      # CRUD + session claim/release mutations/queries
  stream.ts         # stream lifecycle: create / cancel / finish, plus streamDocument HTTP action
  http.ts           # /stream-document route registration + CORS
  schema.ts         # documents + streamingJobs tables
  llm/              # providers (AiPlan + LLMLayer), stream composition, prompt construction, models
  model/            # Effect-based domain logic for documents and streams
  service/db.ts     # MutationDb / QueryDb service tags for Effect DI
  shared/           # types shared across backend modules
```

### Data model (`convex/schema.ts`)

- **`documents`**: `{ userId, content, title, activeStreamId?, activeSession? { sessionId, lastUpdatedAt } }`, indexed by `userId`
- **`streamingJobs`**: `{ streamId, documentId, content, mode, additionalPrompt? }`, indexed by `streamId`
- Plus the tables owned by the `persistentTextStreaming` Convex component

### Key flows

**Edit loop (content sync)**
`useContentSync` (in `src/editor/hooks/use-content-sync.ts`) holds a local buffer, debounces writes to `api.documents.updateContent`, and reconciles with server-side updates. The editor is controlled; mutations are session-gated so only the tab holding the active session can write.

**Transform (⌘S)**
`EditorProvider.transform`:
1. Flush the local content buffer to the server
2. `api.documents.claimSession({ documentId, sessionId })`
3. `api.stream.create({ documentId, content, mode, additionalPrompt?, sessionId })` — inserts a `streamingJobs` row, creates a persistent stream, patches `activeStreamId` on the document
4. The client opens the `/stream-document` HTTP action and passes the returned `streamId`; the server then drives the LLM stream and writes chunks
5. On stream completion, `stream.finish` (internal mutation) replaces `documents.content` with the full text and clears `activeStreamId`

**Cancel (Escape)**
`api.stream.cancel` clears `activeStreamId`. The document content is not rolled back — whatever was saved pre-transform remains.

**Multi-tab coordination**
`documents.activeSession` records the claiming `sessionId` plus a heartbeat (`lastUpdatedAt`). A second tab sees `sessionAvailable=false` unless the session is its own or the heartbeat is older than `SESSION_STALE_TIME_MS`. UI shows a `SessionLockedBanner` with a "take over" action that re-claims the session.

**Optimistic create**
`useCreateDocumentOptimistic` returns `{ tempId, resolve }`. The UI uses `tempId` as the `key` on `DocEditor` so the component survives the fake→real ID swap when the mutation resolves.

### LLM layer

- **`AiPlan`** (`convex/llm/providers.ts`): `ExecutionPlan` that tries `gemini-3.1-flash-preview` (2 attempts, exponential backoff) then falls back to `minimax-m2.5` (2 attempts, fixed backoff), retrying only on `AiError` marked `isRetryable`.
- **`LLMLayer`**: merged `OpenRouterClient` + `AnthropicClient` layers, both provided with a `FetchHttpClient` layer. API keys come from Convex env vars (`OPEN_ROUTER_API_KEY`, `ANTHROPIC_API_KEY`).
- **`streamContent`** (`convex/llm/stream.ts`): `LanguageModel.streamText` → filter to `text-delta` → `withExecutionPlan(AiPlan)` → `provide(LLMLayer)`. Provider swaps happen by editing `AiPlan` / `MODELS`; call sites don't change.
- **Prompts** (`convex/llm/prompts/documentFormat.ts`):
  - System: `"You are a markdown formatter. Output ONLY valid markdown, no commentary."`
  - Format mode: preserves the author's exact wording, tone, and phrasing; fixes typos; infers structure from informal signals.
  - Restructure mode: may reorder/reorganize for clarity while preserving language and voice.
  - Optional `additionalPrompt` is appended as extra user instructions.

### Client state

- **Content:** server-owned in Convex; client keeps a local debounced buffer via `useContentSync`.
- **Session id / user id:** generated client-side, persisted in localStorage via `use-session-id` / `use-user-id`.
- **UI preferences in localStorage:**
  - `free-write:mode` → `'format' | 'restructure'`
  - `free-write:selected-doc-id` → last-selected document id
  - Theme preference via the theme context
- **View mode:** URL search param `?view=editor|split|preview` on `/`.

## Testing

Target coverage once the test harness is populated (vitest is configured; no tests exist yet):

**Effect LLM layer**
- Retries on transient `AiError` with `isRetryable: true`; does not retry on non-retryable errors.
- Falls back from primary to secondary model when the primary exhausts retries.
- Emits a typed Effect failure after the full plan is exhausted.

**Stream lifecycle**
- `stream.create` writes a `streamingJobs` row and patches `activeStreamId`.
- `stream.finish` only replaces content when `activeStreamId` matches the finishing `streamId` (guards against a cancel+restart race).
- `stream.cancel` clears `activeStreamId` without touching content.

**Session coordination**
- Two tabs with different `sessionId`s: only the claiming tab can `updateContent`.
- A stale `activeSession` (older than `SESSION_STALE_TIME_MS`) can be taken over.
- Releasing a session owned by a different sessionId is a no-op.

**Editor flow**
- ⌘S during `streaming` is a no-op.
- Escape during `streaming` calls `stream.cancel`.
- Optimistic create: DocEditor's `key` survives the tempId→realId swap.

## Out of scope / deferred

- Authentication. The schema carries `userId` and all queries are scoped by it, but there is no auth provider — `userId` is a client-generated anonymous id in localStorage.
- Markdown export / download button.
- Collaborative (multi-cursor) editing. The session mechanism is lockout-based, not merge-based.
- Mobile/touch support.
- Undo history beyond the browser's native ⌘Z and CodeMirror's built-in history.
- LLM tone/length/expansion toggles beyond format/restructure.
- Toast/error surface for stream failures. The editor currently unlocks when `activeStreamId` clears, but there's no user-visible error channel for a failed LLM call.

## Further notes

- The LLM prompt is intentionally minimal and meant to be iterated based on real usage.
- When adding auth, Convex's built-in integrations (Clerk, Auth0) are the path of least resistance. Existing documents keyed by the anonymous `userId` can be claimed on first sign-in by patching `userId` on the user's docs.
- The download button (future) should export the server-persisted document content, not any transient editor buffer.
- The `vendor/effect-smol` subtree is present for LLM-context reference only; the app imports published `effect` / `@effect/ai-*` packages.
