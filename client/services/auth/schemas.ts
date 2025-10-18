/**
 * Validation schemas for authentication forms
 */
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const userNotFound = 'UserNotFoundException',
  invalidParameter = 'InvalidParameterException',
  notAuthorized = 'NotAuthorizedException',
  notConfirmed = 'UserNotConfirmedException',
  usernameExists = 'UsernameExistsException',
  invalidPassword = 'InvalidPasswordException',
  codeMismatch = 'CodeMismatchException',
  codeExpired = 'ExpiredCodeException';

/**
 * Get user-friendly error message for verification errors
 * TODO:: translate into JP as well
 */
export const getUserFriendlyErrorMessages = (error: any): string => {
  const errorCode = error.name || error.code;
  const errorMessage = error.message || '';

  // Lambda PostConfirmation failure (database sync failed)
  if (
    errorMessage.includes('PostConfirmation failed') ||
    errorMessage.includes('GraphQL') ||
    errorMessage.includes('database')
  ) {
    return 'Account creation failed. Please try signing up again or contact support if the issue persists.';
  }

  // User does not exist or could not be found
  if (errorCode === userNotFound) {
    return 'Username does not exist - please try again.';
  }

  // user has not yet verified their email
  if (errorCode === notConfirmed) {
    return 'Account not yet confirmed - please check your email for verification code or request another one.';
  }

  // username already exists
  if (errorCode === usernameExists) {
    return 'Username already exists - please try a different username.';
  }

  // Invalid verification code
  if (errorCode === codeMismatch || errorMessage.includes('code')) {
    return 'Invalid verification code. Please check and try again.';
  }

  // Invalid password
  if (errorCode === invalidPassword) {
    return 'Password is invalid - please try a different password.';
  }

  // Code expired
  if (errorCode === codeExpired || errorMessage.includes('expired')) {
    return 'Verification code has expired. Please request a new code.';
  }

  // Too many attempts
  if (errorCode === 'LimitExceededException' || errorMessage.includes('attempts')) {
    return 'Too many failed attempts. Please try again later.';
  }

  // User already confirmed
  if (errorCode === notAuthorized && errorMessage.includes('confirmed')) {
    return 'Account already verified. Please try signing in.';
  }

  // Generic fallback
  return 'Verification failed. Please try again or contact support.';
};

// ============================================================================
// ERROR MAPPING
// ============================================================================

export type SignUpFields = z.infer<ReturnType<typeof useSignUpSchema>>;
export type SignInFields = z.infer<ReturnType<typeof useSignInSchema>>;
export type VerifyFields = z.infer<ReturnType<typeof useVerifyEmailSchema>>;

export const mapAmplifyErrorToSignUpField = (error: any): keyof SignUpFields | 'root' => {
  const errorCode = error.name || error.code;

  switch (errorCode) {
    case invalidParameter:
    case usernameExists:
      return 'email';
    case invalidPassword:
      return 'password';
    default:
      return 'root';
  }
};

export const mapAmplifyErrorToSignInField = (error: any): keyof SignInFields | 'root' => {
  const errorCode = error.name || error.code;

  switch (errorCode) {
    case userNotFound:
    case invalidParameter:
      return 'email';
    case notAuthorized:
    case notConfirmed:
      return 'password';
    default:
      return 'root';
  }
};

export const mapAmplifyErrorToVerifyField = (error: any): keyof VerifyFields | 'root' => {
  const errorCode = error.name || error.code;

  switch (errorCode) {
    case codeMismatch:
    case codeExpired:
      return 'code';
    default:
      return 'root';
  }
};

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const useSignInSchema = () => {
  const { t } = useTranslation();

  return z.object({
    email: z.string().email(t('forms.email.error.invalid')),
    password: z.string().min(8, t('forms.password.error.min_length')),
  });
};

export const useSignUpSchema = () => {
  const { t } = useTranslation();

  return z.object({
    username: z.string().min(3, t('forms.username.error.min_length')),
    email: z.string().email(t('forms.email.error.invalid')),
    password: z.string().min(8, t('forms.password.error.min_length')),
  });
};

export const useVerifyEmailSchema = () => {
  const { t } = useTranslation();

  return z.object({
    code: z.string().length(6, t('forms.verification_code.error.length')),
  });
};
