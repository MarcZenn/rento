import { View, Pressable, Image, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useTranslate } from '@/src/i18n';
import { supported_locales } from '@/src/i18n';

export const Header = () => {
  const { t } = useTranslation();
  const changeLanguage = useTranslate();

  return (
    <View style={[styles.container]}>
      <View style={[styles.logoContainer]}>
        <Text style={[styles.logoText]}>{t('brand_text')}</Text>
      </View>

      <View style={[styles.languageSelector]}>
        {supported_locales.map((locale, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => changeLanguage(locale.code)}
          >
            <Image style={styles.img} source={locale.flag} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
  },
  logoText: {
    color: theme.colors.brand,
    fontSize: theme.fontSizes.xxxl,
    fontFamily: theme.fonts.notoJpBold,
  },
  languageSelector: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 5,
  },
  button: {
    display: 'flex',
    backgroundColor: theme.colors.elevatedSurface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    width: 35,
    height: 35,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    backgroundColor: theme.colors.accentMatcha,
  },
  img: {
    flex: 1,
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
}));
