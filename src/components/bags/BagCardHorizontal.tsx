import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import { shadows, borderRadius } from '../../theme';
import { getDiscountPercentage } from '../../utils/formatCurrency';
import { formatPickupWindow } from '../../utils/formatTime';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';
import type { BagWithBusiness } from '../../types';

interface BagCardHorizontalProps {
  bag: BagWithBusiness;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const CARD_WIDTH = 280;
const IMAGE_HEIGHT = 160;

export default function BagCardHorizontal({
  bag,
  onPress,
  onToggleFavorite,
}: BagCardHorizontalProps) {
  const discount = getDiscountPercentage(bag.original_price, bag.discounted_price);
  const pickupWindow = formatPickupWindow(bag.pickup_start_time, bag.pickup_end_time);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${bag.title} de ${bag.business.name}`}
    >
      {/* Hero image */}
      <View style={styles.imageContainer}>
        {bag.business?.photo_url ? (
          <Image
            source={{ uri: bag.business.photo_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={40} color={colors.gray[300]} />
          </View>
        )}

        {/* Gradient overlay for better readability of overlaid elements */}
        <View style={styles.imageOverlay} />

        {/* Discount badge - top left */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Badge text={String(discount)} variant="discount" />
          </View>
        )}

        {/* Heart icon - top right */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={onToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={bag.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <View style={styles.heartCircle}>
            <Ionicons
              name={bag.isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={bag.isFavorite ? colors.primary[500] : colors.white}
            />
          </View>
        </TouchableOpacity>

        {/* Remaining count */}
        {bag.quantity_available <= 3 && bag.quantity_available > 0 && (
          <View style={styles.remainingBadge}>
            <Badge text={`Quedan ${bag.quantity_available}`} variant="remaining" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.businessName} numberOfLines={1}>
          {bag.business.name}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {bag.title}
        </Text>
        <View style={styles.pickupRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.pickupText}>{pickupWindow}</Text>
        </View>
        <PriceDisplay
          originalPrice={bag.original_price}
          discountedPrice={bag.discounted_price}
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...(shadows.md as ViewStyle),
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  businessName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pickupText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },
});
