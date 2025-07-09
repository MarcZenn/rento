import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useAuth } from '@clerk/clerk-expo';

import { Header } from '@/src/components/Header';

const Page = () => {
  const { isSignedIn } = useAuth();

  return (
    <ScrollView style={[styles.page]}>
      <Header isSignedIn={isSignedIn} />
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
