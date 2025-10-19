import { useCallback, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import * as Sentry from '@sentry/react-native';

export const useCheckAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useCallback(async () => {
    try {
      const { userId } = await getCurrentUser();
      if (userId) {
        setIsSignedIn(true);
      }
    } catch (error) {
      // User not authenticated
      Sentry.captureException(error);
    } finally {
      // Set loading to false when done, regardless of success or error
      setIsLoading(false);
    }
  }, []);

  return { isSignedIn, isLoading };
};
