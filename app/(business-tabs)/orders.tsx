import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import type { OrderStatus } from '../../src/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type MockOrder = {
  id: string;
  pickupCode: string;
  bagTitle: string;
  quantity: number;
  totalPrice: number;
  pickupWindow: string;
  status: OrderStatus;
  reservedAt: string;
};

const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-001',
    pickupCode: 'A1B2',
    bagTitle: 'Bakery Surprise Box',
    quantity: 1,
    totalPrice: 9.99,
    pickupWindow: '5:00–6:00 PM',
    status: 'reserved',
    reservedAt: '2 min ago',
  },
  {
    id: 'ord-002',
    pickupCode: 'C3D4',
    bagTitle: 'Sushi Mystery Bag',
    quantity: 2,
    totalPrice: 25.98,
    pickupWindow: '6:00–7:00 PM',
    status: 'reserved',
    reservedAt: '15 min ago',
  },
  {
    id: 'ord-003',
    pickupCode: 'E5F6',
    bagTitle: 'Pasta Special',
    quantity: 1,
    totalPrice: 7.99,
    pickupWindow: '5:00–6:00 PM',
    status: 'collected',
    reservedAt: '1 hr ago',
  },
  {
    id: 'ord-004',
    pickupCode: 'G7H8',
    bagTitle: 'Bakery Surprise Box',
    quantity: 1,
    totalPrice: 9.99,
    pickupWindow: '5:00–6:00 PM',
    status: 'collected',
    reservedAt: '2 hr ago',
  },
  {
    id: 'ord-005',
    pickupCode: 'I9J0',
    bagTitle: 'Sushi Mystery Bag',
    quantity: 1,
    totalPrice: 12.99,
    pickupWindow: '6:00–7:00 PM',
    status: 'cancelled',
    reservedAt: '3 hr ago',
  },
];

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = 'all' | OrderStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todo' },
  { key: 'reserved',  label: 'Reservado' },
  { key: 'collected', label: 'Coleccionado' },
  { key: 'cancelled', label: 'Cancelado' },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  reserved:  { label: 'Reservado',  bg: '#FFF8E1', text: '#F57F17' },
  collected: { label: 'Coleccionado', bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { label: 'Cancelado', bg: '#F5F5F5', text: '#9E9E9E' },
};

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onCancel,
  onCollect,
}: {
  order: MockOrder;
  onCancel: (id: string) => void;
  onCollect: (id: string) => void;
}) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const cfg = STATUS_CONFIG[order.status];

  const renderLeftActions = () => (
    <TouchableOpacity
      style={styles.cancelAction}
      onPress={() => {
        swipeableRef.current?.close();
        onCancel(order.id);
      }}
    >
      <Ionicons name="close-circle-outline" size={20} color={colors.white} />
      <Text style={styles.cancelActionText}>Cancelar</Text>
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.collectAction}
      onPress={() => {
        swipeableRef.current?.close();
        onCollect(order.id);
      }}
    >
      <Ionicons name="bag-check-outline" size={20} color={colors.white} />
      <Text style={styles.collectActionText}>Coleccionado</Text>
    </TouchableOpacity>
  );

  const card = (
    <View style={[styles.card, shadows.sm]}>
      {/* Top row: code + status */}
      <View style={styles.cardTop}>
        <View style={styles.codeWrap}>
          <Text style={styles.codeLabel}>CÓDIGO</Text>
          <Text style={styles.codeValue}>{order.pickupCode}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Bag info */}
      <Text style={styles.bagTitle} numberOfLines={1}>
        {order.bagTitle}
        <Text style={styles.qty}> × {order.quantity}</Text>
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={13} color={colors.text.tertiary} />
          <Text style={styles.metaText}>${order.totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
          <Text style={styles.metaText}>{order.pickupWindow}</Text>
        </View>
        <View style={styles.metaDot} />
        <Text style={styles.metaText}>{order.reservedAt}</Text>
      </View>
    </View>
  );

  if (order.status === 'reserved') {
    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
      >
        {card}
      </ReanimatedSwipeable>
    );
  }

  return card;
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ orders }: { orders: MockOrder[] }) {
  const reserved = orders.filter((o) => o.status === 'reserved').length;
  const collected = orders.filter((o) => o.status === 'collected').length;
  const revenue = orders
    .filter((o) => o.status === 'collected')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{reserved}</Text>
        <Text style={styles.summaryLabel}>Reservado</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, collected > 0 && styles.summaryValueGreen]}>
          {collected}
        </Text>
        <Text style={styles.summaryLabel}>Coleccionado</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>${revenue.toFixed(2)}</Text>
        <Text style={styles.summaryLabel}>Ingresos</Text>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterKey }) {
  const messages: Record<FilterKey, string> = {
    all:       'Aún no hay pedidos hoy.',
    reserved:  'No hay pedidos reservados en este momento.',
    collected: 'Aún no hay pedidos recogidos.',
    cancelled: 'No hay pedidos cancelados.',
  };
  return (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={48} color={colors.gray[300]} />
      <Text style={styles.emptyText}>{messages[filter]}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const filtered = orders.filter(
    (o) => activeFilter === 'all' || o.status === activeFilter
  );

  const handleCancel = (id: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' as OrderStatus } : o))
    );

  const handleCollect = (id: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'collected' as OrderStatus } : o))
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <Text style={styles.headerDate}>Hoy</Text>
      </View>

      {/* Summary bar */}
      <SummaryBar orders={orders} />

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? orders.length
                : orders.filter((o) => o.status === f.key).length;
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={styles.filterCountText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard order={item} onCancel={handleCancel} onCollect={handleCollect} />
        )}
        ListEmptyComponent={<EmptyState filter={activeFilter} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerDate: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summaryValueGreen: {
    color: '#2E7D32',
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.xs,
  },

  // Filter bar
  filterBar: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterPillActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterLabelActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  filterCount: {
    backgroundColor: colors.gray[400],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountActive: {
    backgroundColor: colors.primary[500],
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },

  // Order card
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  codeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  statusBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  bagTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  qty: {
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.gray[300],
  },

  // Swipe actions
  cancelAction: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  cancelActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  collectAction: {
    backgroundColor: '#2E7D32',
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  collectActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
