import { View, Text, TextInput, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const EmailLogin = () => {
  return (
    <View style={[styles.page]}>
      <Text style={[styles.title]}>Sign in</Text>

      <TextInput style={[styles.input]} placeholder="email" />
      <TextInput style={[styles.input]} placeholder="password" secureTextEntry />

      <Pressable style={[styles.signInButton]} onPress={() => {}}>
        <Text style={[styles.signInButtonText]}>Sign In</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    display: 'flex',
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.appBackground,
    gap: 20,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.notoJpBold,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: theme.colors.elevatedSurface,
  },
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
