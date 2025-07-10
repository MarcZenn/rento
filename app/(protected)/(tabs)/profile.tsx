import { View, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Header } from '@/src/components/Header';

const Profile = () => {
  const { signOut } = useAuth();

  const logOut = async () => {
    await signOut();

    console.log('navigating back to auth page?');
    router.replace('/');
  };

  return (
    <View style={[styles.page]}>
      <Header />

      <TouchableOpacity onPress={logOut}>
        <Ionicons name="log-out" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
}));

export default Profile;
