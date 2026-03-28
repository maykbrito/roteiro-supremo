import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scripts: defineTable({
    title: v.string(),
    thumbIdea: v.string(),
    objective: v.string(),
    difficulties: v.string(),
    discovery: v.string(),
    objections: v.string(),
    name: v.string(),
    whoYouAre: v.string(),
    whatYouDo: v.string(),
    connectionStrategy: v.string(),
    parts: v.array(v.string()),
    transition: v.string(),
    cta: v.array(v.string()),
    recommendedVideo: v.string(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),
});
