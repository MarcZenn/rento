import { signIn as amplifySignIn, type SignInOutput } from 'aws-amplify/auth';
import { UseFormSetError } from 'react-hook-form';
import {
  mapAmplifyErrorToSignInField,
  SignInFields,
  getUserFriendlyErrorMessages,
} from './schemas';
import { router } from 'expo-router';

type SetFormError = UseFormSetError<{
  email: string;
  password: string;
}>;

export const signIn = async (data: SignInFields, setError: SetFormError) => {
  try {
    const result: SignInOutput = await amplifySignIn({
      username: data.email,
      password: data.password,
    });

    if (result.isSignedIn) {
      router.push('/home');
    } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      // User has not fully completed sign up process
      router.push('/verify');
    } else {
      setError('root', {
        message: 'Sign in could not be completed',
      });
    }
  } catch (err: any) {
    console.log(err, 'Error during log in');
    const userFriendlyMessage = getUserFriendlyErrorMessages(err);
    const formField = mapAmplifyErrorToSignInField(err);
    setError(formField, {
      message: userFriendlyMessage,
    });
  }

  return;
};
