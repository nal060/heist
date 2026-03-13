import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getOrderById } from '../../src/data';
import { formatPickupWindow } from '../../src/utils/formatTime';
import Button from '../../src/components/ui/Button';
import type { OrderWithDetails } from '../../src/types';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{strings.orderConfirmation.title}</Text>
        <Text style={styles.subtitle}>{strings.orderConfirmation.subtitle}</Text>

        {/* Pickup Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{strings.orderConfirmation.pickupCode}</Text>
          <Text style={styles.codeValue}>{order?.pickup_code ?? '------'}</Text>
        </View>

        {/* Order details */}
        {order && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailBusiness}>{order.business?.name}</Text>
            <Text style={styles.detailBag}>{order.bag?.title}</Text>
            {order.pickup_start_time && order.pickup_end_time && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.primary[500]} />
                <Text style={styles.detailText}>
                  {formatPickupWindow(order.pickup_start_time, order.pickup_end_time)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.reminderText}>
            {strings.orderConfirmation.pickupReminder}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          label={strings.orderConfirmation.viewOrders}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.replace('/order-history')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          label={strings.orderConfirmation.keepExploring}
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.replace('/(tabs)/')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  codeCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  codeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  detailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
    gap: spacing.xs,
  },
  detailBusiness: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailBag: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  reminderText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  buttons: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  buttonSpacer: {
    height: spacing.md,
  },
});
