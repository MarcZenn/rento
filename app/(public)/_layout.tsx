import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const PublicLayout = () => {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';
  const inProtectedGroup = segments[0] === '(protected)';

  useEffect(() => {
    if ((isSignedIn && inAuthGroup) || isSignedIn) {
      router.replace('/feed');
    } else if (!isSignedIn && inProtectedGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isSignedIn]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PublicLayout;
