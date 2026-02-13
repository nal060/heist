import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getBagById } from '../../src/data';
import ErrorState from '../../src/components/ui/ErrorState';
import BusinessLogo from '../../src/components/business/BusinessLogo';
import Divider from '../../src/components/ui/Divider';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { formatPickupWindow, getPickupLabel } from '../../src/utils/formatTime';
import type { BagWithBusiness } from '../../src/types';

export default function CheckoutScreen() {
  const { bagId } = useLocalSearchParams<{ bagId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [bag, setBag] = useState<BagWithBusiness | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadBag = useCallback(() => {
    setLoading(true);
    setError(false);
    getBagById(bagId)
      .then((data) => setBag(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bagId]);

  useEffect(() => {
    loadBag();
  }, [loadBag]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorState onRetry={loadBag} />
      </View>
    );
  }

  if (!bag) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{strings.common.bagNotFound}</Text>
      </View>
    );
  }

  const subtotal = bag.discounted_price * quantity;
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const handlePay = () => {
    const orderId = `order-${Date.now()}`;
    router.replace(`/order-confirmation/${orderId}`);
  };

  const maxQuantity = Math.min(bag.quantity_available, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{strings.checkout.title}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business & Bag Info */}
        <View style={styles.card}>
          <View style={styles.businessRow}>
            <BusinessLogo
              imageUrl={bag.business.photo_url}
              name={bag.business.name}
              size="md"
            />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{bag.business.name}</Text>
              <Text style={styles.bagTitle}>{bag.title}</Text>
            </View>
          </View>

          <View style={styles.pickupRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary[500]} />
            <Text style={styles.pickupText}>
              {strings.checkout.pickupWindow}: {getPickupLabel(bag.date)} · {formatPickupWindow(bag.pickup_start_time, bag.pickup_end_time)}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.quantity}</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? colors.gray[400] : colors.primary[500]}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= maxQuantity ? colors.gray[400] : colors.primary[500]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.paymentMethod}</Text>
          <TouchableOpacity style={styles.paymentMethodRow}>
            <View style={styles.paymentIconContainer}>
              <Ionicons name="card-outline" size={20} color={colors.primary[500]} />
            </View>
            <Text style={styles.paymentMethodText}>{strings.checkout.creditCard}</Text>
            <Text style={styles.paymentMethodDetail}>•••• 4242</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.orderSummary}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.checkout.subtotal}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.checkout.tax} (ITBMS 7%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>
          <Divider marginVertical={spacing.md} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{strings.checkout.total}</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>
            {strings.checkout.pay} {formatCurrency(total)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  bagTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pickupText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    borderColor: colors.gray[300],
  },
  quantityText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  paymentMethodDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  payButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
