import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface BagSummaryCardProps {
  title: string;
  quantity?: string;
  quantityLabel?: string;
  price: string;
  originalPrice: string;
  extraDetail?: string;
  centered?: boolean;
}

export default function BagSummaryCard({
  title,
  quantity,
  quantityLabel,
  price,
  originalPrice,
  extraDetail,
  centered = false,
}: BagSummaryCardProps) {
  return (
    <View style={[styles.card, centered && styles.cardCentered]}>
      <Text style={styles.title}>{title}</Text>
      {quantity && quantityLabel && (
        <Text style={styles.detail}>{quantity} {quantityLabel}</Text>
      )}
      <View style={styles.priceRow}>
        <Text style={styles.price}>USD {price}</Text>
        <Text style={styles.originalPrice}>USD {originalPrice}</Text>
      </View>
      {extraDetail && <Text style={styles.detail}>{extraDetail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
