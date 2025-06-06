import { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { View } from 'react-native';

import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/src/hooks/useFonts';
import '@/src/i18n';

// TODO:: Test device default language selection - change simulator langauge to JP and see if app is in JP when initially opened
// TODO:: Add logout functionality
// TODO:: Add biometric auth

// TODO:: test email login
// - check form errors
// - check clerk errors
// -- check wrong password errors
// - check wrong email clerk errors
// - check redirect after sign in works
// - reload app make sure home page opens

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your env.'
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await useFonts();
      } catch (err) {
        console.warn(err);
      } finally {
        setAppIsReady(true);
      }
    };

    init();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // If we call this after `setAppIsReady`, then we may see a blank screen
      // while the app is loading its initial state and rendering its first
      // pixels. So instead, we hide the splash screen once we know the root
      // view has already performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
      <ClerkLoaded>
        <ThemeProvider>
          <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
            <Slot screenOptions={{ headerShown: false }} />
          </View>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
