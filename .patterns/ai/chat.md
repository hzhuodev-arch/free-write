# Chat — stateful conversations

`Chat` wraps a `LanguageModel` with a mutable conversation history (`Ref<Prompt>`). Each
`generateText` / `streamText` call appends both the user input and the model output to the
history automatically, so follow-up turns have full context without you threading messages
manually.

## Create a chat

```ts
import { Chat } from "@effect/ai"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const chat = yield* Chat.empty

  const r1 = yield* chat.generateText({ prompt: "What is the capital of France?" })
  // History now holds the Q and A — the next turn sees them:
  const r2 = yield* chat.generateText({ prompt: "What's the population of that city?" })

  return [r1.text, r2.text]
})
```

Constructors:
- `Chat.empty` — fresh, empty session.
- `Chat.fromPrompt(prompt)` — seed with existing messages (e.g. a system prompt + prior turns).
- `Chat.fromExport(data)` — restore from a previous `export` (validates via Schema; can fail
  with `ParseError`).
- `Chat.makePersisted({...})` — a session backed by a persistence layer (see below).

A `Chat` instance is a plain service value — pass it around, or provide it via the `Chat.Chat`
tag for dependency injection.

## Same generation API as LanguageModel

`chat.generateText`, `chat.streamText`, and `chat.generateObject` take the **same options** as
the `LanguageModel` equivalents (`prompt`, `toolkit`, `toolChoice`, `concurrency`, …) and
infer errors/requirements the same way. They additionally require `LanguageModel.LanguageModel`
in context — provide a model layer as usual.

## Inspect & persist history

```ts
import { Ref } from "effect"

const messages = yield* Ref.get(chat.history) // direct access to the Prompt
const data     = yield* chat.export            // structured, storable snapshot
const json     = yield* chat.exportJson        // JSON string (fails with MalformedOutput)
```

Round-trip with `Chat.fromExport(yield* chat.export)`.

### Persisted chats

`Chat.makePersisted` integrates with `@effect/experimental` `BackingPersistence` to durably
store history under a key, so a conversation survives across processes/requests. Provide a
persistence backing layer along with the model layer.

## When to use Chat vs raw LanguageModel

- **`Chat`** — multi-turn conversations where history must accumulate (assistants, agents).
- **`LanguageModel` directly** — one-shot generation, structured extraction, or when *you*
  own the message history (e.g. it lives in your DB and you build the `Prompt` each call).
