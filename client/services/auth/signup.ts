import { signUp as amplifySignUp, type SignUpOutput } from 'aws-amplify/auth';
import { UseFormSetError } from 'react-hook-form';
import {
  mapAmplifyErrorToSignUpField,
  SignUpFields,
  getUserFriendlyErrorMessages,
} from './schemas';
import { router } from 'expo-router';

/**
 * NOTE: User creation in the database is now handled automatically by
 * AWS Lambda PostConfirmation trigger. When Cognito successfully creates
 * a user, it invokes the Lambda function which calls our GraphQL API to
 * create the user record in PostgreSQL (users + profiles tables).
 *
 * This ensures data consistency - if Lambda fails to create the DB record,
 * Cognito will reject the user confirmation, preventing orphaned users.
 */

type SetFormError = UseFormSetError<{
  email: string;
  password: string;
  username: string;
}>;

const handleNextSteps = async (result: SignUpOutput, email: string) => {
  if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
    // User needs to verify their email
    // Lambda will automatically create the database record after verification
    router.push({
      pathname: '/verify',
      params: {
        email,
      },
    });
  } else if (result.isSignUpComplete) {
    // Unlikely scenario - immediate completion without verification
    router.push('/home');
  }
};

export const signUp = async (data: SignUpFields, setError: SetFormError) => {
  try {
    const { email, password, username } = data;

    // Create user in AWS Cognito
    const result = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          preferred_username: username,
        },
      },
    });

    // Handle next steps (verification flow)
    await handleNextSteps(result, email);
  } catch (err: any) {
    console.error('Sign up error:', err);
    const userFriendlyMessage = getUserFriendlyErrorMessages(err);
    const formField = mapAmplifyErrorToSignUpField(err);
    setError(formField, {
      message: userFriendlyMessage,
    });
  }
};
