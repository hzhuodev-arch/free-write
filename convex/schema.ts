import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    content: v.string(),
    version: v.number(),
    userId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  streamingJobs: defineTable({
    streamId: v.string(),
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
  }).index("by_streamId", ["streamId"]),
});
