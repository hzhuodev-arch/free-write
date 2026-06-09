import {
  OpenRouterClient,
  OpenRouterLanguageModel,
} from "@effect/ai-openrouter";
import {
  Config,
  ConfigProvider,
  Effect,
  ExecutionPlan,
  Layer,
  Schedule,
} from "effect";
import type { AiError } from "effect/unstable/ai";
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

// Adapts one OpenRouter model into the provider-agnostic `LanguageModel` service.
// The `OpenRouterClient` requirement is left unsatisfied so the shared client
// (built once via `openRouterClientLayer`) is reused across every model in the
// execution plan below, rather than each model opening its own.
const modelLayer = (model: string) => OpenRouterLanguageModel.layer({ model });

// Resilient strategy for streaming generation: attempt each model up to 3 times
// with exponential backoff, then fall back to the next model in the chain.
//   gemini → kimi → minimax
// Applied with `Stream.withExecutionPlan`; consumers depend only on the abstract
// `LanguageModel`, which each step provides for the duration of its attempt.
const retryWithBackoff = {
  attempts: 3,
  schedule: Schedule.exponential("500 millis"),
  // Only spend retries on transient failures (rate limits, network, provider
  // 5xx). Non-retryable errors (auth, content policy, bad request) stop the
  // step immediately and fall through to the next model in the chain.
  while: (error: AiError.AiError) => error.isRetryable,
} as const;

export const streamModelPlan = ExecutionPlan.make(
  {
    provide: modelLayer(MODELS["gemini-3.1-flash-preview"]),
    ...retryWithBackoff,
  },
  { provide: modelLayer(MODELS["kimi-k2.5"]), ...retryWithBackoff },
  { provide: modelLayer(MODELS["minimax-m2.5"]), ...retryWithBackoff },
);
