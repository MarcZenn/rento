import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View, ScrollView, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { StatusBar } from 'expo-status-bar';
import { images } from '@/src/constants/images';
import { supportedLanguages } from '@/src/i18n';

import { LoadingSpinner } from '@/src/components/loaders/Loading';
import { SSOButton } from '@/src/components/buttons/SSOButton';
import { LanguageButton } from '@/src/components/buttons/LanguageButton';

export default function Root() {
  // const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

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
          <SSOButton imgSrc={images.logos.line} buttonText={t('login_screen.LINE_login')} />
          <SSOButton imgSrc={images.logos.google} buttonText={t('login_screen.google_login')} />
          <SSOButton imgSrc={images.logos.google} buttonText={t('login_screen.email_login')} />
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
    gap: 15,
  },
}));
