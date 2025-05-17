import { useState } from 'react';
import { Image, View, ScrollView, Text, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';

import { images } from '@/src/constants/images';
import { supportedLanguages } from '@/src/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LoadingSpinner } from '@/src/components/loaders/Loading';
import { CustomButton } from '@/src/components/buttons/CustomButton';
import { LanguageButton } from '@/src/components/buttons/LanguageButton';

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const buttons = [
    {
      image: images.logos.line,
      text: t('login_screen.LINE_login'),
      link: '',
    },
    {
      image: images.logos.google,
      text: t('login_screen.google_login'),
      link: '',
    },
    {
      image: images.icons.email,
      text: t('login_screen.email_login'),
      link: '(auth)/sign_in',
    },
  ];

  const onSignInMethodSelect = (path: string) => {
    router.push('(auth)/sign_in');
  };

  if (!loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.page]}>
      <View style={[styles.hero]}>
        <Image source={images.logos.rento} style={styles.heroImg} />
        <Text style={[styles.heroText]}>{t('login_screen.brand_text')}</Text>
      </View>

      <View style={[styles.languageButtonsContainer]}>
        <LanguageButton lng={supportedLanguages.japanese} imgSrc={images.flags.japan} />
        <LanguageButton lng={supportedLanguages.english} imgSrc={images.flags.uk} />
      </View>

      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.ssoButtonsContainer]}>
          {buttons.map(obj => (
            <CustomButton key={obj.text} style={[styles.ssoButton]}>
              <Link href={obj.link}>
                <View style={[styles.imgWrapper]}>
                  <Image source={obj.image} style={styles.img} />
                </View>
                <View style={[styles.btnTextWrapper]}>
                  <Text style={[styles.btnText]}>{obj.text}</Text>
                </View>
                <View style={[styles.btnIcon]}>
                  <Ionicons name="chevron-forward" size={20} color={'grey'} />
                </View>
              </Link>
            </CustomButton>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 75,
    height: 375,
    alignItems: 'center',
  },
  heroText: {
    fontSize: theme.fontSizes.xxxxl,
    color: theme.colors.brand,
    fontFamily: theme.fonts.notoJpMedium,
    textAlign: 'center',
  },
  heroImg: {
    height: '70%',
    width: '75%',
  },
  languageButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ssoButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.appBackground,
    alignItems: 'center',
    paddingTop: 20,
    height: '100%',
    width: '100%',
    gap: 15,
  },
  ssoButton: {
    display: 'flex',
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
}));
