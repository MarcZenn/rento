import { signUp as amplifySignUp, type SignUpOutput } from 'aws-amplify/auth';
import { apolloClient } from '@/client/apollo';
import { gql } from '@apollo/client';
import { UseFormSetError } from 'react-hook-form';
import { mapAmplifyErrorToSignUpField, SignUpFields } from './schemas';
import { router } from 'expo-router';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      cognitoId
      email
      username
      createdAt
    }
  }
`;

type SetFormError = UseFormSetError<{
  email: string;
  password: string;
  username: string;
}>;

const handleNextSteps = async (result: SignUpOutput, username: string, email: string) => {
  try {
    if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      await apolloClient.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          input: {
            cognitoId: result.userId,
            email,
            username: username || email.split('@')[0],
          },
        },
      });

      router.push({
        pathname: '/verify',
        params: {
          email,
        },
      });
    } else if (result.isSignUpComplete) {
      router.push('/home'); // Unlikely but handle immediate completion
    }
  } catch (error) {
    // TODO:: Rollback logic needed in case of orphaned user
  }
};

export const signUp = async (data: SignUpFields, setError: SetFormError) => {
  try {
    const { email, password, username } = data;
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
    await handleNextSteps(result, username, email);
  } catch (err: any) {
    console.error('Sign up error:', err);
    const formField = mapAmplifyErrorToSignUpField(err);
    setError(formField, {
      message: err.message || 'An unknown error occurred',
    });
  }
};
