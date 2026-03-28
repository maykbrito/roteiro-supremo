// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  scripts: defineTable({
    // v2 fields
    userId: v.optional(v.id("users")),
    title: v.string(),
    updatedAt: v.optional(v.number()),
    // v1 legacy fields (optional, for backwards compatibility with existing docs)
    connectionStrategy: v.optional(v.string()),
    cta: v.optional(v.array(v.string())),
    difficulties: v.optional(v.string()),
    discovery: v.optional(v.string()),
    name: v.optional(v.string()),
    objections: v.optional(v.string()),
    objective: v.optional(v.string()),
    parts: v.optional(v.array(v.string())),
    recommendedVideo: v.optional(v.string()),
    thumbIdea: v.optional(v.string()),
    transition: v.optional(v.string()),
    whatYouDo: v.optional(v.string()),
    whoYouAre: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_updated", ["userId", "updatedAt"]),
});
