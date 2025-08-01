import { Image, View, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { useRouter } from 'expo-router';

import { images } from '@/src/constants/images';
import { Header } from '@/components/Header';
import { CustomButton } from '@/components/custom/buttons/CustomButton';

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();

  const getStarted = () => {
    router.push('/(auth)/welcome');
  };

  return (
    <View style={[styles.page]}>
      <Header />

      <ScrollView contentContainerStyle={[styles.scrollView]}>
        <View style={[styles.textWrapper]}>
          <Text style={[styles.heading]}>{t('landing_screen.heading')}</Text>
          <Text style={[styles.explainer]}>{t('landing_screen.explainer')}</Text>
        </View>

        <View style={[styles.imgWrapper]}>
          <Image source={images.landing} style={styles.img} />
        </View>

        <CustomButton onPress={getStarted} style={[styles.button]}>
          <Text style={[styles.buttonText]}>{t('landing_screen.button')}</Text>
        </CustomButton>
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
    paddingTop: 50,
  },
  textWrapper: {
    gap: 15,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: theme.fontSizes.xxxxl,
    fontFamily: theme.fonts.interBold,
    color: theme.colors.brand,
    textAlign: 'center',
  },
  explainer: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.notoJpExtraLight,
    color: theme.colors.bodyText,
    textAlign: 'center',
  },
  imgWrapper: {
    flexDirection: 'column',
    height: 400,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  img: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: theme.colors.elevatedSurface,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 25,
    borderWidth: 1,
    marginHorizontal: 'auto',
    borderColor: theme.colors.brand,
    width: '80%',
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.interMedium,
    color: theme.colors.brand,
    textAlign: 'center',
  },
}));
