import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useSignUpSchema } from '@/src/utils/validation/schemas';
import { CustomInput } from '@/src/components/custom/inputs/CustomInput';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { HeroLogo } from '@/src/components/HeroLogo';
import { Header } from '@/src/components/Header';

type SignUpFields = z.infer<ReturnType<typeof useSignUpSchema>>;

const SignUp = () => {
  const { t } = useTranslation();

  // handles form validation w/ zod schema
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(useSignUpSchema()),
  });

  const onSignUp = (data: SignUpFields) => {
    // console.log(data);
    // first name
    // last name
    // email
    // username
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Header />

      <HeroLogo />

      <Text style={[styles.title]}>{t('auth.create_account')}</Text>

      <View style={[styles.form]}>
        <CustomInput
          placeholder={t('forms.name.placeholder')}
          name="firstName"
          control={control}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input]}
        />
        <CustomInput
          placeholder={t('forms.surname.placeholder')}
          name="surname"
          control={control}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input]}
        />
        <CustomInput
          placeholder={t('forms.email.placeholder')}
          name="email"
          control={control}
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
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input]}
        />
        <CustomButton onPress={handleSubmit(onSignUp)} style={styles.signUpButton}>
          <Text style={[styles.signUpButtonText]}>{t('auth.sign_up')}</Text>
        </CustomButton>
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
  signUpButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
  signUpButton: {
    marginTop: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
  },
}));

export default SignUp;
