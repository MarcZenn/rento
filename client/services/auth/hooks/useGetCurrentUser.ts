import { useCallback, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import * as Sentry from '@sentry/react-native';

export const useGetCurrentUser = () => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState<string | undefined>();

  useCallback(async () => {
    try {
      const { userId, username, signInDetails } = await getCurrentUser();
      setUserId(userId);
      setUsername(username);
      setEmail(signInDetails?.loginId);
    } catch (error) {
      // User not found error
      Sentry.captureException(error);
    }
  }, []);

  return { userId, username, email };
};
