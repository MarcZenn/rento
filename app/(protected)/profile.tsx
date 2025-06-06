import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Header } from '@/src/components/Header';

const Home = () => {
  return (
    <View style={[styles.page]}>
      <Header />
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
}));

export default Home;
