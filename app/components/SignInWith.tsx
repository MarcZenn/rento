/**
 * Social Sign-In Component (AWS Cognito)
 *
 * TODO: Configure AWS Cognito User Pool for social sign-in:
 * 1. In AWS Cognito Console, configure identity providers (Google, Line)
 * 2. Set up OAuth redirect URIs in Cognito settings
 * 3. Add social provider credentials (Client ID, Client Secret)
 * 4. Configure Amplify with social provider settings
 * 5. Implement signInWithRedirect from aws-amplify/auth
 *
 * For now, social sign-in buttons are disabled until Cognito is configured.
 */

import React, { useCallback, useEffect, PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import * as WebBrowser from 'expo-web-browser';

import { CustomButton } from './custom/buttons/CustomButton';

type GoogleSSOStrategy = `oauth_google`;
type LineSSOStrategy = `oauth_line`;
type Props = {
  strategy: GoogleSSOStrategy | LineSSOStrategy;
};

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export const SignInWith = ({ children, strategy }: PropsWithChildren<Props>) => {
  useWarmUpBrowser();

  const onPress = useCallback(async () => {
    // TODO: Implement AWS Cognito social sign-in
    // This requires configuring OAuth providers in Cognito User Pool
    // See: https://docs.amplify.aws/react-native/build-a-backend/auth/add-social-provider/

    const providerName = strategy === 'oauth_google' ? 'Google' : 'Line';

    // Alert.alert(
    //   'Social Sign-In Not Configured',
    //   `${providerName} sign-in requires AWS Cognito OAuth configuration. Please use email sign-in for now.`,
    //   [{ text: 'OK' }]
    // );

    console.log(`Social sign-in with ${providerName} not yet configured in AWS Cognito`);
  }, [strategy]);

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
