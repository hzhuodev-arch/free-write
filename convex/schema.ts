import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
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
  }).index("by_userId", ["userId"]),

  streamingJobs: defineTable({
    streamId: v.string(),
    documentId: v.id("documents"),
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
    additionalPrompt: v.optional(v.string()),
  }).index("by_streamId", ["streamId"]),
});
