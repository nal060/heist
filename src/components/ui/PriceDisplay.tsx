import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import { formatCurrency } from '../../utils/formatCurrency';

type PriceSize = 'sm' | 'md' | 'lg';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  size?: PriceSize;
}

const ORIGINAL_FONT_SIZE: Record<PriceSize, number> = {
  sm: typography.fontSize.xs,
  md: typography.fontSize.sm,
  lg: typography.fontSize.base,
};

const DISCOUNTED_FONT_SIZE: Record<PriceSize, number> = {
  sm: typography.fontSize.sm,
  md: typography.fontSize.base,
  lg: typography.fontSize.lg,
};

const GAP: Record<PriceSize, number> = {
  sm: spacing.xs,
  md: spacing.sm,
  lg: spacing.sm,
};

export default function PriceDisplay({
  originalPrice,
  discountedPrice,
  size = 'md',
}: PriceDisplayProps) {
  const originalStyle: TextStyle = {
    fontSize: ORIGINAL_FONT_SIZE[size],
  };

  const discountedStyle: TextStyle = {
    fontSize: DISCOUNTED_FONT_SIZE[size],
  };

  return (
    <View style={[styles.container, { gap: GAP[size] }]}>
      <Text style={[styles.originalPrice, originalStyle]}>
        {formatCurrency(originalPrice)}
      </Text>
      <Text style={[styles.discountedPrice, discountedStyle]}>
        {formatCurrency(discountedPrice)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: typography.fontWeight.regular,
  },
  discountedPrice: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
});
