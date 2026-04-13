import { AnthropicClient } from "@effect/ai-anthropic";
import * as OpenRouterClient from "@effect/ai-openrouter/OpenRouterClient";
import { ExecutionPlan, Layer, pipe, Redacted, Schedule } from "effect";
import type { AiError } from "effect/unstable/ai";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { MODELS } from "./models";

export const AiPlan = ExecutionPlan.make(
  {
    provide: MODELS["gemini-3.1-flash-preview"],
    attempts: 2,
    schedule: Schedule.exponential("100 millis", 1.5),
    while: (e: AiError.AiError) => e.reason.isRetryable,
  },
  {
    provide: MODELS["minimax-m2.5"],
    attempts: 2,
    schedule: Schedule.fixed("100 millis"),
    while: (e: AiError.AiError) => e.reason.isRetryable,
  },
);

export const LLMLayer = pipe(
  OpenRouterClient.layer({
    apiKey: Redacted.make(process.env.OPEN_ROUTER_API_KEY ?? ""),
  }),
  Layer.merge(
    AnthropicClient.layer({
      apiKey: Redacted.make(process.env.ANTHROPIC_API_KEY ?? ""),
    }),
  ),
  Layer.provide(FetchHttpClient.layer),
);
