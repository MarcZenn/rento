import { PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type CustomButtonProps = {
  style?: StyleProp<ViewStyle>;
} & PressableProps;

export const CustomButton = ({
  children,
  style,
  ...pressableProps
}: PropsWithChildren<CustomButtonProps>) => {
  return (
    <Pressable {...pressableProps} style={[styles.button, style]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  button: {
    display: 'flex',
  },
}));
