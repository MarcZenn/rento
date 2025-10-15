import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useSignInSchema, useSignUpSchema, useVerifyEmailSchema } from './schemas';
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
  console.log(err, 'error');
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
  const { signIn, isLoaded: isSignInLoaded, setActive: setLoginActive } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded, setActive: setSignUpActive } = useSignUp();

  const logIn = async (data: SignInFields) => {
    if (!isSignInLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        setLoginActive({ session: signInAttempt.createdSessionId });
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
    if (!isSignUpLoaded) return;

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
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
    if (!isSignUpLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptVerification({
        strategy: 'email_code',
        code: data.code,
      });

      if (signUpAttempt.status === 'complete') {
        setSignUpActive({ session: signUpAttempt.createdSessionId });
        router.push('/home');
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
