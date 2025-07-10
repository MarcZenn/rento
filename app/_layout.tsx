import { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { Slot } from 'expo-router';
import { View } from 'react-native';

import { ThemeProvider } from '@/src/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/src/theme/useFonts';
import '@/src/services/i18n';

// TODO:: Test device default language selection - change simulator langauge to JP and see if app is in JP when initially opened
// TODO:: Add logout functionality
// TODO:: Add biometric auth

// TODO:: test email loginp
// - check clerk errors
// -- check wrong password errors
// - check wrong email clerk errors

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your env.'
  );
}

// Keep the splash screen visible w/ animation while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

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
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider>
            <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
              <Slot screenOptions={{ headerShown: false }} />
            </View>
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
