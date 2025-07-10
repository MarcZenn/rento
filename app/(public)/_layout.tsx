import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const PublicLayout = () => {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(protected)/(tabs)/feed');
    }
  }, [isSignedIn]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PublicLayout;
