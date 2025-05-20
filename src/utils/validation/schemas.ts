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

const createSignUpSchema = (t: TranslationFunction) =>
  z.object({
    surname: z.string({ message: t('forms.surname.required') }),
    firstName: z.string({ message: t('forms.name.required') }),
    email: z.string({ message: t('forms.email.required') }).email(t('forms.email.invalid')),
    password: z.string({ message: t('forms.password.required') }).min(8, t('forms.password.min')),
  });

export const useSignUpSchema = () => {
  const { t } = useTranslation();

  return useMemo(() => createSignUpSchema(t), [t]);
};
