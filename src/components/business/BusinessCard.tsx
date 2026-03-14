import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows, borderRadius } from '../../theme';
import { strings } from '../../constants/strings';
import RatingBadge from '../ui/RatingBadge';
import Badge from '../ui/Badge';
import type { BusinessWithBags } from '../../types';

interface BusinessCardProps {
  business: BusinessWithBags;
  onPress: () => void;
  onRemoveFavorite: () => void;
}

const IMAGE_SIZE = 120;

export default function BusinessCard({ business, onPress, onRemoveFavorite }: BusinessCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrapper}>
        {business.photo_url ? (
          <Image source={{ uri: business.photo_url }} style={styles.image} contentFit="cover" transition={300} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="storefront-outline" size={32} color={colors.gray[300]} />
          </View>
        )}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={onRemoveFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Quitar de favoritos"
        >
          <Ionicons name="heart" size={20} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
        <RatingBadge rating={business.rating} reviewCount={business.total_reviews} />
        <Badge
          text={`${business.activeBagCount} ${strings.consumerBusinessProfile.activeBags}`}
          variant="category"
        />
        <Text style={styles.address} numberOfLines={1}>{business.address}</Text>
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
    justifyContent: 'center',
    gap: spacing.xs,
  },
  businessName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  address: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
