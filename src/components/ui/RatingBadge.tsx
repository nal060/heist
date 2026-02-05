import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
}

export default function RatingBadge({ rating, reviewCount }: RatingBadgeProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="star" size={14} color="#F9A825" />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reviewCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },
});
