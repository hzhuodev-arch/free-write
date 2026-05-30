# LanguageModel — generation patterns

`LanguageModel` is the provider-agnostic text-generation service. Your code depends on the
`LanguageModel.LanguageModel` tag; a provider layer supplies the implementation (see
[`providers-and-models.md`](./providers-and-models.md)).

There are two equivalent ways to call it:

- **Accessors** — `LanguageModel.generateText(...)` — pull the service from context implicitly.
  This is the idiomatic default.
- **Service methods** — `yield* LanguageModel.LanguageModel` then `model.generateText(...)`.
  Use when you need the service value itself.

## Text generation

```ts
import { LanguageModel } from "@effect/ai"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const response = yield* LanguageModel.generateText({
    prompt: "Explain quantum computing"
  })

  response.text          // concatenated text parts
  response.finishReason  // "stop" | "length" | ...
  response.usage         // { inputTokens, outputTokens, totalTokens, reasoningTokens, ... }
  response.reasoningText // reasoning text, if the model produced any
  return response
})
```

`prompt` accepts a `Prompt.RawInput`: a bare string (becomes a single user message), a
messages array, or an existing `Prompt`. See [`prompts-and-errors.md`](./prompts-and-errors.md).

The response is a `GenerateTextResponse` whose `.content` is an array of typed `Response.Part`s
(`text`, `reasoning`, `tool-call`, `tool-result`, `finish`, …). The getters (`.text`,
`.toolCalls`, `.toolResults`, `.usage`) are conveniences over that array.

## Structured output — `generateObject`

Pass a `Schema` and get back a decoded, validated value on `.value`. This is the right tool
whenever you need typed data rather than prose — never parse the model's text yourself.

```ts
import { LanguageModel } from "@effect/ai"
import { Effect, Schema } from "effect"

const Event = Schema.Struct({
  title: Schema.String,
  date: Schema.String,
  location: Schema.String
})

const extract = Effect.gen(function* () {
  const response = yield* LanguageModel.generateObject({
    prompt: "Extract event info: Tech Conference on March 15th in San Francisco",
    schema: Event,
    objectName: "event" // optional; guides some providers. Defaults to schema _tag/identifier
  })
  return response.value // typed as { title; date; location }
})
```

If the model returns no text, or the text fails to conform to the schema, the effect fails
with `AiError.MalformedOutput` — handle it like any other typed error.

## Streaming — `streamText`

Returns a `Stream` of `Response.StreamPart`s. Switch on `part.type`; text arrives as
`"text-delta"` parts.

```ts
import { LanguageModel } from "@effect/ai"
import { Console, Effect, Stream } from "effect"

const program = LanguageModel.streamText({
  prompt: "Write a story about a space explorer"
}).pipe(
  Stream.runForEach((part) =>
    part.type === "text-delta" ? Console.log(part.delta) : Effect.void
  )
)
```

Streaming also emits `tool-call` parts *before* the corresponding `tool-result` parts, so a
UI can show "calling tool…" before the result lands.

## Common options (all three functions)

- `toolkit` — a `Toolkit.WithHandler` (or an `Effect` yielding one) to enable tool calling.
  See [`tools-and-toolkits.md`](./tools-and-toolkits.md).
- `toolChoice` — `"auto"` (default) | `"required"` | `"none"` | `{ tool: name }` |
  `{ mode?, oneOf: [...] }`.
- `concurrency` — how many tool calls resolve in parallel.
- `disableToolCallResolution: true` — return tool calls without auto-executing handlers (you
  drive the loop yourself).

## Error & context inference

The return type's error and requirement channels are **inferred from the options you pass**.
With no toolkit you get `AiError`; add a toolkit and the tools' handler errors and service
requirements flow into the `E` and `R` channels automatically. Provide those requirements
(toolkit layer, model layer) before running.
