import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { Platform } from 'react-native';
import { useLocation } from '../../src/context/LocationContext';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const { location, isLoaded } = useLocation();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !location) {
      router.replace('/change-location');
    }
  }, [isLoaded, location, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar.bg,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.discover,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'compass' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: strings.tabs.browse,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'search' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: strings.tabs.favorites,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'heart' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: strings.tabs.profile,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'person' as TabIconName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
