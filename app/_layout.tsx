import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet, ActivityIndicator, View, AppState } from 'react-native';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { LocationProvider, useLocation } from '../src/context/LocationContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme';

function RootNavigator() {
  const { session, userRole, isLoading, isOnboarded } = useAuth();
  const { location, isLoaded: locationLoaded } = useLocation();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !locationLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inConsumerTabs = segments[0] === '(tabs)';
    const inBusinessTabs = segments[0] === '(business-tabs)';
    const onChangeLocation = segments[0] === 'change-location';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (!isOnboarded) {
      // Signed in but hasn't completed onboarding — restart from welcome
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (userRole === 'consumer' && !location && !onChangeLocation) {
      // Consumer finished onboarding but has no location set — send to picker
      router.replace('/change-location');
    } else if (userRole === 'business') {
      if (inAuthGroup || inConsumerTabs) {
        router.replace('/(business-tabs)');
      }
    } else {
      if (inAuthGroup || inBusinessTabs) {
        router.replace('/(tabs)');
      }
    }
  }, [session, userRole, isLoading, isOnboarded, location, locationLoaded, segments, router]);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' && !sessionRef.current) {
        router.replace('/(auth)/welcome');
      }
    });
    return () => subscription.remove();
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(business-tabs)" />
        <Stack.Screen
          name="bag/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="bag/create"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="checkout/[bagId]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="order-confirmation/[orderId]"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="change-location"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="order-history"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="collect"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="business-edit-profile"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="business/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="business-calendar"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="payment-methods"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="business-payout-settings"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <LocationProvider>
          <FavoritesProvider>
            <BottomSheetModalProvider>
              <RootNavigator />
            </BottomSheetModalProvider>
          </FavoritesProvider>
        </LocationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
});
