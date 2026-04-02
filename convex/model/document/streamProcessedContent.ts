import { AnthropicClient } from "@effect/ai-anthropic";
import * as OpenRouterClient from "@effect/ai-openrouter/OpenRouterClient";
import {
  ExecutionPlan,
  Layer,
  pipe,
  Redacted,
  Schedule,
  Stream,
} from "effect";
import { type AiError, LanguageModel, Prompt } from "effect/unstable/ai";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { MODELS } from "../../llm/models";
import type { Mode } from "../../shared/types";

const AiPlan = ExecutionPlan.make(
  {
    provide: MODELS["gemini-3.1-flash-preview"],
    attempts: 2,
    schedule: Schedule.exponential("100 millis", 1.5),
    while: (e: AiError.AiError) => e.reason.isRetryable,
  },
  {
    provide: MODELS["claude-sonnet-4-6"],
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

const LLMLayer = pipe(
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

const constructPrompt = (content: string, mode: Mode) => {
  const userInstruction =
    mode === "format"
      ? "Fix typos and grammatical errors, but preserve the author's exact wording, tone, and phrasing otherwise. Infer structure from informal signals. Do not reorder or rewrite."
      : "Fix typos and grammatical errors. You may reorder, restructure, and reorganize content for improved clarity, but preserve the author's language and voice.";

  return Prompt.make([
    {
      role: "system",
      content:
        "You are a markdown formatter. Output ONLY valid markdown, no commentary.",
    },
    {
      role: "user",
      content: [{ type: "text", text: `${userInstruction}\n\n${content}` }],
    },
  ]);
};

export const streamContent = (content: string, mode: Mode) =>
  LanguageModel.streamText({
    prompt: constructPrompt(content, mode),
  }).pipe(
    Stream.filter((part) => part.type === "text-delta"),
    Stream.map((part) => part.delta),
    Stream.withExecutionPlan(AiPlan),
    Stream.provide(LLMLayer),
  );
