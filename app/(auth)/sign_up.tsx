import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { HeroLogo } from '@/src/components/HeroLogo';
import { CustomInput } from '@/src/components/inputs/CustomInput';
import { CustomButton } from '@/src/components/buttons/CustomButton';

type SignUpFields = z.infer<typeof signUpSchema>;

const signUpSchema = z.object({
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password should be at least 8 characters long'),
});

const SignUp = () => {
  // handles form validation w/ zod schema
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(signUpSchema),
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
      <HeroLogo />

      <Text style={[styles.title]}>Create an account</Text>

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
        <CustomButton onPress={handleSubmit(onSignUp)} style={styles.signUpButton}>
          <Text style={[styles.signUpButtonText]}>Sign In</Text>
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
