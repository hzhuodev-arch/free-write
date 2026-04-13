import { Effect, Schema } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { getDocument } from "./getDocument";

type Args = {
  documentId: Id<"documents">;
  fields: {
    content?: string;
    title?: string;
    activeStreamId?: string | undefined;
    activeSession?:
      | {
          sessionId: string;
          lastUpdatedAt: number;
        }
      | undefined;
  };
};

class UpdateDocumentError extends Schema.TaggedErrorClass<UpdateDocumentError>()(
  "UpdateDocumentError",
  {
    message: Schema.String.pipe(Schema.optional),
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export const updateDocument = (ctx: MutationCtx, args: Args) =>
  Effect.gen(function* () {
    if (Object.keys(args.fields).length === 0) return yield* Effect.void;
    yield* getDocument(ctx, args.documentId).pipe(
      Effect.catchTag("GetDocumentError", () =>
        Effect.succeed("Query error, continue execution"),
      ),
    );
    return yield* Effect.tryPromise({
      try: () => ctx.db.patch(args.documentId, args.fields),
      catch: (error) =>
        new UpdateDocumentError({
          message: `Failed to update document fields: ${Object.keys(args.fields).join(", ")}`,
          error,
        }),
    });
  });
