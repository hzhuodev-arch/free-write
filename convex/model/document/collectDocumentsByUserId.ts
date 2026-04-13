import { Effect, Schema } from "effect";
import type { QueryCtx } from "../../_generated/server";

class CollectDocumentsError extends Schema.TaggedErrorClass<CollectDocumentsError>()(
  "CollectDocumentsError",
  {
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export const collectDocumentsByUserId = (ctx: QueryCtx, userId: string) =>
  Effect.tryPromise({
    try: () =>
      ctx.db
        .query("documents")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect(),
    catch: (error) => new CollectDocumentsError({ error }),
  });
