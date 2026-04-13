import { Effect, Schema } from "effect";
import type { MutationCtx } from "../../_generated/server";

class CreateDocumentError extends Schema.TaggedErrorClass<CreateDocumentError>()(
  "CreateDocumentError",
  {
    message: Schema.String.pipe(Schema.optional),
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

type Args = {
  userId: string;
  title?: string;
};

export const createDocument = (ctx: MutationCtx, args: Args) =>
  Effect.tryPromise({
    try: () =>
      ctx.db.insert("documents", {
        userId: args.userId,
        title: args.title ?? "Untitled",
        content: "",
      }),
    catch: (error) =>
      new CreateDocumentError({
        message: "Failed to create document",
        error,
      }),
  });
