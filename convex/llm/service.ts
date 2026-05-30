import { Layer, ServiceMap, Stream } from "effect";
import type { AiError } from "effect/unstable/ai";
import { LanguageModel, type Response } from "effect/unstable/ai";
import type { Mode } from "../shared/types";
import { constructPrompt } from "./prompts/documentFormat";

export class LlmService extends ServiceMap.Service<
  LlmService,
  {
    readonly streamContent: (args: {
      readonly content: string;
      readonly mode: Mode;
      readonly additionalPrompt?: string;
    }) => Stream.Stream<string, AiError.AiError, LanguageModel.LanguageModel>;
  }
>()("LlmService") {}

const isTextDelta = (
  part: Response.StreamPart<Record<never, never>>,
): part is Response.TextDeltaPart => part.type === "text-delta";

export const llmServiceLive = Layer.succeed(LlmService)({
  streamContent: ({ content, mode, additionalPrompt }) =>
    LanguageModel.streamText({
      prompt: constructPrompt(content, mode, additionalPrompt),
    }).pipe(
      Stream.filter(isTextDelta),
      Stream.map((part) => part.delta),
    ),
});
