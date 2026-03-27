# PRD: Free Write — LLM-Powered Markdown Editor

## Problem Statement

Writing in Markdown is friction-heavy for users who don't have its syntax memorized. The current workaround — writing free-form text, copying it into an LLM chat, asking it to reformat, then copying the result back — is tedious and breaks writing flow. There is no tool that combines a distraction-free text editor with automatic, on-demand LLM-powered markdown formatting in a single seamless experience.

## Solution

A local web app with a split-pane editor. The left pane accepts free-form text input — prose, rough notes, informal signals like dashes and indentation. On Ctrl+S, the content is sent to an LLM which converts it into well-structured, valid Markdown. The result streams into the right pane (rendered preview) in real time, then replaces the left pane content when complete. The user can toggle between "format only" and "restructure" modes via a toolbar. Content persists in localStorage so refreshing the page never loses work.

## User Stories

1. As a writer, I want to type free-form prose without worrying about Markdown syntax, so that I can focus on content rather than formatting.
2. As a writer, I want to use informal signals like dashes, indentation, and blank lines, so that the LLM can infer my intended structure.
3. As a writer, I want to press Ctrl+S (or Command+S on MacOS) to trigger LLM formatting, so that the action feels native to my existing save habit.
4. As a writer, I want the left pane to lock while the LLM is processing, so that I don't accidentally type over content that is about to be replaced.
5. As a writer, I want the LLM response to stream into the right pane in real time, so that the wait feels short and I can see formatting progress.
6. As a writer, I want the formatted markdown to replace my raw input in the left pane when complete, so that subsequent edits build on clean markdown.
7. As a writer, I want to see a rendered preview of my markdown in the right pane at all times, so that I can verify the output looks correct.
8. As a writer, I want a toolbar toggle to switch between "format only" and "restructure" modes, so that I can choose whether the LLM preserves my content order or reorganizes it.
9. As a writer, I want "format only" mode to preserve my exact wording and order, so that the LLM acts as a formatter, not an editor.
10. As a writer, I want "restructure" mode to allow the LLM to reorder and reorganize content for clarity, so that I can use it for polishing drafts.
11. As a writer, I want my content to be automatically saved to localStorage, so that a browser refresh never loses my work.
12. As a writer, I want my toolbar mode preference to be saved to localStorage, so that I don't have to reconfigure it each session.
13. As a writer, I want a toast notification if the LLM call fails, so that I know something went wrong without losing my content.
14. As a writer, I want my original text to be restored if the LLM call fails, so that a network error or API failure never destroys my work.
15. As a writer, I want failed LLM calls to be retried automatically with backoff, so that transient errors resolve without manual intervention.
16. As a writer, I want a visual indicator in the toolbar while the LLM is processing, so that I know the system is working.
17. As a writer, I want the editor to handle notes, technical documentation, and task lists equally well, so that I can use one tool for all my writing.
18. As a writer, I want code blocks and inline code to be correctly inferred and formatted, so that technical documentation renders properly.
19. As a future user, I want the app to support multiple user accounts, so that I can use it on a team or share it with others.
20. As a future user, I want my documents to persist in a database rather than only localStorage, so that I can access them across devices.
21. As a future user, I want a download button to save my markdown to a local file, so that I can use my content outside the app.

## Implementation Decisions

### Modules

**`EditorPane`**

- CodeMirror 6 via `@uiw/react-codemirror` with markdown syntax highlighting
- Accepts `content`, `locked`, and `onSave` props
- Emits Ctrl+S via `onSave` callback
- When `locked=true`, editor is read-only and visually dimmed
- Does not own content state — fully controlled component

**`PreviewPane`**

- `react-markdown` + `remark-gfm` + `rehype-highlight`
- Accepts a `content` string prop
- Stateless — re-renders on every chunk during streaming
- Shows a subtle loading indicator when streaming is active

**`useEditorSession` (hook)**

- Owns all editor state: `content`, `locked`, `mode`, `streaming`
- On save trigger:
  1. Snapshot current content
  2. Lock editor
  3. Call Convex streaming action with `{ content, mode }`
  4. Update `previewContent` on each streamed chunk
  5. On completion: set `content` to full LLM output, unlock
  6. On failure: restore snapshot, unlock, emit error for toast
- Syncs `content` and `mode` to localStorage on every change
- Hydrates from localStorage on mount

**`transformText` (Convex HTTP action)**

- Accepts `{ content: string, mode: 'format' | 'restructure' }`
- Calls LLM API via injected `llmClient` Effect v4 service
- Streams response chunks back as a streaming HTTP response
- Returns error envelope on failure (after retries exhausted)
- LLM prompt:
  - System: "You are a markdown formatter. Output ONLY valid markdown, no commentary."
  - Format mode: "Preserve exact wording and order. Infer structure from informal signals."
  - Restructure mode: adds "You may reorder and reorganize content for clarity."

**`llmClient` (Effect v4 service)**

- Wraps the LLM SDK (Claude by default, configurable via environment variable)
- Implements exponential backoff retry (3 attempts)
- Normalizes API errors into typed Effect failures
- Injected as a dependency into `transformText` — swap providers without touching action logic

**`Toolbar`**

- Presentational component: format/restructure toggle switch + streaming spinner
- Accepts `mode`, `onModeChange`, `loading` props

### Architecture Decisions

- LLM API key stored as a Convex environment variable — never exposed to the client
- Convex schema includes an optional `userId` field on all document types to support future auth without migration
- No auth in MVP — all requests are anonymous
- Streaming is implemented via Convex HTTP actions (not queries/mutations) since they support streaming responses
- The LLM provider is dependency injected into the program at runtime (with Effect v4's dependency injection model / ExecutionPlan in its AI module)
- The backend uses **Effect v4** (`effect-smol`) — source is vendored at `vendor/effect-smol` as a git subtree for LLM reference
- TanStack Start handles routing and SSR shell; most logic is client-side
- Deployed on Vercel; Convex is its own hosted backend

### localStorage Schema

```
free-write:content  → string (current editor content)
free-write:mode     → 'format' | 'restructure'
```

## Testing Decisions

**What makes a good test:** Tests should verify observable behavior from the outside — inputs and outputs — not internal implementation details. Do not test that a specific function was called; test that the correct outcome occurred.

**`useEditorSession`**

- Test: on save, editor locks and content is replaced with LLM output on success
- Test: on save, original content is restored and editor unlocks on LLM failure
- Test: content and mode are persisted to localStorage on change
- Test: content and mode are hydrated from localStorage on mount
- Test: a second Ctrl+S while locked is a no-op

**`llmClient`**

- Test: retries up to 3 times on transient failure before emitting an error
- Test: does not retry on non-retryable errors (e.g., 400 invalid request)
- Test: emits a typed error after retries are exhausted
- Test: successfully returns streamed content on first-attempt success

## Out of Scope

- Authentication and user accounts (MVP is single-user, anonymous)
- Database persistence (localStorage only for MVP)
- File system open/save (download button deferred)
- Multiple documents or tabs within a session
- Undo history beyond the browser's native Ctrl+Z
- LLM behavior toggles beyond format/restructure (e.g., tone, expansion)
- Mobile/touch support
- Collaborative editing

## Further Notes

- The LLM prompt should be iterated on based on real usage — the initial prompt is intentionally minimal
- When adding auth, Convex's built-in auth integrations (Clerk, Auth0) are the path of least resistance given the existing Convex backend
- The download button (future) should export the LLM-formatted content from the left pane, not the raw input
- localStorage is the migration path to DB persistence: on auth launch, sync localStorage content to the user's Convex document on first login
