import { Effect, Schema } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

class DeleteDocumentError extends Schema.TaggedErrorClass<DeleteDocumentError>()(
  "DeleteDocumentError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export const deleteDocument = (ctx: MutationCtx, documentId: Id<"documents">) =>
  Effect.tryPromise({
    try: () => ctx.db.delete(documentId),
    catch: (error) => new DeleteDocumentError({ error }),
  });
