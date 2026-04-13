import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { DocumentDbError, DocumentNotFoundError } from "./errors";

// ── Read ─────────────────────────────────────────────────────────────────

export const getDocument = (ctx: QueryCtx, id: Id<"documents">) =>
  Effect.gen(function* () {
    const doc = yield* Effect.tryPromise({
      try: () => ctx.db.get(id),
      catch: (error) => new DocumentDbError({ operation: "get", error }),
    });
    if (!doc) return yield* new DocumentNotFoundError();
    return doc;
  });

export const collectDocumentsByUserId = (ctx: QueryCtx, userId: string) =>
  Effect.tryPromise({
    try: () =>
      ctx.db
        .query("documents")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .collect(),
    catch: (error) => new DocumentDbError({ operation: "collect", error }),
  });

// ── Write ────────────────────────────────────────────────────────────────

export const createDocument = (
  ctx: MutationCtx,
  args: { userId: string; title?: string },
) =>
  Effect.tryPromise({
    try: () =>
      ctx.db.insert("documents", {
        userId: args.userId,
        title: args.title ?? "Untitled",
        content: "",
      }),
    catch: (error) => new DocumentDbError({ operation: "create", error }),
  });

export const updateDocument = (
  ctx: MutationCtx,
  args: {
    documentId: Id<"documents">;
    fields: {
      content?: string;
      title?: string;
      activeStreamId?: string | undefined;
      activeSession?:
        | { sessionId: string; lastUpdatedAt: number }
        | undefined;
    };
  },
) =>
  Effect.gen(function* () {
    if (Object.keys(args.fields).length === 0) return yield* Effect.void;
    yield* getDocument(ctx, args.documentId).pipe(
      Effect.catchTag("DocumentDbError", () =>
        Effect.succeed("Query error, continue execution"),
      ),
    );
    return yield* Effect.tryPromise({
      try: () => ctx.db.patch(args.documentId, args.fields),
      catch: (error) => new DocumentDbError({ operation: "update", error }),
    });
  });

export const deleteDocument = (
  ctx: MutationCtx,
  documentId: Id<"documents">,
) =>
  Effect.tryPromise({
    try: () => ctx.db.delete(documentId),
    catch: (error) => new DocumentDbError({ operation: "delete", error }),
  });
