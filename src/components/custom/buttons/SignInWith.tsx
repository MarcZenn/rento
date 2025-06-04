import React, { useCallback, useEffect, PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/clerk-expo';

import { CustomButton } from './CustomButton';

type GoogleSSOStrategy = `oauth_google`;
type LineSSOStrategy = `oauth_line`;
type Props = {
  strategy: GoogleSSOStrategy | LineSSOStrategy;
};

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export const SignInWith = ({ children, strategy }: PropsWithChildren<Props>) => {
  useWarmUpBrowser();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: strategy,
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <CustomButton style={[styles.ssoButton]} onPress={onPress}>
      {children}
    </CustomButton>
  );
};

const styles = StyleSheet.create(theme => ({
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: theme.colors.brand,
    width: '85%',
  },
}));
