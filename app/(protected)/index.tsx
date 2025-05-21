import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const HomeScreen = () => {
  return (
    <View style={[styles.page]}>
      <Text>
        This will be the property search screen - by default it will show available properties in
        preferred wards
      </Text>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
}));
