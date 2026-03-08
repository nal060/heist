import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getPlaceDetails } from '../../src/lib/googlePlaces';
import ScreenShell from '../../src/components/ui/ScreenShell';
import Button from '../../src/components/ui/Button';

export default function BusinessReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { placeId, placeName, placeAddress, countryId } = useLocalSearchParams<{
    placeId: string;
    placeName: string;
    placeAddress: string;
    countryId: string;
  }>();

  const [details, setDetails] = useState<{
    name: string;
    address: string;
    phone: string | null;
    latitude: number;
    longitude: number;
    rating: number | null;
    photoReferences: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!placeId) {
      setLoading(false);
      return;
    }

    const fallback = {
      name: placeName || '',
      address: placeAddress || '',
      phone: null,
      latitude: 8.953,
      longitude: -79.534,
      rating: null,
      photoReferences: [],
    };

    getPlaceDetails(placeId)
      .then((data) => setDetails(data || fallback))
      .catch(() => setDetails(fallback))
      .finally(() => setLoading(false));
  }, [placeId, placeName, placeAddress]);

  const handleContinue = () => {
    if (!details) return;
    router.push({
      pathname: '/(auth)/business-category',
      params: {
        name: details.name,
        description: '',
        address: details.address,
        phone: details.phone || '',
        latitude: String(details.latitude),
        longitude: String(details.longitude),
        googlePlaceId: placeId || '',
        countryId,
        photoRefs: JSON.stringify(details.photoReferences),
      },
    });
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(auth)/business-manual',
      params: {
        countryId,
        prefillName: details?.name || '',
        prefillAddress: details?.address || '',
        prefillPhone: details?.phone || '',
        prefillLat: String(details?.latitude || 8.953),
        prefillLon: String(details?.longitude || -79.534),
        googlePlaceId: placeId || '',
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScreenShell
      title={strings.businessSearch.reviewTitle}
      subtitle={strings.businessSearch.reviewSubtitle}
      progress={{ current: 1, total: 6 }}
      footer={
        <Button
          label={strings.common.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
        />
      }
    >
      {details && (
        <View style={styles.card}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={colors.primary[500]} />
            <TouchableOpacity style={styles.editBadge} onPress={handleEdit}>
              <Ionicons name="pencil" size={14} color={colors.white} />
              <Text style={styles.editBadgeText}>{strings.common.edit}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text style={styles.businessName}>{details.name}</Text>
              {details.rating && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F57C00" />
                  <Text style={styles.ratingText}>{details.rating}</Text>
                </View>
              )}
            </View>
            <Text style={styles.businessAddress}>{details.address}</Text>
            {details.phone && (
              <Text style={styles.businessPhone}>{details.phone}</Text>
            )}
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    ...shadows.md,
    backgroundColor: colors.background.primary,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  editBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  cardBody: {
    padding: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  businessName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#F57C00',
  },
  businessAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  businessPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
  },
});
