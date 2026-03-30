import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    content: v.string(),
    version: v.number(),
    userId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
