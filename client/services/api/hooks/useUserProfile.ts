/**
 * User Profile Hook
 * Fetches user profile from GraphQL API
 */

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import type { GQL_Profile, GQL_QueryGetUserProfileArgs } from '@/shared/types/graphql';

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    getUserProfile(userId: $userId) {
      id
      userId
      phoneNumber
      firstName
      surname
      employmentStatus {
        id
        name
      }
      userType {
        id
        name
      }
      isForeignResident
      nationality {
        id
        name
        code
      }
      hasGuarantor
      consecutiveYearsEmployed
      rentalReadinessScore
      savedProperties
      onboardingCompleted
      lastActive
      about
      createdAt
      updatedAt
    }
  }
`;

interface GetUserProfileData {
  getUserProfile: GQL_Profile | null;
}

// ============================================================================
// HOOK
// ============================================================================

export const useUserProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user from Amplify
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await getCurrentUser();
      setUserId(currentUser?.userId || null);
    };

    fetchCurrentUser();
  }, []);

  // Fetch user profile from GraphQL
  const { data, loading, error } = useQuery<GetUserProfileData, GQL_QueryGetUserProfileArgs>(
    GET_USER_PROFILE,
    {
      variables: { userId: userId! },
      skip: !userId, // Skip query if no userId
    }
  );

  return {
    userProfile: data?.getUserProfile || null,
    loading,
    error,
  };
};
