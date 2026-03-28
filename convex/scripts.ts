import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listScripts = query({
  handler: async (ctx) => {
    return await ctx.db.query("scripts").withIndex("by_updatedAt").order("desc").collect();
  },
});

export const deleteScript = mutation({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getScript = query({
  args: { id: v.optional(v.id("scripts")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

export const upsertScript = mutation({
  args: {
    id: v.optional(v.id("scripts")),
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
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const now = Date.now();
    
    if (id) {
      await ctx.db.patch(id, { ...data, updatedAt: now });
      return id;
    } else {
      return await ctx.db.insert("scripts", { ...data, updatedAt: now });
    }
  },
});
