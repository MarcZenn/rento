import { useEffect } from 'react';
import { Stack, Redirect, router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(protected)/(tabs)/feed');
    }
  }, [isSignedIn]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: true }} />
      <Stack.Screen name="sign_in" options={{ headerShown: false, gestureEnabled: true }} />
      <Stack.Screen
        name="sign_up"
        options={{ headerShown: false, gestureEnabled: true, gestureDirection: 'horizontal' }}
      />
      <Stack.Screen
        name="verify"
        options={{ headerShown: false, gestureEnabled: true, gestureDirection: 'horizontal' }}
      />
    </Stack>
  );
}
