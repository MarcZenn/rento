import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const PublicLayout = () => {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';
  const inProtectedGroup = segments[0] === '(protected)';

  console.log(segments, 'segments');

  useEffect(() => {
    if ((isSignedIn && inAuthGroup) || isSignedIn) {
      console.log('dick');
      router.replace('/feed');
    } else if (!isSignedIn && inProtectedGroup) {
      console.log('ass');
      router.replace('/(auth)/welcome');
    }
    // else if (isSignedIn) {
    //   console.log('tits');
    //   router.replace('/feed');
    // }
  }, [isSignedIn]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PublicLayout;
