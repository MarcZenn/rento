import { query, internalMutation } from '@/convex/_generated/server';
import { v } from 'convex/values';
import { internalAction } from './_generated/server';

export const createProfileTranslations = internalMutation({
  args: {
    profileId: v.id('profiles'),
    languageId: v.id('languages'),
    translatedAboutText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // inserts only
  },
});

export const createProfileTranslationsAction = internalAction({
  args: {
    profileId: v.id('profiles'),
    aboutText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO:: for each supported language
    // get language id from languages table
    // run the about arg through Deepl translation API for each language
    // call createProfileTranslations for each supported language passing translated text, profile id and language table id
  },
});
