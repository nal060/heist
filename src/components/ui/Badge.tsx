import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import { borderRadius } from '../../theme';

type BadgeVariant =
  | 'popular'
  | 'nuevo'
  | 'remaining'
  | 'soldOut'
  | 'category'
  | 'discount';

interface BadgeProps {
  text: string;
  variant: BadgeVariant;
}

function getVariantStyles(variant: BadgeVariant): {
  container: ViewStyle;
  text: TextStyle;
} {
  switch (variant) {
    case 'popular':
      return {
        container: { backgroundColor: colors.badge.popular.bg },
        text: { color: colors.badge.popular.text },
      };
    case 'nuevo':
      return {
        container: { backgroundColor: colors.badge.nuevo.bg },
        text: { color: colors.badge.nuevo.text },
      };
    case 'remaining':
      return {
        container: { backgroundColor: colors.badge.remaining.bg },
        text: { color: colors.badge.remaining.text },
      };
    case 'soldOut':
      return {
        container: { backgroundColor: colors.badge.soldOut.bg },
        text: { color: colors.badge.soldOut.text },
      };
    case 'category':
      return {
        container: { backgroundColor: colors.gray[100] },
        text: { color: colors.text.secondary },
      };
    case 'discount':
      return {
        container: { backgroundColor: colors.primary[500] },
        text: { color: colors.text.inverse },
      };
  }
}

export default function Badge({ text, variant }: BadgeProps) {
  const variantStyle = getVariantStyles(variant);

  return (
    <View style={[styles.container, variantStyle.container]}>
      <Text style={[styles.text, variantStyle.text]}>
        {variant === 'discount' ? `-${text}%` : text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.xs * typography.lineHeight.tight,
  },
});
