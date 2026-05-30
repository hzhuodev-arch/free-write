import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";
import { Config, ConfigProvider, Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { MODELS } from "./models";

// Effect can't use its default ConfigProvider here: it probes `import.meta.env`
// (unsupported in Convex's runtime) and enumerates `process.env`, but Convex's
// `process.env` is a non-enumerable shim — direct `process.env.FOO` access works,
// yet spreading it yields `{}`. So build the provider from the specific env vars
// this backend reads, accessed directly. Lazy (Effect.sync) so the value is read
// when the layer builds at request time, where Convex has injected env vars.
const convexConfigProviderLayer = ConfigProvider.layer(
  Effect.sync(() => {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    return ConfigProvider.fromEnv({
      env: apiKey ? { OPEN_ROUTER_API_KEY: apiKey } : {},
    });
  }),
);

// Transport + auth. The API key is read from Config (env) as a Redacted value so
// it can never leak into logs. Requires an HttpClient, satisfied by FetchHttpClient
// (Convex's runtime exposes a global `fetch`).
export const openRouterClientLayer = OpenRouterClient.layerConfig({
  apiKey: Config.redacted("OPEN_ROUTER_API_KEY"),
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(convexConfigProviderLayer),
);

// Adapts the OpenRouter client into the provider-agnostic `LanguageModel` service.
// Swapping providers (or the model) means swapping this single layer — domain code
// that depends on `LanguageModel` never changes.
export const openRouterModelLayer = OpenRouterLanguageModel.layer({
  model: MODELS["gemini-3.1-flash-preview"],
}).pipe(Layer.provide(openRouterClientLayer));
