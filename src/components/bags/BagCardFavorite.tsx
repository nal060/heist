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
import { formatPickupWindow, getPickupLabel } from '../../utils/formatTime';
import PriceDisplay from '../ui/PriceDisplay';
import RatingBadge from '../ui/RatingBadge';
import Badge from '../ui/Badge';
import type { BagWithBusiness } from '../../types';

interface BagCardFavoriteProps {
  bag: BagWithBusiness;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const IMAGE_SIZE = 120;

export default function BagCardFavorite({
  bag,
  onPress,
  onToggleFavorite,
}: BagCardFavoriteProps) {
  const primaryPhoto = bag.photos.find((p) => p.is_primary) ?? bag.photos[0];
  const pickupWindow = formatPickupWindow(bag.pickup_start_time, bag.pickup_end_time);
  const dayLabel = getPickupLabel(bag.date);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${bag.title} de ${bag.business.name} (favorito)`}
    >
      {/* Image */}
      <View style={styles.imageWrapper}>
        {primaryPhoto ? (
          <Image
            source={{ uri: primaryPhoto.photo_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={32} color={colors.gray[300]} />
          </View>
        )}

        {/* Heart icon - always filled red */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={onToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Quitar de favoritos"
        >
          <Ionicons
            name="heart"
            size={20}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.businessName} numberOfLines={1}>
          {bag.business.name}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {bag.title}
        </Text>

        {/* Pickup info */}
        <View style={styles.pickupRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.pickupText}>{pickupWindow}</Text>
          <Badge text={dayLabel} variant="category" />
        </View>

        {/* Rating */}
        <View style={styles.metaRow}>
          <RatingBadge
            rating={bag.business.rating}
            reviewCount={bag.business.total_reviews}
          />
        </View>

        {/* Price */}
        <PriceDisplay
          originalPrice={bag.original_price}
          discountedPrice={bag.discounted_price}
          size="md"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    padding: spacing.md,
    ...(shadows.md as ViewStyle),
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
  heartButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
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
    marginTop: 2,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pickupText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
