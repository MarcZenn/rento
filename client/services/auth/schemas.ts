/**
 * Validation schemas for authentication forms
 */
import { useTranslation } from 'react-i18next';
import i81n from '../../i18n';
import { z } from 'zod';
import i18n from '../../i18n';

const userNotFound = 'UserNotFoundException',
  invalidParameter = 'InvalidParameterException',
  notAuthorized = 'NotAuthorizedException',
  notConfirmed = 'UserNotConfirmedException',
  usernameExists = 'UsernameExistsException',
  invalidPassword = 'InvalidPasswordException',
  codeMismatch = 'CodeMismatchException',
  codeExpired = 'ExpiredCodeException',
  tooManyAttempts = 'LimitExceededException';

/**
 * Get user-friendly error message for verification errors
 *
 */
export const getUserFriendlyErrorMessages = (error: any): string => {
  const errorCode = error.name || error.code;
  const errorMessage = error.message || '';

  // Lambda PostConfirmation failure (database sync failed)
  if (
    errorMessage.includes('PreSignUp failed') ||
    errorMessage.includes('GraphQL') ||
    errorMessage.includes('database')
  ) {
    return i18n.t('auth.errors.triggerFailure');
  }

  // User does not exist or could not be found
  if (errorCode === userNotFound) {
    return i81n.t('auth.errors.userNotFound');
  }

  // user has not yet confirmed cognito email
  if (errorCode === notConfirmed) {
    return i18n.t('auth.errors.notConfirmed');
  }

  // username already exists
  if (errorCode === usernameExists) {
    return i18n.t('auth.errors.usernameExists');
  }

  // Invalid verification code
  if (errorCode === codeMismatch || errorMessage.includes('code')) {
    return i18n.t('auth.errors.codeMismatch');
  }

  // Invalid password
  if (errorCode === invalidPassword) {
    return i18n.t('auth.errors.invalidPassword');
  }

  // Code expired
  if (errorCode === codeExpired || errorMessage.includes('expired')) {
    return i18n.t('auth.errors.codeExpired');
  }

  // Too many attempts
  if (errorCode === tooManyAttempts || errorMessage.includes('attempts')) {
    return i18n.t('auth.errors.tooManyAttempts');
  }

  // User already confirmed
  if (errorCode === notAuthorized && errorMessage.includes('confirmed')) {
    return i18n.t('auth.errors.notAuthorizedConfirmed');
  }

  // Generic fallback
  return i18n.t('auth.errors.genericFallback');
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
