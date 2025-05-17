import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import { CustomInput } from '@/src/components/inputs/CustomInput';
import { CustomButton } from '@/src/components/buttons/CustomButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password should be at least 8 characters long'),
});

type SignInFields = z.infer<typeof signInSchema>;

export const SignIn = () => {
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
        />
        <CustomInput
          placeholder="password"
          name="password"
          control={control}
          secureTextEntry
          autoCapitalize="none"
        />
        <CustomButton onPress={handleSubmit(onSignIn)} style={styles.signInButton}>
          <Text style={[styles.signInButtonText]}>Sign In</Text>
        </CustomButton>
      </View>
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
  form: {
    gap: 5,
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
  signInButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
  signInButton: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
}));
