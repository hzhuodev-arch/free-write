import { Stream } from "effect";
import { LanguageModel } from "effect/unstable/ai";
import type { Mode } from "../shared/types";
import { constructPrompt } from "./prompts/documentFormat";
import { AiPlan, LLMLayer } from "./providers";

export const streamContent = (
  content: string,
  mode: Mode,
  additionalPrompt?: string,
) =>
  LanguageModel.streamText({
    prompt: constructPrompt(content, mode, additionalPrompt),
  }).pipe(
    Stream.filter((part) => part.type === "text-delta"),
    Stream.map((part) => part.delta),
    Stream.withExecutionPlan(AiPlan),
    Stream.provide(LLMLayer),
  );
