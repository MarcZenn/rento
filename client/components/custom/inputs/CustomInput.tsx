import { useState } from 'react';
import { TextInput, TextInputProps, Text, View, Pressable } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

// accepts override styles as prop
type CustomInputProps<T extends FieldValues> = {
  // custom props
  control: Control<T>;
  name: Path<T>; // This is a path of T where T is specific type passed down from parent.
  isSecureEntry: boolean;
} & TextInputProps;

// T = generic type from a specific type passed in from parent
export const CustomInput = <T extends FieldValues>({
  control,
  name,
  isSecureEntry,
  ...textInputProps
}: CustomInputProps<T>) => {
  const [isInputVisible, setInputVisibility] = useState(true);

  const handleSecurePress = () => {
    setInputVisibility(!isInputVisible);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={[styles.container]}>
          <View style={[styles.inputContainer, textInputProps.style]}>
            <TextInput
              value={value}
              onChangeText={onChange}
              secureTextEntry={isSecureEntry && isInputVisible}
              onBlur={onBlur}
              {...textInputProps}
              placeholderTextColor={'grey'}
              style={[styles.input]}
            />
            {isSecureEntry && (
              <Pressable onPress={handleSecurePress}>
                <Ionicons name={isInputVisible ? 'eye-off' : 'eye'} size={20} color={'grey'} />
              </Pressable>
            )}
          </View>
          <Text style={[styles.errorText]}>{error?.message}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    gap: 2,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.bodyText,
  },
  errorText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.interRegular,
    paddingHorizontal: 5,
    color: theme.colors.error,
  },
}));
