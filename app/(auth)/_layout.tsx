import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={'/(protected)'} />;
  }

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
