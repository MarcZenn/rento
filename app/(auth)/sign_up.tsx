import { Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { CustomInput } from '@/src/components/inputs/CustomInput';
import { CustomButton } from '@/src/components/buttons/CustomButton';

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

      <CustomInput placeholder="password" secureTextEntry autoCapitalize="none" />

      <CustomButton onPress={() => {}} text="Sign In" />
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
}));
