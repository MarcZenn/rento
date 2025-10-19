import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useUserProfile } from '@/client/services/api/hooks/useUserProfile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileProps = {
  userId?: string;
  showBackButton?: boolean;
};

export const ProfileHeader = ({ userId, showBackButton }: ProfileProps) => {
  const { userProfile } = useUserProfile();
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.page]}>
      <Text>Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  page: {},
}));
