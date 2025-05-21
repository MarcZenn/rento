import { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/src/hooks/useFonts';
import '@/src/i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// TODO:: Test device default language selelction - change simulator langauge to JP and see if app is in JP when initially opened

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
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </View>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
