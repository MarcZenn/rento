import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'expo-router';
import { z } from 'zod';

import { CustomInput } from '@/src/components/custom/inputs/CustomInput';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { useSignInSchema } from '@/src/utils/validation/schemas';
import { HeroLogo } from '@/src/components/HeroLogo';
import { Header } from '@/src/components/Header';
import { useAuth } from '@/src/providers/AuthProvider';

type SignInFields = z.infer<ReturnType<typeof useSignInSchema>>;

const SignIn = () => {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  // handles form validation w/ zod schema
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(useSignInSchema()),
  });

  const onSignIn = (data: SignInFields) => {
    console.log(data);
    signIn();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Header />

      <HeroLogo />

      <Text style={[styles.title]}>{t('auth.sign_in')}</Text>

      <View style={[styles.form]}>
        <CustomInput
          placeholder={t('forms.email.placeholder')}
          name="email"
          control={control}
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
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input]}
        />
        <CustomButton onPress={handleSubmit(onSignIn)} style={[styles.signInButton]}>
          <Text style={[styles.signInButtonText]}>{t('auth.sign_in')}</Text>
        </CustomButton>

        <Link href={'/sign_up'} style={[styles.signUpLink]}>
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
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.appBackground,
    gap: 10,
  },
  form: {
    gap: 5,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.notoJpBold,
    color: theme.colors.bodyText,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: theme.colors.accentMatcha,
    color: theme.colors.bodyText,
  },
  signInButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
  signInButton: {
    marginTop: 15,
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
}));

export default SignIn;
