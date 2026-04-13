import { Effect, Schema } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { streaming } from "../../components";
import type { Mode } from "../../shared/types";
import { updateDocument } from "./updateDocument";

type Args = {
  documentId: Id<"documents">;
  content: string;
  mode: Mode;
  additionalPrompt?: string;
};

class CreateStreamingJobsError extends Schema.TaggedErrorClass<CreateStreamingJobsError>()(
  "CreateStreamingJobsError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

class CreateStreamError extends Schema.TaggedErrorClass<CreateStreamError>()(
  "CreateStreamError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export const createDocumentProcessingStream = (ctx: MutationCtx, args: Args) =>
  Effect.gen(function* () {
    const { documentId, content, mode, additionalPrompt } = args;
    const streamId = yield* Effect.tryPromise({
      try: () => streaming.createStream(ctx),
      catch: (error) => new CreateStreamError({ error }),
    });

    yield* Effect.tryPromise({
      try: () =>
        ctx.db.insert("streamingJobs", {
          streamId,
          documentId,
          content,
          mode,
          additionalPrompt,
        }),
      catch: (error) => new CreateStreamingJobsError({ error }),
    });

    yield* updateDocument(ctx, {
      documentId,
      fields: { activeStreamId: streamId },
    });

    return streamId;
  });
