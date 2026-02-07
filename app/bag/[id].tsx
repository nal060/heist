import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getBagById } from '../../src/data';
import { useFavorites } from '../../src/context/FavoritesContext';
import PriceDisplay from '../../src/components/ui/PriceDisplay';
import Badge from '../../src/components/ui/Badge';
import RatingBadge from '../../src/components/ui/RatingBadge';
import Divider from '../../src/components/ui/Divider';
import BusinessLogo from '../../src/components/business/BusinessLogo';
import { formatPickupWindow, getPickupLabel } from '../../src/utils/formatTime';
import { getDiscountPercentage } from '../../src/utils/formatCurrency';
import type { BagWithBusiness } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

export default function BagDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [bag, setBag] = useState<BagWithBusiness | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBagById(id).then((data) => {
      setBag(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!bag) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Bolsa no encontrada</Text>
      </View>
    );
  }

  const favorite = isFavorite(bag.business_id);
  const discount = getDiscountPercentage(bag.original_price, bag.discounted_price);
  const isAvailable = bag.status === 'active' && bag.quantity_available > 0;
  const reviewBars = [
    { label: strings.bagDetail.ratingCategories.pickup, value: 0.85 },
    { label: strings.bagDetail.ratingCategories.quality, value: 0.78 },
    { label: strings.bagDetail.ratingCategories.variety, value: 0.72 },
    { label: strings.bagDetail.ratingCategories.quantity, value: 0.80 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: bag.business?.photo_url ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop' }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />

          <View style={[styles.topButtons, { top: insets.top + spacing.sm }]}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => toggleFavorite(bag.business_id)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? colors.primary[500] : colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {discount > 0 && (
            <View style={styles.discountBadgeContainer}>
              <Badge text={`-${discount}%`} variant="discount" />
            </View>
          )}
        </View>

        {/* Business Info */}
        <View style={styles.businessSection}>
          <BusinessLogo
            imageUrl={bag.business.photo_url}
            name={bag.business.name}
            size="lg"
          />
          <View style={styles.businessTextContainer}>
            <Text style={styles.businessName}>{bag.business.name}</Text>
            <RatingBadge rating={bag.business.rating} reviewCount={bag.business.total_reviews} />
          </View>
        </View>

        {/* Bag Title */}
        <View style={styles.section}>
          <Text style={styles.bagTitle}>{bag.title}</Text>
          {bag.category && (
            <Badge text={bag.category.name} variant="category" />
          )}
        </View>

        {/* Pickup Window */}
        <View style={styles.pickupSection}>
          <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupLabel}>{strings.bagDetail.pickupWindow}</Text>
            <Text style={styles.pickupTime}>
              {getPickupLabel(bag.date)} · {formatPickupWindow(bag.pickup_start_time, bag.pickup_end_time)}
            </Text>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          {isAvailable ? (
            <Badge
              text={`${strings.bagDetail.remaining} ${bag.quantity_available}`}
              variant="remaining"
            />
          ) : (
            <Badge text={strings.bagDetail.soldOut} variant="soldOut" />
          )}
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.bagDetail.aboutBag}</Text>
          <Text style={styles.description}>
            {bag.description ?? strings.bagDetail.whatToKnowDescription}
          </Text>
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.bagDetail.reviews}</Text>
          <View style={styles.reviewBars}>
            {reviewBars.map((bar) => (
              <View key={bar.label} style={styles.reviewBarRow}>
                <Text style={styles.reviewBarLabel}>{bar.label}</Text>
                <View style={styles.reviewBarTrack}>
                  <View
                    style={[
                      styles.reviewBarFill,
                      { width: `${bar.value * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.bagDetail.address}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.addressText}>{bag.business.address}</Text>
          </View>
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* What to know */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.bagDetail.whatToKnow}</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.infoText}>{strings.bagDetail.whatToKnowDescription}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PriceDisplay
          originalPrice={bag.original_price}
          discountedPrice={bag.discounted_price}
          size="lg"
        />
        <TouchableOpacity
          style={[
            styles.reserveButton,
            !isAvailable && styles.reserveButtonDisabled,
          ]}
          onPress={() => isAvailable && router.push(`/checkout/${bag.id}`)}
          disabled={!isAvailable}
        >
          <Text style={styles.reserveButtonText}>
            {isAvailable ? strings.bagDetail.reserve : strings.bagDetail.soldOut}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  topButtons: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  discountBadgeContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
  },
  businessSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  businessTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  businessName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bagTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  pickupSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  pickupTime: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reviewBars: {
    gap: spacing.md,
  },
  reviewBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reviewBarLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    width: 80,
  },
  reviewBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  reviewBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    ...shadows.lg,
  },
  reserveButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 160,
    alignItems: 'center',
  },
  reserveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  reserveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
