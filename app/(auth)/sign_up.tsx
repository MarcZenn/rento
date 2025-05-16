import { Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { CustomInput } from '@/src/components/inputs/CustomInput';

export const EmailLogin = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Text style={[styles.title]}>Sign in</Text>

      <CustomInput
        placeholder="email"
        autoFocus
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        autoCorrect={false}
      />

      <CustomInput
        style={[styles.input]}
        placeholder="password"
        secureTextEntry
        autoCapitalize="none"
      />

      <Pressable style={[styles.signInButton]} onPress={() => {}}>
        <Text style={[styles.signInButtonText]}>Sign In</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    display: 'flex',
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.appBackground,
    gap: 20,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.notoJpBold,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: theme.colors.elevatedSurface,
  },
  signInButton: {
    backgroundColor: theme.colors.elevatedSurface,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  signInButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
}));
