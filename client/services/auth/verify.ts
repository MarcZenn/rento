import { confirmSignUp } from 'aws-amplify/auth';
import { UseFormSetError } from 'react-hook-form';
import {
  VerifyFields,
  mapAmplifyErrorToVerifyField,
  getUserFriendlyErrorMessages,
} from './schemas';
import { router } from 'expo-router';

/**
 * NOTE: User validation in the database is now handled automatically by
 * AWS Lambda PostConfirmation trigger. When Cognito successfully confirms
 * a user, it invokes a Lambda function which calls our GraphQL API to
 * update the user record in PostgreSQL (is_verified = true).
 *
 * This ensures data consistency
 */
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
    const userFriendlyMessage = getUserFriendlyErrorMessages(err);
    const formField = mapAmplifyErrorToVerifyField(err);
    setError(formField, {
      message: userFriendlyMessage,
    });
  }
};
