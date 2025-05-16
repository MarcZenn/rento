import { Pressable, PressableProps, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type CustomButtonProps = {
  // custom props
  text?: string;
} & PressableProps;

export const CustomButton = ({ text, style, ...pressableProps }: CustomButtonProps) => {
  return (
    <Pressable {...pressableProps} style={[styles.signInButton]}>
      {text && <Text style={[styles.signInButtonText]}>{text}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  signInButton: {
    backgroundColor: theme.colors.elevatedSurface,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  signInButtonText: {
    color: theme.colors.bodyText,
    fontSize: theme.fontSizes.medium,
  },
}));
