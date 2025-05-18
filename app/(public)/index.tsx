import { useState } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

import { images } from '@/src/constants/images';
import { supportedLanguages } from '@/src/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HeroLogo } from '@/src/components/HeroLogo';
import { CustomButton } from '@/src/components/buttons/CustomButton';
import { LanguageButton } from '@/src/components/buttons/LanguageButton';

const authMethods = [
  {
    image: images.logos.line,
    text: 'login_screen.LINE_login',
    link: '(auth)/sign_in',
  },
  {
    image: images.logos.google,
    text: 'login_screen.google_login',
    link: '(auth)/sign_in',
  },
  {
    image: images.icons.email,
    text: 'login_screen.email_login',
    link: '(auth)/sign_in',
  },
];

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <View style={[styles.page]}>
      <HeroLogo />

      <View style={[styles.languageButtonsContainer]}>
        <LanguageButton lng={supportedLanguages.japanese} imgSrc={images.flags.japan} />
        <LanguageButton lng={supportedLanguages.english} imgSrc={images.flags.uk} />
      </View>

      <ScrollView>
        <View style={[styles.ssoButtonsContainer]}>
          {authMethods.map((obj, index) => (
            <Link style={[styles.ssoButton]} key={index} href={obj.link} asChild>
              <CustomButton>
                <View style={[styles.imgWrapper]}>
                  <Image source={obj.image} style={styles.img} />
                </View>
                <View style={[styles.btnTextWrapper]}>
                  <Text style={[styles.btnText]}>{t(obj.text)}</Text>
                </View>
                <View style={[styles.btnIcon]}>
                  <Ionicons name="chevron-forward" size={20} color={'grey'} />
                </View>
              </CustomButton>
            </Link>
          ))}
        </View>

        <Link href={'/sign_up'} style={[styles.signUpLink]}>
          Don't have an account? Sign up.
        </Link>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: theme.colors.appBackground,
    paddingTop: 75,
    gap: 0,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 5,
  },
  ssoButtonsContainer: {
    backgroundColor: theme.colors.appBackground,
    alignItems: 'center',
    gap: 10,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    width: '80%',
  },
  imgWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    objectFit: 'contain',
  },
  img: {
    height: 50,
    width: 50,
  },
  btnTextWrapper: {
    flex: 3,
    paddingLeft: 10,
  },
  btnText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.bodyText,
    fontFamily: theme.fonts.interMedium,
    textAlign: 'center',
  },
  btnIcon: {
    flex: 1,
    alignItems: 'center',
  },
  signUpLink: {
    color: theme.colors.accentSky,
    fontFamily: theme.fonts.interLight,
    textAlign: 'center',
    marginTop: 10,
  },
}));
