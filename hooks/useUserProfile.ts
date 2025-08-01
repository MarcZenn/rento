import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/clerk-expo';

export const useUserProfile = () => {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;

  const user = useQuery(api.users.getUserByClerkId, { clerkId });

  const userId = user?._id;
  // "skip" ensures this only runs when userId is available
  const userProfile = useQuery(api.profiles.getUserProfile, userId ? { userId } : 'skip');

  // TODO:: Need to fetch the translations file based on users preference.

  return { userProfile };
};
