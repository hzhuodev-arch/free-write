
import { Effect, Schema } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

class GetDocumentError extends Schema.TaggedErrorClass<GetDocumentError>()(
  "GetDocumentError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

class DocumentNotFoundError extends Schema.TaggedErrorClass<DocumentNotFoundError>()(
  "DocumentNotFoundError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}
export const getDocument = (ctx: QueryCtx, id: Id<"documents">) =>
  Effect.gen(function* () {
    const doc = yield* Effect.tryPromise({
      try: () => ctx.db.get(id),
      catch: (error) => new GetDocumentError({ error }),
    });
    if (!doc) return yield* new DocumentNotFoundError();
    return doc;
  });
