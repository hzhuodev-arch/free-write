# Effect AI — Idiomatic Patterns

Distilled from the vendored `@effect/ai` source (`repos/effect/packages/ai/*`). This is
reference context for writing **quality** Effect AI code in this app. Patterns here mirror
the actual library APIs and JSDoc examples — prefer them over guesses or web snippets.

> Application code imports from the published packages (`@effect/ai`, `@effect/ai-anthropic`,
> `@effect/ai-openai`, …). **Never import from `repos/`.** `repos/effect` is read-only
> reference material only.

## The mental model

Effect AI separates **three concerns**, each a distinct layer in the dependency graph:

1. **Client** — raw HTTP transport + auth for one provider (`AnthropicClient`, `OpenAiClient`).
   Requires an `HttpClient`. Holds the API key (`Redacted`).
2. **Provider model** — adapts a client into a provider-agnostic service such as
   `LanguageModel`, `EmbeddingModel`, or `Tokenizer` (`AnthropicLanguageModel.layer(...)`).
3. **Capability service** — the provider-agnostic API your business logic actually calls:
   `LanguageModel.generateText`, `LanguageModel.streamText`, `LanguageModel.generateObject`,
   `EmbeddingModel.embed`, `Chat`.

Your domain logic depends only on the **capability service tag** (e.g.
`LanguageModel.LanguageModel`). You can swap Anthropic for OpenAI by swapping a single
layer — the program is untouched. `Model.make(provider, layer)` bundles a provider's layers
behind a named handle that is *both* a `Layer` and an `Effect`.

```
HttpClient ──▶ AnthropicClient ──▶ AnthropicLanguageModel.layer ──▶ LanguageModel
                                                                       ▲
                                                  your Effect.gen program depends here
```

## Non-negotiable conventions (observed everywhere in the source)

- **Effects, not promises.** Every capability returns an `Effect` or `Stream`. Compose with
  `Effect.gen(function* () { ... })`; never `await`.
- **Wire dependencies with layers, run at the edge.** Build programs against tags, then
  `Effect.provide(...)` the model/toolkit/client layers once, near `main`.
- **Schema is the contract.** Structured output and tool params/results are `effect/Schema`
  schemas — the library decodes/validates/encodes for you. Don't hand-parse JSON.
- **Errors are typed and tagged.** Failures surface as `AiError` (`MalformedOutput`,
  `MalformedInput`, `HttpRequestError`, `HttpResponseError`, `UnknownError`). Match on `_tag`.
- **Secrets are `Redacted`.** API keys use `Redacted.Redacted` so they never leak into logs.
- **Tracing is built in.** Generation calls open spans automatically; provider layers add
  GenAI telemetry attributes. Don't add manual logging around calls.

## Index

- [`language-model.md`](./language-model.md) — text generation, structured output, streaming
- [`tools-and-toolkits.md`](./tools-and-toolkits.md) — defining tools, toolkits, handlers
- [`providers-and-models.md`](./providers-and-models.md) — wiring clients, provider layers, `Model`
- [`chat.md`](./chat.md) — stateful conversations & persistence
- [`prompts-and-errors.md`](./prompts-and-errors.md) — prompt construction & error handling
