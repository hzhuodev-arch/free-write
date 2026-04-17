import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import { ConvexMutationDb, ConvexQueryDb } from "../../service/db";
import { DocumentDbError, DocumentNotFoundError } from "./errors";

// ── Read ─────────────────────────────────────────────────────────────────

export const getDocument = (id: Id<"documents">) =>
  Effect.gen(function* () {
    const db = yield* ConvexQueryDb;
    const doc = yield* Effect.tryPromise({
      try: () => db.get(id),
      catch: (error) => new DocumentDbError({ operation: "get", error }),
    });
    if (!doc) return yield* new DocumentNotFoundError();
    return doc;
  });

export const collectDocumentsByUserId = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* ConvexQueryDb;
    return yield* Effect.tryPromise({
      try: () =>
        db
          .query("documents")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .order("desc")
          .collect(),
      catch: (error) => new DocumentDbError({ operation: "collect", error }),
    });
  });

// ── Write ────────────────────────────────────────────────────────────────

export const createDocument = (args: { userId: string; title?: string }) =>
  Effect.gen(function* () {
    const db = yield* ConvexMutationDb;
    return yield* Effect.tryPromise({
      try: () =>
        db.insert("documents", {
          userId: args.userId,
          title: args.title ?? "Untitled",
          content: "",
        }),
      catch: (error) => new DocumentDbError({ operation: "create", error }),
    });
  });

export const updateDocument = (args: {
  documentId: Id<"documents">;
  fields: {
    content?: string;
    title?: string;
    activeStreamId?: string | undefined;
    activeSession?:
      | { sessionId: string; lastUpdatedAt: number }
      | undefined;
  };
}) =>
  Effect.gen(function* () {
    if (Object.keys(args.fields).length === 0) return yield* Effect.void;
    yield* getDocument(args.documentId).pipe(
      Effect.catchTag("DocumentDbError", () =>
        Effect.succeed("Query error, continue execution"),
      ),
    );
    const db = yield* ConvexMutationDb;
    return yield* Effect.tryPromise({
      try: () => db.patch(args.documentId, args.fields),
      catch: (error) => new DocumentDbError({ operation: "update", error }),
    });
  });

export const deleteDocument = (documentId: Id<"documents">) =>
  Effect.gen(function* () {
    const db = yield* ConvexMutationDb;
    return yield* Effect.tryPromise({
      try: () => db.delete(documentId),
      catch: (error) => new DocumentDbError({ operation: "delete", error }),
    });
  });
