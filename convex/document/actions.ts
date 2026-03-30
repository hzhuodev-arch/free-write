import { v } from "convex/values";
import { Effect } from "effect";
import { action } from "../_generated/server";
import {
  DocumentService,
  DocumentServiceLayer,
} from "../services/document/service";

export const processDocument = action({
  args: v.object({
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
  }),
  returns: v.string(),
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      yield* Effect.log("Processing document with mode: " + args.mode);
      const documentService = yield* DocumentService;
      const updatedContent = yield* documentService.transformContent(
        args.content,
        args.mode,
      );
      return updatedContent;
    }).pipe(Effect.provide(DocumentServiceLayer), Effect.runPromise),
});
