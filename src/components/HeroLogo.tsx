import { View, Image } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { images } from '@/src/constants/images';

export const HeroLogo = () => {
  return (
    <View style={[styles.heroContainer]}>
      <Image source={images.logos.rento} style={styles.heroImg} />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 375,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  heroImg: {
    height: '70%',
    width: '75%',
  },
}));
