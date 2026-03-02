import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { createConsumerProfile } from '../../src/data/auth';
import Button from '../../src/components/ui/Button';

export default function UserLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setOnboarded } = useAuth();
  const { setLocation } = useLocation();
  const { countryId } = useLocalSearchParams<{ countryId: string }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finishOnboarding = async (lat: number, lon: number) => {
    if (!user) return;

    try {
      // Create consumer profile
      const emailName = user.email?.split('@')[0] || 'Usuario';
      await createConsumerProfile(user.id, emailName, countryId);

      // Save location
      await setLocation({ name: strings.discover.defaultLocation, latitude: lat, longitude: lon });

      // Mark onboarded and navigate to consumer tabs
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
        setError('Necesitamos acceso a tu ubicacion para mostrarte tiendas cercanas.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await finishOnboarding(location.coords.latitude, location.coords.longitude);
    } catch {
      // Fallback to Panama City default
      await finishOnboarding(
        strings.discover.latitude,
        strings.discover.longitude,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = async () => {
    // Use default Panama City coordinates and let user change later
    setLoading(true);
    await finishOnboarding(
      strings.discover.latitude,
      strings.discover.longitude,
    );
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xxl }]}>
      <View style={styles.content}>
        {/* Location icon */}
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
          {/* Page indicator */}
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
  },
  footer: {
    gap: spacing.sm,
  },
});
