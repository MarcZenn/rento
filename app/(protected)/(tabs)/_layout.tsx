import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function ProtectedLayout() {
  const { theme } = useUnistyles();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={'/public'} />;
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
        name="feed"
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={20}
              color={focused ? theme.colors.accentMatcha : theme.colors.bodyText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={20}
              color={focused ? theme.colors.accentMatcha : theme.colors.bodyText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={20}
              color={focused ? theme.colors.accentMatcha : theme.colors.bodyText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={20}
              color={focused ? theme.colors.accentMatcha : theme.colors.bodyText}
            />
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
