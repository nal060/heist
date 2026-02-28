import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DEMO_BUSINESS_NAME = 'Demo Business';

const MOCK_STATS = {
  activeBags: 3,
  ordersToday: 7,
  revenueToday: 84.5,
};

const MOCK_RECENT_ORDERS = [
  {
    id: 'ord-001',
    pickupCode: 'A1B2',
    bagTitle: 'Bakery Surprise Box',
    quantity: 1,
    totalPrice: 9.99,
    pickupWindow: '5:00 PM – 6:00 PM',
    status: 'reserved' as const,
    reservedAt: '2 min ago',
  },
  {
    id: 'ord-002',
    pickupCode: 'C3D4',
    bagTitle: 'Sushi Mystery Bag',
    quantity: 2,
    totalPrice: 25.98,
    pickupWindow: '6:00 PM – 7:00 PM',
    status: 'reserved' as const,
    reservedAt: '15 min ago',
  },
  {
    id: 'ord-003',
    pickupCode: 'E5F6',
    bagTitle: 'Pasta Special',
    quantity: 1,
    totalPrice: 7.99,
    pickupWindow: '5:00 PM – 6:00 PM',
    status: 'collected' as const,
    reservedAt: '34 min ago',
  },
  {
    id: 'ord-004',
    pickupCode: 'G7H8',
    bagTitle: 'Bakery Surprise Box',
    quantity: 1,
    totalPrice: 9.99,
    pickupWindow: '4:00 PM – 5:00 PM',
    status: 'collected' as const,
    reservedAt: '1 hr ago',
  },
];

const MOCK_ACTIVE_BAGS = [
  { id: 'bag-001', title: 'Bakery Surprise Box', available: 2, total: 5, price: 9.99 },
  { id: 'bag-002', title: 'Sushi Mystery Bag', available: 1, total: 3, price: 12.99 },
  { id: 'bag-003', title: 'Pasta Special', available: 4, total: 4, price: 7.99 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type OrderStatus = 'reserved' | 'collected' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  reserved:  { label: 'Reserved',  bg: '#FFF8E1', text: '#F57F17' },
  collected: { label: 'Collected', bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { label: 'Cancelled', bg: '#F5F5F5', text: '#9E9E9E' },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OrderRow({ order }: { order: (typeof MOCK_RECENT_ORDERS)[0] }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderLeft}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{order.pickupCode}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={1}>
            {order.bagTitle}
          </Text>
          <Text style={styles.orderMeta}>
            {order.quantity}x · {order.pickupWindow}
          </Text>
        </View>
      </View>
      <View style={styles.orderRight}>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.orderPrice}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
}

function ActiveBagRow({ bag }: { bag: (typeof MOCK_ACTIVE_BAGS)[0] }) {
  const pctLeft = bag.available / bag.total;
  const barColor =
    pctLeft > 0.5 ? '#4CAF50' : pctLeft > 0.2 ? '#FF9800' : colors.error;

  return (
    <View style={styles.bagRow}>
      <View style={styles.bagInfo}>
        <Text style={styles.bagTitle} numberOfLines={1}>
          {bag.title}
        </Text>
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${pctLeft * 100}%`, backgroundColor: barColor }]}
            />
          </View>
          <Text style={styles.bagAvailText}>
            {bag.available}/{bag.total}
          </Text>
        </View>
      </View>
      <Text style={styles.bagPrice}>${bag.price.toFixed(2)}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.businessName}>{DEMO_BUSINESS_NAME}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="bag-handle-outline"
            value={String(MOCK_STATS.activeBags)}
            label="Active Bags"
            color={colors.primary[500]}
          />
          <StatCard
            icon="receipt-outline"
            value={String(MOCK_STATS.ordersToday)}
            label="Orders Today"
            color="#FF9800"
          />
          <StatCard
            icon="cash-outline"
            value={`$${MOCK_STATS.revenueToday.toFixed(0)}`}
            label="Revenue"
            color="#4CAF50"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/bag/create')}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.white} />
            <Text style={styles.actionBtnPrimaryText}>Add Bag</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => router.push('/(business-tabs)/orders')}
          >
            <Ionicons name="list-outline" size={18} color={colors.primary[500]} />
            <Text style={styles.actionBtnSecondaryText}>View Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Pickups */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Pickups</Text>
          <TouchableOpacity onPress={() => router.push('/(business-tabs)/orders')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, shadows.sm]}>
          {MOCK_RECENT_ORDERS.filter((o) => o.status === 'collected').map((order, idx, arr) => (
            <React.Fragment key={order.id}>
              <OrderRow order={order} />
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Active Bags */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Bags</Text>
          <TouchableOpacity onPress={() => router.push('/(business-tabs)/bags')}>
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, shadows.sm]}>
          {MOCK_ACTIVE_BAGS.map((bag, idx) => (
            <React.Fragment key={bag.id}>
              <ActiveBagRow bag={bag} />
              {idx < MOCK_ACTIVE_BAGS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background.primary,
  },
  greeting: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.regular,
  },
  businessName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary[500],
  },
  actionBtnPrimaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  actionBtnSecondary: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  actionBtnSecondaryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },

  // Card wrapper
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
  },

  // Order row
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  codeBox: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  codeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  orderMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  orderPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Active bag row
  bagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bagInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },
  bagTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  bagAvailText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    minWidth: 28,
  },
  bagPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
