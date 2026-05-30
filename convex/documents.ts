import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DocumentService } from "./documents/service";
import { runBackendEffect } from "./runtime/layers";

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
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) => _.listByUserId(args.userId)),
    ),
});

// ---------- Mutations ----------

export const create = mutation({
  args: { userId: v.string() },
  returns: v.id("documents"),
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) => _.create(args.userId)),
    ),
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) => _.remove(args.id)),
    ),
});

export const updateTitle = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) => _.updateTitle(args.id, args.title)),
    ),
});

export const updateContent = mutation({
  args: {
    docId: v.id("documents"),
    content: v.string(),
    sessionId: v.string(),
  },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) =>
        _.updateContent({
          docId: args.docId,
          content: args.content,
          sessionId: args.sessionId,
        }),
      ),
    ),
});

export const claimSession = mutation({
  args: { documentId: v.id("documents"), sessionId: v.string() },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) =>
        _.claimSession({
          docId: args.documentId,
          sessionId: args.sessionId,
        }),
      ),
    ),
});

export const releaseSession = mutation({
  args: { documentId: v.id("documents"), sessionId: v.string() },
  handler: (ctx, args) =>
    runBackendEffect(
      ctx.db,
      DocumentService.use((_) =>
        _.releaseSession({
          docId: args.documentId,
          sessionId: args.sessionId,
        }),
      ),
    ),
});
