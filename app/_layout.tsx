import { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { ApolloProvider } from '@/client/apollo';
import { configureAmplify } from '@/client/apollo/config';
import * as Sentry from '@sentry/react-native';
import { useGetCurrentUser } from '@/client/services/auth/hooks/useGetCurrentUser';

import { ThemeProvider } from '@/client/theme/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@/client/theme/useFonts';
import '@/client/i18n';

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
  const { userId } = useGetCurrentUser();

  // Set Sentry user if authenticated
  useEffect(() => {
    const setSentryUser = async () => {
      if (userId) {
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }
    };

    setSentryUser();
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize AWS Amplify on app start
        await configureAmplify();
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
      <ThemeProvider>
        <InitialLayout />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default Sentry.wrap(RootLayout);
