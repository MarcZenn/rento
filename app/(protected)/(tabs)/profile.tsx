import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
// import Ionicons from '@expo/vector-icons/Ionicons';
import { signOut } from '@/client/services/auth/signout';

import { Header } from '@/client/components/Header';
import { ProfileHeader } from '@/client/components/ProfileHeader';

const Profile = () => {
  // const logOut = async () => {
  //   await signOut();
  //   router.replace('/');
  // };

  return (
    <ScrollView style={[styles.page]}>
      <Header />

      <ProfileHeader />

      <View></View>

      {/* <TouchableOpacity onPress={logOut}>
        <Ionicons name="log-out" size={24} />
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
}));

export default Profile;
