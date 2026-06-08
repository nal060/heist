import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="user-preferences" />
      <Stack.Screen name="pickup-preferences" />
      <Stack.Screen name="user-location" />
      <Stack.Screen name="business-search" />
      <Stack.Screen name="business-review" />
      <Stack.Screen name="business-manual" />
      <Stack.Screen name="business-photo" />
      <Stack.Screen name="business-category" />
      <Stack.Screen name="bag-name" />
      <Stack.Screen name="bag-size" />
      <Stack.Screen name="bag-quantity" />
      <Stack.Screen name="bag-schedule" />
      <Stack.Screen name="bag-review" />
      <Stack.Screen name="bag-whats-next" />
    </Stack>
  );
}
