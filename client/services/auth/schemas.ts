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
