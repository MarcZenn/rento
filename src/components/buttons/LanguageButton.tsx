import { View, Pressable, Image, ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslate } from '@/src/i18n';
import { SUPPORTED_LANGUAGES } from '@/src/i18n/types';

interface LanguageButtonProps {
  lng: SUPPORTED_LANGUAGES;
  imgSrc: ImageSourcePropType;
}

export const LanguageButton = ({ lng, imgSrc }: LanguageButtonProps) => {
  const changeLanguage = useTranslate();

  return (
    <View style={[styles.flagContainer]}>
      <Pressable
        style={({ pressed }) => [styles.flagButton, pressed && styles.buttonPressed]}
        onPress={() => changeLanguage(lng)}
      >
        <Image style={styles.flagImg} source={imgSrc} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  flagContainer: {
    backgroundColor: theme.colors.appBackground,
  },
  flagButton: {
    backgroundColor: theme.colors.elevatedSurface,
    borderRadius: 7,
    width: 50,
    height: 50,
    padding: 0,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    backgroundColor: theme.colors.accentMatcha,
  },
  flagImg: {
    flex: 1,
    width: 50,
    height: 50,
    resizeMode: 'cover',
  },
}));
