import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import { CustomInput } from '@/src/components/inputs/CustomInput';
import { CustomButton } from '@/src/components/buttons/CustomButton';

export const EmailLogin = () => {
  const { control, handleSubmit } = useForm(); // handles form validation

  const onSignIn = (data: any) => {
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
        <CustomButton onPress={handleSubmit(onSignIn)} text="Sign In" />
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
}));
