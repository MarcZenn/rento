import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href={'/(protected)/'} />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign_in" options={{ headerShown: false, title: 'Sign in' }} />
      <Stack.Screen name="sign_up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
