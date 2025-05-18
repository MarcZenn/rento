import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Link } from 'expo-router';
import { HeroLogo } from '@/src/components/HeroLogo';
import { CustomInput } from '@/src/components/inputs/CustomInput';
import { CustomButton } from '@/src/components/buttons/CustomButton';

const signInSchema = z.object({
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password should be at least 8 characters long'),
});

type SignInFields = z.infer<typeof signInSchema>;

const SignIn = () => {
  // handles form validation w/ zod schema
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const onSignIn = (data: SignInFields) => {
    console.log(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <HeroLogo />

      <Text style={[styles.title]}>Sign in</Text>

      <View style={[styles.form]}>
        <CustomInput
          placeholder="email"
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
          placeholder="password"
          name="password"
          control={control}
          secureTextEntry
          autoCapitalize="none"
          style={[styles.input]}
        />
        <CustomButton onPress={handleSubmit(onSignIn)} style={[styles.signInButton]}>
          <Text style={[styles.signInButtonText]}>Sign In</Text>
        </CustomButton>

        <Link href={'/sign_up'} style={[styles.signUpLink]}>
          Don't have an account? Sign up.
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
