import { useEffect } from 'react';
import { Redirect, Stack, router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function ProtectedLayout() {
  // const { isSignedIn } = useAuth();

  // useEffect(() => {
  //   if (!isSignedIn) {
  //     router.replace('/(auth)/sign_in');
  //   }
  // }, [isSignedIn]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
