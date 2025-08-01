import { query, internalMutation } from '@/convex/_generated/server';
import { v } from 'convex/values';
import { mutation, internalAction } from './_generated/server';
import { internal } from './_generated/api';

export const createUserProfile = internalMutation({
  args: {
    user_id: v.id('users'),
    phone_number: v.optional(v.string()),
    first_name: v.optional(v.string()),
    surname: v.optional(v.string()),
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
    about: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profileId = await ctx.db.insert('profiles', {
      ...args,
    });

    // create profile translations
    await ctx.scheduler.runAfter(0, internal.translations.createProfileTranslationsAction, {
      profileId: profileId,
      aboutText: args.about,
    });

    return profileId;
  },
});

export const createUserProfileAction = internalAction({
  args: { user_id: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.profiles.createUserProfile, { user_id: args.user_id });
  },
});

export const getUserProfile = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .filter(q => q.eq(q.field('user_id'), args.userId))
      .unique();
  },
});

export const updateUserProfile = mutation({
  args: {},
  handler: async (ctx, args) => {},
});
