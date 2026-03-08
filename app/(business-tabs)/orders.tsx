import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/theme';
import { sharedStyles } from '../../src/styles/shared';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import ErrorState from '../../src/components/ui/ErrorState';
import EmptyState from '../../src/components/ui/EmptyState';
import Badge from '../../src/components/ui/Badge';

interface BusinessOrder {
  id: string;
  quantity: number;
  total_price: number;
  pickup_code: string;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: string;
  created_at: string;
  surplus_bags: { title: string };
}

const STATUS_VARIANT: Record<string, 'popular' | 'nuevo' | 'remaining' | 'soldOut'> = {
  reserved: 'remaining',
  collected: 'popular',
  cancelled: 'soldOut',
};

export default function BusinessOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!business) throw new Error('Negocio no encontrado');

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, quantity, total_price, pickup_code, pickup_date, pickup_start_time, pickup_end_time, status, created_at, surplus_bags(title)')
        .eq('surplus_bags.business_id', business.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);
      setOrders((data as unknown as BusinessOrder[]) || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrder = ({ item }: { item: BusinessOrder }) => {
    const statusLabel = strings.businessOrders.status[item.status as keyof typeof strings.businessOrders.status] || item.status;
    const variant = STATUS_VARIANT[item.status] || 'soldOut';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle} numberOfLines={1}>
            {item.surplus_bags?.title || 'Pedido'}
          </Text>
          <Badge text={statusLabel} variant={variant} />
        </View>
        <View style={styles.orderDetails}>
          <Text style={styles.orderCode}>#{item.pickup_code}</Text>
          <Text style={styles.orderPrice}>${item.total_price.toFixed(2)}</Text>
        </View>
        <Text style={styles.orderTime}>
          {item.pickup_date} | {item.pickup_start_time.slice(0, 5)} - {item.pickup_end_time.slice(0, 5)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={loadOrders} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>{strings.businessOrders.title}</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={strings.businessOrders.emptyTitle}
            subtitle={strings.businessOrders.emptySubtitle}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.containerNoPadding,
  center: sharedStyles.center,
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  orderCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderCode: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  orderPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  orderTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
