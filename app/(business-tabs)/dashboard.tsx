import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import {
  getBusinessDashboard,
  updateBagStatus,
  type DashboardOrder,
  type DashboardBag,
} from '../../src/data/business';
import type { OrderStatus, BagStatus } from '../../src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  reserved:  { label: 'Reservado',  bg: '#FFF8E1', text: '#F57F17' },
  collected: { label: 'Recogido',   bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { label: 'Cancelado',  bg: '#F5F5F5', text: '#9E9E9E' },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 17) return 'Buenas tardes';
  return 'Buenas noches';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
  if (onPress) {
    return <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ flex: 1 }}>{content}</TouchableOpacity>;
  }
  return content;
}

const BAG_STATUS_CONFIG: Record<BagStatus, { label: string; bg: string; text: string }> = {
  active:    { label: strings.businessBags.status.active,    bg: '#E8F5E9', text: '#2E7D32' },
  draft:     { label: strings.businessBags.status.draft,     bg: '#FFF8E1', text: '#F57F17' },
  sold_out:  { label: strings.businessBags.status.sold_out,  bg: '#FFF8E1', text: '#F57F17' },
  expired:   { label: strings.businessBags.status.expired,   bg: '#FFEBEE', text: '#C62828' },
  cancelled: { label: strings.businessBags.status.cancelled, bg: '#F5F5F5', text: '#9E9E9E' },
};

function OrderRow({ order }: { order: DashboardOrder }) {
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

function ActiveBagCard({ bag, onPress, onDeactivate }: { bag: DashboardBag; onPress: () => void; onDeactivate: () => void }) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const pctLeft = bag.total > 0 ? bag.available / bag.total : 0;
  const barColor =
    pctLeft > 0.5 ? '#4CAF50' : pctLeft > 0.2 ? '#FF9800' : colors.error;
  const statusCfg = BAG_STATUS_CONFIG[bag.status];

  const renderLeftActions = () => (
    <TouchableOpacity
      style={styles.deactivateAction}
      onPress={() => {
        swipeableRef.current?.close();
        onDeactivate();
      }}
    >
      <Ionicons name="pause-circle-outline" size={20} color={colors.white} />
      <Text style={styles.deactivateActionText}>{strings.bagForm.deactivate}</Text>
    </TouchableOpacity>
  );

  return (
    <ReanimatedSwipeable ref={swipeableRef} renderLeftActions={bag.status === 'active' ? renderLeftActions : undefined}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View style={styles.bagCard}>
          {bag.photoUrl && (
            <Image
              source={{ uri: bag.photoUrl }}
              style={styles.bagCardImage}
              contentFit="cover"
              transition={200}
            />
          )}
          <View style={styles.bagCardBody}>
            <View style={styles.bagCardTopRow}>
              <Text style={styles.bagTitle} numberOfLines={1}>{bag.title}</Text>
              <View style={[styles.bagStatusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.bagStatusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
              </View>
            </View>

            {(bag.scheduleDays || bag.scheduleTime) ? (
              <View style={styles.bagScheduleRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.text.tertiary} />
                <Text style={styles.bagScheduleText}>
                  {bag.scheduleDays}{bag.scheduleDays && bag.scheduleTime ? ' · ' : ''}{bag.scheduleTime}
                </Text>
              </View>
            ) : null}

            <View style={styles.bagCardBottomRow}>
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
              <Text style={styles.bagPrice}>${bag.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { businessId } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getBusinessDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();

  const load = useCallback((isRefresh = false) => {
    if (!businessId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    getBusinessDashboard(businessId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [businessId]);

  // Reload when navigating to this tab
  useFocusEffect(useCallback(() => { load(true); }, [load]));

  // Reload when tapping the already-active tab
  useEffect(() => {
    return navigation.addListener('tabPress' as any, () => {
      if (navigation.isFocused()) load(true);
    });
  }, [navigation, load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.text.tertiary} />
        <Text style={styles.errorText}>No se pudo cargar el panel</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const collectedOrders = data.recentOrders.filter((o) => o.status === 'collected');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary[500]}
          />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.businessName}>{data.businessName}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>{strings.businessDashboard.todaySummary}</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="bag-handle-outline"
            value={String(data.stats.activeBags)}
            label={strings.businessDashboard.activeBags}
            color={colors.primary[500]}
            onPress={() => router.push('/(business-tabs)/bags')}
          />
          <StatCard
            icon="receipt-outline"
            value={String(data.stats.ordersToday)}
            label={strings.businessOrders.title}
            color="#FF9800"
            onPress={() => router.push('/(business-tabs)/orders')}
          />
          <StatCard
            icon="cash-outline"
            value={`$${data.stats.revenueToday.toFixed(0)}`}
            label={strings.businessDashboard.totalEarnings}
            color="#4CAF50"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/collect')}
          >
            <Ionicons name="bag-check-outline" size={18} color={colors.white} />
            <Text style={styles.actionBtnPrimaryText}>Recoger</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Pickups */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recolecciones recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(business-tabs)/orders')}>
            <Text style={styles.seeAll}>{strings.discover.seeAll}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, shadows.sm]}>
          {collectedOrders.length === 0 ? (
            <Text style={styles.emptyText}>Sin recolecciones aún</Text>
          ) : (
            collectedOrders.map((order, idx, arr) => (
              <React.Fragment key={order.id}>
                <OrderRow order={order} />
                {idx < arr.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          )}
        </View>

        {/* Active Bags */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{strings.businessDashboard.activeBags}</Text>
          <TouchableOpacity onPress={() => router.push('/(business-tabs)/bags')}>
            <Text style={styles.seeAll}>{strings.discover.seeAll}</Text>
          </TouchableOpacity>
        </View>
        {data.activeBags.length === 0 ? (
          <View style={[styles.card, shadows.sm]}>
            <View style={styles.emptyBagsState}>
              <Ionicons name="bag-outline" size={36} color={colors.gray[300]} />
              <Text style={styles.emptyText}>{strings.businessDashboard.noBags}</Text>
              <Text style={styles.emptySubText}>{strings.businessDashboard.noBagsSubtitle}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.bagsListContainer}>
            {data.activeBags.map((bag) => (
              <ActiveBagCard
                key={bag.id}
                bag={bag}
                onPress={() => router.push(`/bag/edit/${bag.id}`)}
                onDeactivate={async () => {
                  try {
                    await updateBagStatus(bag.id, 'draft');
                    load(true);
                  } catch {}
                }}
              />
            ))}
          </View>
        )}

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

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  retryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
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

  // Active bag card
  bagsListContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  bagCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  bagCardImage: {
    width: '100%',
    height: 120,
  },
  bagCardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  bagCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bagTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  bagStatusBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  bagStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  bagScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bagScheduleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  bagCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressWrap: {
    flex: 1,
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
    color: colors.primary[500],
  },
  emptyBagsState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptySubText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  deactivateAction: {
    backgroundColor: '#FF9800',
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  deactivateActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
