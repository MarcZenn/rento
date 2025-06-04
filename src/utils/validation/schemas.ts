import { useMemo } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

type TranslationFunction = (key: string) => string;

const createSignInSchema = (t: TranslationFunction) =>
  z.object({
    email: z.string({ message: t('forms.email.required') }).email(t('forms.email.invalid')),
    password: z.string({ message: t('forms.password.required') }).min(8, t('forms.password.min')),
  });

export const useSignInSchema = () => {
  const { t } = useTranslation();

  return useMemo(() => createSignInSchema(t), [t]);
};

const createSignUpSchema = (t: TranslationFunction) => {
  const signUpSchema = z.object({
    firstName: z
      .string()
      .trim()
      .min(1, { message: t('forms.name.required') }),
    surname: z
      .string()
      .trim()
      .min(1, { message: t('forms.surname.required') }),
    username: z
      .string()
      .trim()
      .min(1, { message: t('forms.username.required') }),
    email: z.string({ message: t('forms.email.required') }).email(t('forms.email.invalid')),
    password: z.string({ message: t('forms.password.required') }).min(8, t('forms.password.min')),
  });

  return signUpSchema;
};

export const useSignUpSchema = () => {
  const { t } = useTranslation();

  return useMemo(() => createSignUpSchema(t), [t]);
};

const createVerifyEmailSchema = (t: TranslationFunction) =>
  z.object({
    code: z.string({ message: t('forms.email.code_required') }),
  });

export const useVerifyEmailSchema = () => {
  const { t } = useTranslation();

  return useMemo(() => createVerifyEmailSchema(t), [t]);
};
