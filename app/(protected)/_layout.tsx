import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function ProtectedLayout() {
  const { theme } = useUnistyles();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={'/(public)'} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: () => <Ionicons name="home" size={20} color={theme.colors.accentMatcha} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: () => (
            <Ionicons name="person-circle-outline" size={20} color={theme.colors.accentMatcha} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create(theme => ({
  tabBarStyle: {
    backgroundColor: theme.colors.appBackground,
    height: 70,
    borderTopWidth: 0.5,
    borderColor: theme.colors.elevatedSurface,
  },
}));
