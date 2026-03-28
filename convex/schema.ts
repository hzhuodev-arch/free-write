import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    content: v.string(),
    mode: v.union(v.literal("format"), v.literal("restructure")),
    userId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
