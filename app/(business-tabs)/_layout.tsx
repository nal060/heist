import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { Platform } from 'react-native';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

export default function BusinessTabLayout() {
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
          title: strings.businessTabs.dashboard,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'home' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          title: strings.businessTabs.bags,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'bag-handle' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: strings.businessTabs.orders,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'receipt' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: strings.businessTabs.profile,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'storefront' as TabIconName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
