import { View, Image, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { images } from '@/src/constants/images';

export const HeroLogo = () => {
  const { t } = useTranslation();

  return (
    <View style={[styles.heroContainer]}>
      <Image source={images.logos.rento} style={styles.heroImg} />
      <Text style={[styles.heroText]}>{t('login_screen.brand_text')}</Text>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 375,
    alignItems: 'center',
    padding: 0,
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
}));
