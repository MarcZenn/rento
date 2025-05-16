import { TextInput, TextInputProps, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Controller } from 'react-hook-form';

// accepts override styles as prop
type CustomInputProps = {
  // custom props
  control: any;
  name: string;
} & TextInputProps;

export const CustomInput = ({ control, name, ...textInputProps }: CustomInputProps) => {
  return (
    <Controller
      name="email"
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={[styles.inputContainer]}>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...textInputProps}
            style={[styles.input, textInputProps.style]}
          />
          <Text style={[styles.errorText]}>{error?.message}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create(theme => ({
  inputContainer: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: theme.colors.elevatedSurface,
  },
  errorText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.interThin,
    color: theme.colors.error,
  },
}));
