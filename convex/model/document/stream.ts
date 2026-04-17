import { Effect, Stream } from "effect";
import { LanguageModel } from "effect/unstable/ai";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { streaming } from "../../components";
import { constructPrompt } from "../../llm/prompts/documentFormat";
import { AiPlan, LLMLayer } from "../../llm/providers";
import { ConvexMutationDb } from "../../service/db";
import type { Mode } from "../../shared/types";
import { updateDocument } from "./crud";
import { DocumentDbError } from "./errors";

// ── Stream creation (mutation-level) ─────────────────────────────────────

type CreateArgs = {
  documentId: Id<"documents">;
  content: string;
  mode: Mode;
  additionalPrompt?: string;
};

export const createDocumentProcessingStream = (
  ctx: MutationCtx,
  args: CreateArgs,
) =>
  Effect.gen(function* () {
    const { documentId, content, mode, additionalPrompt } = args;
    const db = yield* ConvexMutationDb;

    const streamId = yield* Effect.tryPromise({
      try: () => streaming.createStream(ctx),
      catch: (error) =>
        new DocumentDbError({ operation: "createStream", error }),
    });

    yield* Effect.tryPromise({
      try: () =>
        db.insert("streamingJobs", {
          streamId,
          documentId,
          content,
          mode,
          additionalPrompt,
        }),
      catch: (error) =>
        new DocumentDbError({ operation: "createStreamingJob", error }),
    });

    yield* updateDocument({
      documentId,
      fields: { activeStreamId: streamId },
    });

    return streamId;
  });

// ── LLM streaming (action-level) ────────────────────────────────────────

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
