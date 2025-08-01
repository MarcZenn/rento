import { query, internalMutation } from '@/convex/_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert('users', {
      ...args,
    });

    // create new user base profile
    await ctx.scheduler.runAfter(0, internal.profiles.createUserProfileAction, {
      user_id: userId,
    });

    return userId;
  },
});

export const getCurrentUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .unique();
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx, _) => {
    return await ctx.db.query('users').collect();
  },
});

export const getUserTypes = query({
  args: {},
  handler: async (ctx, _) => {
    return await ctx.db.query('user_types').collect();
  },
});
