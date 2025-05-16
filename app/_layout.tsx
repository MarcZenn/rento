import { useState, useEffect } from 'react';
import { Slot } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useFonts } from '@/src/hooks/useFonts';
import '@/src/i18n';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in you env.'
  );
}

const InitialLayout = () => {
  return <Slot />;
};

// Top level navigator - includes initialization code, loading fonts etc
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

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
      <ClerkLoaded>
        <ThemeProvider>{appIsReady && <InitialLayout />}</ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
