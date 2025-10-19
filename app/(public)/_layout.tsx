import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useCheckAuth } from '@/client/services/auth/hooks/useCheckAuth';
import { LoadingSpinner } from '@/client/components/custom/loaders/Loading';

const PublicLayout = () => {
  const { isSignedIn, isLoading } = useCheckAuth();
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PublicLayout;
