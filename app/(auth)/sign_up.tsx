import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link } from 'expo-router';

import { useSignUpSchema } from '@/src/utils/validation/schemas';
import { CustomInput } from '@/src/components/custom/inputs/CustomInput';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { useAuthActions } from '@/src/hooks/useAuthActions';
import { HeroLogo } from '@/src/components/HeroLogo';
import { Header } from '@/src/components/Header';

const SignUp = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(useSignUpSchema()),
  });
  const { createAccount } = useAuthActions(setError);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Header />

      <HeroLogo />

      <View style={[styles.form]}>
        <Text style={[styles.title]}>{t('auth.create_account')}</Text>
        <CustomInput
          placeholder={t('forms.username.placeholder')}
          name="username"
          control={control}
          isSecureEntry={false}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input]}
        />
        <CustomInput
          placeholder={t('forms.email.placeholder')}
          name="email"
          control={control}
          isSecureEntry={false}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          style={[styles.input]}
        />
        <CustomInput
          placeholder={t('forms.password.placeholder')}
          name="password"
          control={control}
          isSecureEntry
          autoCapitalize="none"
          style={[styles.input]}
        />

        <Text style={[styles.errorText]}>{errors.root && errors.root.message}</Text>

        <CustomButton onPress={handleSubmit(createAccount)} style={styles.signUpButton}>
          <Text style={[styles.signUpButtonText]}>{t('auth.sign_up')}</Text>
        </CustomButton>

        <Link href={'/sign_in'} push style={[styles.signInLink]}>
          {t('auth.have_account')}
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
  signUpButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
  signUpButton: {
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
    height: 50,
    justifyContent: 'center',
  },
  signInLink: {
    color: theme.colors.accentSky,
    fontFamily: theme.fonts.interLight,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.interThin,
    color: theme.colors.error,
    marginTop: 5,
  },
}));

export default SignUp;
