import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Header } from '@/components/Header';

const Page = () => {
  return (
    <ScrollView style={[styles.page]}>
      <Header />
    </ScrollView>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
}));

export default Page;
