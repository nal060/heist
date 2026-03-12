import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '../../src/theme';

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
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'grid-outline' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          title: 'Mis Bolsas',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'bag-outline' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'receipt-outline' as TabIconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Negocio',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'storefront-outline' as TabIconName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
