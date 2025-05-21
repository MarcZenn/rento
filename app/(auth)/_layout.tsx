import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={'/(protected)/home'} />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign_in" options={{ headerShown: false, title: 'Sign in' }} />
      <Stack.Screen name="sign_up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
