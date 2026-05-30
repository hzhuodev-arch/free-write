# Prompts & Errors

## Prompts

`prompt` options accept a `Prompt.RawInput`, normalized internally by `Prompt.make`:

- **A string** → becomes a single `user` message.
- **A messages array** → decoded into a structured `Prompt` (validated against the schema).
- **An existing `Prompt`** → used as-is.

```ts
import { Prompt } from "@effect/ai"

// String (simplest)
const a = Prompt.make("Hello, how are you?")

// Structured messages
const b = Prompt.make([
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: [{ type: "text", text: "Hi!" }] }
])

// Built explicitly
const c = Prompt.fromMessages([
  Prompt.makeMessage("system", { content: "You are a coding assistant." }),
  Prompt.makeMessage("user", { content: [Prompt.makePart("text", { text: "Help with TS" })] })
])
```

Useful constructors:
- `Prompt.empty` — empty prompt to build onto.
- `Prompt.fromMessages(messages)` — from a `Message[]`.
- `Prompt.makeMessage(role, { content })` / `Prompt.makePart(type, {...})` — typed builders.
- `Prompt.fromResponseParts(...)` — turn a previous response's parts into prompt messages
  (for assembling conversation history manually).

Messages and parts carry typed `content` (text, images, files, tool calls/results). Providers
extend message options via module augmentation — e.g. Anthropic adds `cacheControl` for prompt
caching on system/user messages. Reach for those provider options through the typed
`anthropic`/`openai` fields rather than raw request manipulation.

## Errors

All failures are instances of `AiError` (a tagged union). Match on `_tag` with
`Effect.catchTag` / `Effect.catchTags`, and use `AiError.isAiError(u)` as a guard.

| `_tag`              | Meaning |
|---------------------|---------|
| `MalformedOutput`   | Model output couldn't be decoded/validated (bad JSON, schema mismatch, empty object). |
| `MalformedInput`    | A tool result failed to validate/encode, or input was malformed. |
| `HttpRequestError`  | The request to the provider failed to send. |
| `HttpResponseError` | The provider returned an error response. |
| `UnknownError`      | Anything uncategorized. |

```ts
import { AiError, LanguageModel } from "@effect/ai"
import { Effect, Schema } from "effect"

const safe = LanguageModel.generateObject({ prompt, schema: MySchema }).pipe(
  Effect.map((r) => r.value),
  Effect.catchTags({
    MalformedOutput: (e) => Effect.succeed(/* fallback */ null),
    HttpResponseError: (e) => Effect.logError(`provider ${e._tag}`).pipe(Effect.as(null))
  })
)
```

Principles:
- **Don't try/catch.** Errors live in the Effect error channel and are exhaustively typed —
  the compiler tells you what can fail (including tool handler failures when a toolkit is used).
- **`generateObject` schema failures are expected**, not exceptional — surface them as
  `MalformedOutput` and decide on a fallback or retry rather than letting them throw.
- **`failureMode: "return"`** on a tool keeps a handler failure *out* of the error channel,
  feeding it back to the model instead (see [`tools-and-toolkits.md`](./tools-and-toolkits.md)).
- Use `Effect.retry` with a schedule for transient `HttpRequestError`/`HttpResponseError`.
