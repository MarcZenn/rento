import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'expo-router';

import { CustomInput } from '@/src/components/custom/inputs/CustomInput';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { useSignInSchema } from '@/src/utils/validation/schemas';
import { HeroLogo } from '@/src/components/HeroLogo';
import { Header } from '@/src/components/Header';
import { useAuthActions } from '@/src/services/auth/useAuthActions';

const SignIn = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(useSignInSchema()),
  });
  const { logIn } = useAuthActions(setError);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Header />

      <HeroLogo />

      <View style={[styles.form]}>
        <Text style={[styles.title]}>{t('auth.sign_in')}</Text>

        <CustomInput
          placeholder={t('forms.email.placeholder')}
          name="email"
          control={control}
          isSecureEntry={false}
          autoFocus
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          style={[styles.input]}
        />
        <CustomInput
          placeholder={t(t('forms.password.placeholder'))}
          name="password"
          control={control}
          isSecureEntry
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input]}
        />

        <Text style={[styles.errorText]}>{errors.root && errors.root.message}</Text>

        <CustomButton onPress={handleSubmit(logIn)} style={[styles.signInButton]}>
          <Text style={[styles.signInButtonText]}>{t('auth.sign_in')}</Text>
        </CustomButton>

        <Link href={'/sign_up'} push style={[styles.signUpLink]}>
          {t('auth.no_account')}
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    display: 'flex',
    flex: 1,
    backgroundColor: theme.colors.appBackground,
    gap: 10,
  },
  form: {
    gap: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.notoJpBold,
    color: theme.colors.bodyText,
    textAlign: 'left',
  },
  input: {
    marginVertical: 15,
    color: theme.colors.bodyText,
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 40,
    borderColor: theme.colors.accentMatcha,
  },
  signInButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
  signInButton: {
    marginTop: 5,
    padding: 15,
    borderWidth: 0.5,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
  },
  signUpLink: {
    color: theme.colors.accentSky,
    fontFamily: theme.fonts.interLight,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.interThin,
    color: theme.colors.error,
    paddingBottom: 5,
  },
}));

export default SignIn;
