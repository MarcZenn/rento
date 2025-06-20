import { query, internalMutation } from '@/convex/_generated/server';
import { v } from 'convex/values';

export const getCurrentUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
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
    return userId;
  },
});
