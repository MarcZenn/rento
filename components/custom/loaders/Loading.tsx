import { View, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const LoadingSpinner = () => {
  return (
    <View style={[styles.container]}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
