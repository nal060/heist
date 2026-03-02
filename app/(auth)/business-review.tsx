import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getPlaceDetails } from '../../src/lib/googlePlaces';
import ProgressBar from '../../src/components/ui/ProgressBar';
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

    getPlaceDetails(placeId)
      .then((data) => {
        if (data) {
          setDetails(data);
        } else {
          // Fallback to params
          setDetails({
            name: placeName || '',
            address: placeAddress || '',
            phone: null,
            latitude: 8.953,
            longitude: -79.534,
            rating: null,
            photoReferences: [],
          });
        }
      })
      .catch(() => {
        setDetails({
          name: placeName || '',
          address: placeAddress || '',
          phone: null,
          latitude: 8.953,
          longitude: -79.534,
          rating: null,
          photoReferences: [],
        });
      })
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
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.businessSearch.reviewTitle}</Text>
        <Text style={styles.subtitle}>{strings.businessSearch.reviewSubtitle}</Text>

        {details && (
          <View style={styles.card}>
            {/* Map placeholder */}
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
      </ScrollView>

      <ProgressBar current={1} total={6} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.common.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.xxl,
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
  footer: {
    paddingTop: spacing.lg,
  },
});
