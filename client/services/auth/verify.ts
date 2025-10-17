import { confirmSignUp } from 'aws-amplify/auth';
import { UseFormSetError } from 'react-hook-form';
import { VerifyFields, mapAmplifyErrorToVerifyField } from './schemas';
import { router } from 'expo-router';

type SetFormError = UseFormSetError<{
  code: string;
}>;

export const verify = async (data: VerifyFields, setError: SetFormError, email: string) => {
  if (!email) {
    setError('root', {
      message: 'No pending email for verification. Please sign up first.',
    });
    return;
  }

  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: data.code,
    });

    if (isSignUpComplete) {
      router.push('/home');
    }
  } catch (err: any) {
    console.error('Verification error:', err);
    const formField = mapAmplifyErrorToVerifyField(err);
    setError(formField, {
      message: err.message || 'An unknown error occurred',
    });
  }
};
