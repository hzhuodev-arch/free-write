import {
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";
import { Clock, Effect } from "effect";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { streaming } from "./components";
import {
  collectDocumentsByUserId,
  createDocument,
  deleteDocument,
  getDocument,
  updateDocument,
} from "./model/document/crud";
import { DocumentDbError, StreamError } from "./model/document/errors";
import { updateDocumentSession, validateSession } from "./model/document/session";
import { createDocumentProcessingStream } from "./model/document/stream";

// ── Queries ───────────────────────────────────────────────────────────────

export const collectByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
      userId: v.string(),
      content: v.string(),
      title: v.string(),
      activeStreamId: v.optional(v.string()),
      activeSession: v.optional(
        v.object({
          sessionId: v.string(),
          lastUpdatedAt: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) =>
    Effect.runPromise(collectDocumentsByUserId(ctx, args.userId)),
});

export const streamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) =>
    Effect.runPromise(
      Effect.tryPromise({
        try: () => streaming.getStreamBody(ctx, args.streamId as StreamId),
        catch: (error) =>
          new StreamError({ operation: "getStreamBody", error }),
      }),
    ),
});

export const getJob = internalQuery({
  args: { streamId: v.string() },
  handler: async (ctx, args) =>
    Effect.runPromise(
      Effect.tryPromise({
        try: () =>
          ctx.db
            .query("streamingJobs")
            .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
            .first(),
        catch: (error) =>
          new DocumentDbError({ operation: "getJob", error }),
      }),
    ),
});

// ── Mutations ─────────────────────────────────────────────────────────────

export const claimSession = mutation({
  args: {
    documentId: v.id("documents"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      return yield* updateDocumentSession(ctx, {
        docId: args.documentId,
        session: {
          sessionId: args.sessionId,
          lastUpdatedAt: now,
        },
      });
    }).pipe(Effect.runPromise),
});

export const releaseSession = mutation({
  args: {
    documentId: v.id("documents"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      const doc = yield* getDocument(ctx, args.documentId);
      if (doc.activeSession?.sessionId !== args.sessionId) return;
      return yield* updateDocumentSession(ctx, {
        docId: args.documentId,
        session: undefined,
      });
    }).pipe(Effect.runPromise),
});

export const create = mutation({
  args: { userId: v.string() },
  returns: v.id("documents"),
  handler: async (ctx, args) =>
    Effect.runPromise(createDocument(ctx, { userId: args.userId })),
});

export const updateContent = mutation({
  args: {
    docId: v.id("documents"),
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      yield* validateSession(ctx, {
        docId: args.docId,
        sessionId: args.sessionId,
      });
      const now = yield* Clock.currentTimeMillis;
      yield* updateDocument(ctx, {
        documentId: args.docId,
        fields: {
          content: args.content,
          activeSession: {
            sessionId: args.sessionId,
            lastUpdatedAt: now,
          },
        },
      });
    }).pipe(Effect.runPromise),
});

export const updateTitle = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) =>
    Effect.runPromise(
      updateDocument(ctx, {
        documentId: args.id,
        fields: { title: args.title },
      }),
    ),
});

export const setActiveStreamId = mutation({
  args: {
    id: v.id("documents"),
    activeStreamId: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    Effect.runPromise(
      updateDocument(ctx, {
        documentId: args.id,
        fields: { activeStreamId: args.activeStreamId },
      }),
    ),
});

export const createStream = mutation({
  args: v.object({
    documentId: v.id("documents"),
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
    additionalPrompt: v.optional(v.string()),
    sessionId: v.string(),
  }),
  returns: StreamIdValidator,
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      yield* validateSession(ctx, {
        docId: args.documentId,
        sessionId: args.sessionId,
      });
      return yield* createDocumentProcessingStream(ctx, args);
    }).pipe(Effect.runPromise),
});

export const finishStream = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    streamId: v.string(),
  },
  handler: async (ctx, args) =>
    Effect.gen(function* () {
      const doc = yield* getDocument(ctx, args.documentId);
      if (doc.activeStreamId !== args.streamId) return;
      yield* updateDocument(ctx, {
        documentId: args.documentId,
        fields: { content: args.content, activeStreamId: undefined },
      });
    }).pipe(Effect.runPromise),
});

export const clearActiveStream = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) =>
    Effect.runPromise(
      updateDocument(ctx, {
        documentId: args.documentId,
        fields: { activeStreamId: undefined },
      }),
    ),
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => Effect.runPromise(deleteDocument(ctx, args.id)),
});
