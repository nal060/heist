import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';
import { strings } from '../src/constants/strings';
import { getOrderHistory } from '../src/data';
import EmptyState from '../src/components/ui/EmptyState';
import Badge from '../src/components/ui/Badge';
import { formatCurrency } from '../src/utils/formatCurrency';
import { formatRelativeDate } from '../src/utils/formatDate';
import type { OrderWithDetails, OrderStatus } from '../src/types';

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'popular' | 'nuevo' | 'remaining' | 'soldOut'> = {
  pending: 'remaining',
  confirmed: 'nuevo',
  ready: 'nuevo',
  picked_up: 'popular',
  cancelled: 'soldOut',
  no_show: 'soldOut',
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    getOrderHistory().then(setOrders);
  }, []);

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
      <Image
        source={{ uri: item.business.photo_url ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' }}
        style={styles.orderImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.orderInfo}>
        <Text style={styles.orderBusinessName}>{item.business.name}</Text>
        <Text style={styles.orderBagTitle}>{item.bag.title}</Text>
        <View style={styles.orderMeta}>
          <Text style={styles.orderDate}>{formatRelativeDate(item.created_at)}</Text>
          <Text style={styles.orderPrice}>{formatCurrency(item.total_price)}</Text>
        </View>
        <View style={styles.orderStatusRow}>
          <Badge
            text={strings.orderHistory.status[item.status]}
            variant={STATUS_BADGE_VARIANT[item.status]}
          />
          <Text style={styles.pickupCode}>#{item.pickup_code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{strings.orderHistory.title}</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={strings.orderHistory.emptyTitle}
            subtitle={strings.orderHistory.emptySubtitle}
            actionLabel={strings.profile.startExploring}
            onAction={() => router.replace('/(tabs)/')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
  listContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  orderImage: {
    width: 100,
    height: 120,
  },
  orderInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  orderBusinessName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderBagTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  orderDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  orderPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  orderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  pickupCode: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
});
