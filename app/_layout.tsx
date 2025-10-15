import { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { ApolloProvider } from '@/client/apollo';
import { configureAmplify } from '@/client/apollo/config';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import * as Sentry from '@sentry/react-native';
import { ENV } from '@/client/config/env';

import { ThemeProvider } from '@/client/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/client/theme/useFonts';
import '@/client/i18n';

// TODO:: Add biometric auth (AWS Amplify)
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const { publishableKey } = ENV.clerk;
if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your env.'
  );
}

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const navigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust this value in production.
  // Learn more at - https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  attachScreenshot: true,
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production.
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
  enableNativeFramesTracking: true, // We are not using Expo Go.
});

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const InitialLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const user = useUser();

  useEffect(() => {
    const init = async () => {
      try {
        await configureAmplify(); // Initialize AWS Amplify on app start
        await useFonts();
      } catch (err) {
        console.warn(err);
      } finally {
        setAppIsReady(true);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (user && user.user) {
      Sentry.setUser({ email: user.user.emailAddresses[0].emailAddress, id: user.user.id });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

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
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
      <Slot screenOptions={{ headerShown: false }} />
    </View>
  );
};

const RootLayout = () => {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <ApolloProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ThemeProvider>
              <InitialLayout />
            </ThemeProvider>
          </ConvexProviderWithClerk>
        </ClerkLoaded>
      </ClerkProvider>
    </ApolloProvider>
  );
};

export default Sentry.wrap(RootLayout);
