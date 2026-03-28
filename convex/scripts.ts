// convex/scripts.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listScripts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("scripts")
      .withIndex("by_user_and_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getScript = query({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const script = await ctx.db.get(args.id);
    if (!script || script.userId !== userId) return null;

    return script;
  },
});

export const createScript = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("scripts", {
      userId,
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const updateScriptTitle = mutation({
  args: { id: v.id("scripts"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const script = await ctx.db.get(args.id);
    if (!script || script.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const deleteScript = mutation({
  args: { id: v.id("scripts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const script = await ctx.db.get(args.id);
    if (!script || script.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});
