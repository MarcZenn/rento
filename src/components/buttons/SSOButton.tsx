import { TouchableOpacity, View, Image, Text, ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SSOButtonProps {
  imgSrc: ImageSourcePropType;
  buttonText: string;
}

export const SSOButton = ({ imgSrc, buttonText }: SSOButtonProps) => {
  return (
    <TouchableOpacity style={[styles.ssoButtonContainer]}>
      <View style={[styles.imgWrapper]}>
        <Image source={imgSrc} style={styles.img} />
      </View>
      <View style={[styles.btnTextWrapper]}>
        <Text style={[styles.btnText]}>{buttonText}</Text>
      </View>
      <View style={[styles.btnIcon]}>
        <Ionicons name="chevron-forward" size={20} color={'grey'} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(theme => ({
  ssoButtonContainer: {
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
