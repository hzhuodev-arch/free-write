import { Clock, Effect, Schema } from "effect";
import type { Doc, Id } from "../_generated/dataModel";
import { MutationDb, QueryDb } from "../service/db";
import { SESSION_STALE_TIME_MS } from "../shared/const";
import type { Document } from "../shared/document";

// ---------- Errors ----------

export class DocumentNotFoundError extends Schema.TaggedErrorClass<DocumentNotFoundError>()(
  "DocumentNotFoundError",
  {},
) {}

export class DocumentDbError extends Schema.TaggedErrorClass<DocumentDbError>()(
  "DocumentDbError",
  {
    operation: Schema.Union([
      Schema.Literal("get"),
      Schema.Literal("list"),
      Schema.Literal("insert"),
      Schema.Literal("patch"),
      Schema.Literal("delete"),
    ]),
    error: Schema.Unknown.pipe(Schema.optional),
  },
) {}

export class InvalidSessionError extends Schema.TaggedErrorClass<InvalidSessionError>()(
  "InvalidSessionError",
  {},
) {}

// ---------- Entity mapping ----------

const toEntity = ({
  _id,
  _creationTime,
  ...rest
}: Doc<"documents">): Document => ({
  id: _id,
  creationTime: _creationTime,
  ...rest,
});

// ---------- Reads ----------

export const get = (id: string) =>
  Effect.gen(function* () {
    const db = yield* QueryDb;
    const raw = yield* Effect.tryPromise({
      try: () => db.get(id as Id<"documents">),
      catch: (error) => new DocumentDbError({ operation: "get", error }),
    });
    if (!raw) return yield* new DocumentNotFoundError();
    return toEntity(raw);
  });

export const listForUser = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* QueryDb;
    const raws = yield* Effect.tryPromise({
      try: () =>
        db
          .query("documents")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .order("desc")
          .collect(),
      catch: (error) => new DocumentDbError({ operation: "list", error }),
    });
    return raws.map(toEntity);
  });

// ---------- Writes ----------

type PatchFields = Partial<Omit<Document, "id" | "creationTime" | "userId">>;

export const patch = (id: string, fields: PatchFields) =>
  Effect.gen(function* () {
    if (Object.keys(fields).length === 0) return;
    const db = yield* MutationDb;
    yield* Effect.tryPromise({
      try: () => db.patch(id as Id<"documents">, fields),
      catch: (error) => new DocumentDbError({ operation: "patch", error }),
    });
  });

export const create = (args: { userId: string; title?: string }) =>
  Effect.gen(function* () {
    const db = yield* MutationDb;
    return yield* Effect.tryPromise({
      try: () =>
        db.insert("documents", {
          userId: args.userId,
          title: args.title ?? "",
          content: "",
        }),
      catch: (error) => new DocumentDbError({ operation: "insert", error }),
    });
  });

export const remove = (id: string) =>
  Effect.gen(function* () {
    const db = yield* MutationDb;
    yield* Effect.tryPromise({
      try: () => db.delete(id as Id<"documents">),
      catch: (error) => new DocumentDbError({ operation: "delete", error }),
    });
  });

export const updateTitle = (id: string, title: string) => patch(id, { title });

// ---------- Sessions ----------

export const validateSession = (args: { docId: string; sessionId: string }) =>
  Effect.gen(function* () {
    const doc = yield* get(args.docId);
    const now = yield* Clock.currentTimeMillis;
    const valid =
      doc.activeSession === undefined ||
      doc.activeSession.sessionId === args.sessionId ||
      now - doc.activeSession.lastUpdatedAt > SESSION_STALE_TIME_MS;
    if (!valid) return yield* new InvalidSessionError();
  });

export const claimSession = (args: { docId: string; sessionId: string }) =>
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    yield* patch(args.docId, {
      activeSession: { sessionId: args.sessionId, lastUpdatedAt: now },
    });
  });

export const releaseSession = (args: { docId: string; sessionId: string }) =>
  Effect.gen(function* () {
    const doc = yield* get(args.docId);
    if (doc.activeSession?.sessionId !== args.sessionId) return;
    yield* patch(args.docId, { activeSession: undefined });
  });

export const updateContent = (args: {
  docId: string;
  sessionId: string;
  content: string;
}) =>
  Effect.gen(function* () {
    yield* validateSession({ docId: args.docId, sessionId: args.sessionId });
    const now = yield* Clock.currentTimeMillis;
    yield* patch(args.docId, {
      content: args.content,
      activeSession: { sessionId: args.sessionId, lastUpdatedAt: now },
    });
  });

