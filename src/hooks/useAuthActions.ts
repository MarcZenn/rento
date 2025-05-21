import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import {
  useSignInSchema,
  useSignUpSchema,
  useVerifyEmailSchema,
} from '@/src/utils/validation/schemas';
import { UseFormSetError } from 'react-hook-form';
import { router } from 'expo-router';
import { z } from 'zod';

type SignInFields = z.infer<ReturnType<typeof useSignInSchema>>;
type SignUpFields = z.infer<ReturnType<typeof useSignUpSchema>>;
type VerifyFields = z.infer<ReturnType<typeof useVerifyEmailSchema>>;

const mapClerkErrorToSignInField = (err: any) => {
  switch (err.meta?.paramName) {
    case 'identifier':
      return 'email';
    case 'password':
      return 'password';
    default:
      return 'root';
  }
};

const mapClerkErrorToSignUpField = (err: any) => {
  switch (err.meta?.paramName) {
    case 'email_address':
      return 'email';
    case 'password':
      return 'password';
    case 'first_name':
      return 'firstName';
    case 'surname':
      return 'surname';
    case 'username':
      return 'username';
    default:
      return 'root';
  }
};

const mapClerkErrorToVerifyField = (err: any) => {
  switch (err.meta?.paramName) {
    case 'code':
      return 'code';
    default:
      return 'root';
  }
};

export const useAuthActions = (
  setError: UseFormSetError<{
    email: string;
    password: string;
    firstName: string;
    username: string;
    surname: string;
    code: string;
  }>
) => {
  const logIn = async (data: SignInFields) => {
    const { signIn, isLoaded, setActive } = useSignIn();

    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        setActive({ session: signInAttempt.createdSessionId });
      } else {
        console.log('sign in failed');
        setError('root', {
          message: 'Sign in could not be completed',
        });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach(error => {
          const formField = mapClerkErrorToSignInField(error);
          setError(formField, {
            message: error.longMessage,
          });
        });
      } else {
        setError('root', {
          message: 'Unknown error.',
        });
      }
    }
  };

  const createAccount = async (data: SignUpFields) => {
    const { signUp, isLoaded } = useSignUp();

    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.surname,
        username: data.username,
      });

      await signUp.prepareVerification({ strategy: 'email_code' });

      router.push('/verify');
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach(error => {
          const formField = mapClerkErrorToSignUpField(error);

          setError(formField, {
            message: error.longMessage,
          });
        });
      } else {
        setError('root', {
          message: 'Unknown error.',
        });
      }
    }
  };

  const verifyEmail = async (data: VerifyFields) => {
    const { signUp, isLoaded, setActive } = useSignUp();

    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptVerification({
        strategy: 'email_code',
        code: data.code,
      });

      if (signUpAttempt.status === 'complete') {
        setActive({ session: signUpAttempt.createdSessionId });
        router.push('/(protected)/home');
      } else {
        console.log('Verification failed');
        setError('root', {
          message: 'Verification could not be completed',
        });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach(error => {
          const formField = mapClerkErrorToVerifyField(error);
          setError(formField, {
            message: error.longMessage,
          });
        });
      } else {
        setError('root', {
          message: 'Unknown error.',
        });
      }
    }
  };

  return { logIn, createAccount, verifyEmail };
};
