import { View, Pressable, Image, Text } from 'react-native';
import { supported_locales, useTranslate } from '@/client/i18n';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  isSignedIn?: boolean;
};

export const Header = ({ isSignedIn }: HeaderProps) => {
  const { t } = useTranslation();
  const changeLanguage = useTranslate();

  return (
    <View style={[styles.container]}>
      <View style={[styles.logoContainer]}>
        {isSignedIn ? (
          <Text>username</Text>
        ) : (
          <Text style={[styles.logoText]}>{t('brand_text')}</Text>
        )}
      </View>

      <View style={[styles.languageSelector]}>
        {supported_locales.map((locale, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => changeLanguage(locale.ISO639_code)}
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
    paddingBottom: 10,
    paddingTop: 75,
    paddingHorizontal: 20,
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
