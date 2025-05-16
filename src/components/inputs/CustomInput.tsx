import { TextInput, TextInputProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// extends TextInput from react native.
// accepts override styles as prop
type CustomInputProps = {
  // custom props
} & TextInputProps;

export const CustomInput = (props: CustomInputProps) => {
  return <TextInput {...props} style={[styles.input, props.style]} />;
};

const styles = StyleSheet.create(theme => ({
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: theme.colors.elevatedSurface,
  },
}));
