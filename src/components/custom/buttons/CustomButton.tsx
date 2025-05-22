import { PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type CustomButtonProps = {
  style?: StyleProp<ViewStyle>; // override to standard ViewStyle
} & PressableProps;

export const CustomButton = ({
  children,
  style,
  ...props
}: PropsWithChildren<CustomButtonProps>) => {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [style, styles.button, pressed && styles.buttonPressed]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  button: {
    display: 'flex',
    backgroundColor: theme.colors.elevatedSurface,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    backgroundColor: theme.colors.accentMatcha,
  },
}));
