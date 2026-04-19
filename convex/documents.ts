import { v } from "convex/values";
import { Effect } from "effect";
import { mutation, query } from "./_generated/server";
import * as doc from "./model/document";
import { provideMutationDb, provideQueryDb } from "./service/db";

// ---------- Queries ----------

export const listByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      creationTime: v.number(),
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
  handler: (ctx, args) =>
    Effect.runPromise(doc.listForUser(args.userId).pipe(provideQueryDb(ctx))),
});

// ---------- Mutations ----------

export const create = mutation({
  args: { userId: v.string() },
  returns: v.id("documents"),
  handler: (ctx, args) =>
    Effect.runPromise(
      doc.create({ userId: args.userId }).pipe(provideMutationDb(ctx)),
    ),
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: (ctx, args) =>
    Effect.runPromise(doc.remove(args.id).pipe(provideMutationDb(ctx))),
});

export const updateTitle = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: (ctx, args) =>
    Effect.runPromise(
      doc.updateTitle(args.id, args.title).pipe(provideMutationDb(ctx)),
    ),
});

export const updateContent = mutation({
  args: {
    docId: v.id("documents"),
    content: v.string(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    Effect.runPromise(doc.updateContent(args).pipe(provideMutationDb(ctx))),
});

export const claimSession = mutation({
  args: { documentId: v.id("documents"), sessionId: v.string() },
  handler: (ctx, args) =>
    Effect.runPromise(
      doc
        .claimSession({ docId: args.documentId, sessionId: args.sessionId })
        .pipe(provideMutationDb(ctx)),
    ),
});

export const releaseSession = mutation({
  args: { documentId: v.id("documents"), sessionId: v.string() },
  handler: (ctx, args) =>
    Effect.runPromise(
      doc
        .releaseSession({ docId: args.documentId, sessionId: args.sessionId })
        .pipe(provideMutationDb(ctx)),
    ),
});
