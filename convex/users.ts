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
  handler: async (ctx, args) => {
    return await ctx.db.query('users').collect();
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    phone_number: v.optional(v.string()),
    first_name: v.string(),
    surname: v.string(),
    employment_status: v.optional(v.id('employment_statuses')),
    user_type: v.optional(v.id('user_types')),
    is_foreign_resident: v.optional(v.boolean()),
    nationality: v.optional(v.id('countries')),
    has_guarantor: v.optional(v.boolean()),
    consecutive_years_employed: v.optional(v.int64()),
    rental_readiness_score: v.optional(v.int64()),
    saved_properties: v.optional(v.id('properties')),
    onboarding_completed: v.optional(v.boolean()),
    last_active: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert('users', {
      ...args,
    });
    return userId;
  },
});
