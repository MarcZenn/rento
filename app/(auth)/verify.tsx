import { Text, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useVerifyEmailSchema } from '@/src/utils/validation/schemas';
import { CustomInput } from '@/src/components/custom/inputs/CustomInput';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { Header } from '@/src/components/Header';
import { useAuthActions } from '@/src/hooks/useAuthActions';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(useVerifyEmailSchema()),
  });
  const { verifyEmail } = useAuthActions(setError);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={[styles.page]}
    >
      <Header />

      <View style={[styles.form]}>
        <Text style={[styles.title]}>{t('forms.email.verify')}</Text>
        <CustomInput
          name="code"
          control={control}
          isSecureEntry={false}
          autoFocus
          keyboardType="number-pad"
          autoComplete="one-time-code"
          style={[styles.input]}
        />
        <Text style={[styles.errorText]}>{errors.root && errors.root.message}</Text>
        <CustomButton onPress={handleSubmit(verifyEmail)} style={styles.signUpButton}>
          <Text style={[styles.signUpButtonText]}>{t('forms.submit')}</Text>
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
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.notoJpBold,
    color: theme.colors.bodyText,
    textAlign: 'left',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 5,
    minHeight: 40,
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
  errorText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.interThin,
    color: theme.colors.error,
    paddingBottom: 5,
  },
}));

export default VerifyEmail;
