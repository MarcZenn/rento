import { Stack } from 'expo-router';

export default function AuthLayout() {
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
