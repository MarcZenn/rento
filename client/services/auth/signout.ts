import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { router } from 'expo-router';

export const signOut = async () => {
  await amplifySignOut();
  router.push('/');
};
