# Providers, Clients & `Model`

This is the wiring layer: how a concrete provider (Anthropic, OpenAI, …) becomes the
`LanguageModel` your program depends on. Three nested layers, built bottom-up.

## 1. The client layer (transport + auth)

The client owns the HTTP connection and credentials. API keys are always `Redacted` so they
can't leak into logs. It requires an `HttpClient`.

```ts
import { AnthropicClient } from "@effect/ai-anthropic"
import { FetchHttpClient } from "@effect/platform"
import { Config, Layer } from "effect"

// From explicit Redacted values:
const ClientLayer = AnthropicClient.layer({
  apiKey: Config.redacted("ANTHROPIC_API_KEY") as any // see layerConfig below
}).pipe(Layer.provide(FetchHttpClient.layer))
```

Prefer **`layerConfig`** to read settings from Effect `Config` (env vars) idiomatically — its
fields take `Config.Config<...>` instead of raw values:

```ts
const ClientLayer = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY")
}).pipe(Layer.provide(FetchHttpClient.layer))
```

Other client options: `apiUrl` (point at a proxy/mock), `anthropicVersion`, and
`transformClient` (wrap the `HttpClient` for retries, logging, metrics, custom middleware).

## 2. The provider model layer

Adapts the client into a `LanguageModel`. You pick the model id and optional per-provider
config (max tokens, temperature, etc.):

```ts
import { AnthropicLanguageModel } from "@effect/ai-anthropic"

const ModelLayer = AnthropicLanguageModel
  .layer({ model: "claude-sonnet-4-5", config: { max_tokens: 4096 } })
  .pipe(Layer.provide(ClientLayer)) // requires AnthropicClient

// layerWithTokenizer additionally provides Tokenizer for token counting.
```

`AnthropicLanguageModel.make({ model, config })` is the underlying `Effect` constructor if you
need to build the service by hand (e.g. inside another service).

### Per-request config override

`AnthropicLanguageModel.withConfigOverride(config)` (and the `Config` tag) let you tweak
provider settings for a single call without rebuilding the layer:

```ts
LanguageModel.generateText({ prompt }).pipe(
  AnthropicLanguageModel.withConfigOverride({ temperature: 0.2 })
)
```

## 3. `Model` — a named, swappable bundle

`Model.make(providerName, layer)` wraps a provider's layer behind a string-tagged handle.
A `Model` is **both a `Layer` and an `Effect`**:

- **As a Layer** — `Effect.provide(myModel)` to satisfy `LanguageModel` for a program.
- **As an Effect** — `yield* myModel` inside a service to lift the model's own dependencies
  into the parent, returning a `Layer` you can apply locally.

It also auto-provides `Model.ProviderName`, so code can branch on which provider is active.

```ts
import { AnthropicLanguageModel } from "@effect/ai-anthropic"
import { LanguageModel, Model } from "@effect/ai"
import { Effect } from "effect"

// AnthropicLanguageModel.model(...) is sugar for Model.make("anthropic", layer(...))
const Claude = AnthropicLanguageModel.model("claude-sonnet-4-5")

const program = Effect.gen(function* () {
  const provider = yield* Model.ProviderName // "anthropic"
  return yield* LanguageModel.generateText({ prompt: `Hello from ${provider}!` })
}).pipe(Effect.provide(Claude)) // still needs AnthropicClient provided upstream
```

## Putting it together at the edge

Build the full stack once, near your entrypoint, and provide it to the whole program:

```ts
const AppModel = AnthropicLanguageModel
  .model("claude-sonnet-4-5")
  .pipe(
    Layer.provide(AnthropicClient.layerConfig({ apiKey: Config.redacted("ANTHROPIC_API_KEY") })),
    Layer.provide(FetchHttpClient.layer)
  )

myProgram.pipe(Effect.provide(AppModel), Effect.provide(MyToolkitLayer))
```

Swapping providers = swapping `AppModel`. Domain code that depends on `LanguageModel` /
`EmbeddingModel` / `Chat` never changes.

## Embeddings

`EmbeddingModel` follows the same shape. Build it from a provider layer, or construct directly
with batching + caching for efficiency:

```ts
import { EmbeddingModel } from "@effect/ai"
import { Duration } from "effect"

const embeddings = EmbeddingModel.make({
  embedMany: (texts) => Effect.succeed(/* vectors */),
  maxBatchSize: 50,
  cache: { capacity: 1000, timeToLive: Duration.minutes(30) }
})
```
