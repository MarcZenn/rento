import { TextInput, TextInputProps, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

// accepts override styles as prop
type CustomInputProps<T extends FieldValues> = {
  // custom props
  control: Control<T>;
  name: Path<T>; // This is a path of T where T is specific type passed down from parent.
} & TextInputProps;

// T = generic type from a specific type passed in from parent
export const CustomInput = <T extends FieldValues>({
  control,
  name,
  ...textInputProps
}: CustomInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={[styles.inputContainer]}>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...textInputProps}
            placeholderTextColor={'grey'}
            style={[textInputProps.style]}
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
  errorText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.interThin,
    color: theme.colors.error,
    paddingBottom: 5,
  },
}));
