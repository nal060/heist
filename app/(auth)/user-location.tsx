import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { createConsumerProfile } from '../../src/data/auth';
import PageDots from '../../src/components/ui/PageDots';
import Button from '../../src/components/ui/Button';

export default function UserLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setOnboarded } = useAuth();
  const { setLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finishOnboarding = async (name: string, lat: number, lon: number) => {
    if (!user) return;

    try {
      const emailName = user.email?.split('@')[0] || 'Usuario';
      await createConsumerProfile(user.id, emailName);
      await setLocation({ name: strings.discover.defaultLocation, latitude: lat, longitude: lon });
      setOnboarded();
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Necesitamos acceso a tu ubicación para mostrarte tiendas cercanas.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // Reverse-geocode to get a meaningful location name
      let name: string = strings.changeLocation.myCurrentLocation;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          name = [place.city, place.region].filter(Boolean).join(', ') || name;
        }
      } catch {
        // Keep default name if reverse geocode fails
      }

      await finishOnboarding(name, latitude, longitude);
    } catch {
      await finishOnboarding(strings.discover.defaultLocation, strings.discover.latitude, strings.discover.longitude);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const emailName = user.email?.split('@')[0] || 'Usuario';
      await createConsumerProfile(user.id, emailName);
      // Mark onboarded without setting a location — the nav guard in _layout
      // will redirect to /change-location since no location is set.
      setOnboarded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xxl }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="location" size={56} color={colors.primary[600]} />
          </View>
        </View>

        <Text style={styles.title}>{strings.userLocation.title}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary[500]} style={styles.loader} />
      ) : (
        <View style={styles.footer}>
          <PageDots total={3} current={2} />

          <Button
            label={strings.userLocation.useCurrentLocation}
            onPress={handleUseCurrentLocation}
            size="lg"
            fullWidth
          />
          <Button
            label={strings.userLocation.selectLocation}
            onPress={handleSelectLocation}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * typography.lineHeight.relaxed,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  loader: {
    marginBottom: spacing.xxl,
  },
  footer: {
    gap: spacing.sm,
  },
});
