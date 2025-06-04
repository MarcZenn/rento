import { Image, View, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { Link } from 'expo-router';

import { images } from '@/src/constants/images';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HeroLogo } from '@/src/components/HeroLogo';
import { Header } from '@/src/components/Header';
import { CustomButton } from '@/src/components/custom/buttons/CustomButton';
import { SignInWith } from '@/src/components/custom/buttons/SignInWith';

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <View style={[styles.page]}>
      <Header />

      <HeroLogo />

      <ScrollView contentContainerStyle={[styles.scrollView]}>
        <View style={[styles.ssoButtonsContainer]}>
          <SignInWith strategy="oauth_line">
            <View style={[styles.imgWrapper]}>
              <Image source={images.logos.line} style={styles.img} />
            </View>
            <View style={[styles.btnTextWrapper]}>
              <Text style={[styles.btnText]}>{t('welcome_screen.LINE_login')}</Text>
            </View>
            <View style={[styles.btnIcon]}>
              <Ionicons name="chevron-forward" size={20} color={'grey'} />
            </View>
          </SignInWith>

          <SignInWith strategy="oauth_google">
            <View style={[styles.imgWrapper]}>
              <Image source={images.logos.google} style={styles.img} />
            </View>
            <View style={[styles.btnTextWrapper]}>
              <Text style={[styles.btnText]}>{t('welcome_screen.google_login')}</Text>
            </View>
            <View style={[styles.btnIcon]}>
              <Ionicons name="chevron-forward" size={20} color={'grey'} />
            </View>
          </SignInWith>

          <Link style={[styles.ssoButton]} href="(auth)/sign_in" asChild>
            <CustomButton>
              <View style={[styles.imgWrapper]}>
                <Image source={images.icons.email} style={styles.img} />
              </View>
              <View style={[styles.btnTextWrapper]}>
                <Text style={[styles.btnText]}>{t('welcome_screen.email_login')}</Text>
              </View>
              <View style={[styles.btnIcon]}>
                <Ionicons name="chevron-forward" size={20} color={'grey'} />
              </View>
            </CustomButton>
          </Link>

          <Link href={'/sign_up'} style={[styles.signUpLink]}>
            {t('auth.no_account')}
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: theme.colors.appBackground,
    gap: 0,
  },
  scrollView: {
    flex: 1,
    height: '100%',
    width: '100%',
    paddingTop: 15,
  },
  ssoButtonsContainer: {
    backgroundColor: theme.colors.appBackground,
    flex: 1,
    height: '100%',
    alignItems: 'center',
    paddingTop: 30,
    gap: 25,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.elevatedSurface,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: theme.colors.brand,
    width: '85%',
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
    fontFamily: theme.fonts.interRegular,
    textAlign: 'center',
    marginTop: 10,
  },
}));
