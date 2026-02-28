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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import type { BagStatus } from '../../src/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type MockBag = {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  quantityTotal: number;
  quantityAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  date: string;
  status: BagStatus;
};

const MOCK_BAGS: MockBag[] = [
  {
    id: 'bag-001',
    title: 'Caja Sorpresa de Panadería',
    originalPrice: 18.0,
    discountedPrice: 9.99,
    quantityTotal: 5,
    quantityAvailable: 2,
    pickupStart: '5:00 PM',
    pickupEnd: '6:00 PM',
    date: 'Hoy',
    status: 'active',
  },
  {
    id: 'bag-002',
    title: 'Bolsa Misteriosa de Sushi',
    originalPrice: 28.0,
    discountedPrice: 12.99,
    quantityTotal: 3,
    quantityAvailable: 1,
    pickupStart: '6:00 PM',
    pickupEnd: '7:00 PM',
    date: 'Hoy',
    status: 'active',
  },
  {
    id: 'bag-003',
    title: 'Especial de Pasta',
    originalPrice: 15.0,
    discountedPrice: 7.99,
    quantityTotal: 4,
    quantityAvailable: 0,
    pickupStart: '5:00 PM',
    pickupEnd: '6:00 PM',
    date: 'Hoy',
    status: 'sold_out',
  },
  {
    id: 'bag-004',
    title: 'Caja de Repostería de Ayer',
    originalPrice: 14.0,
    discountedPrice: 6.99,
    quantityTotal: 3,
    quantityAvailable: 0,
    pickupStart: '4:00 PM',
    pickupEnd: '5:00 PM',
    date: 'Ayer',
    status: 'expired',
  },
  {
    id: 'bag-005',
    title: 'Caja de Repostería de Ayer',
    originalPrice: 14.0,
    discountedPrice: 6.99,
    quantityTotal: 3,
    quantityAvailable: 0,
    pickupStart: '4:00 PM',
    pickupEnd: '5:00 PM',
    date: 'Ayer',
    status: 'cancelled',
  },
];

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'active' | 'sold_out' | 'expired' | 'cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activos' },
  { key: 'sold_out',  label: 'Agotados' },
  { key: 'expired',   label: 'Expirados' },
  { key: 'cancelled', label: 'Cancelados' },
];

const STATUS_CONFIG: Record<BagStatus, { label: string; bg: string; text: string }> = {
  active:    { label: 'Activo',    bg: '#E8F5E9', text: '#2E7D32' },
  draft:     { label: 'Borrador',  bg: '#F5F5F5', text: '#757575' },
  sold_out:  { label: 'Agotado',   bg: '#FFF8E1', text: '#F57F17' },
  expired:   { label: 'Expirado',  bg: '#FFEBEE', text: '#C62828' },
  cancelled: { label: 'Cancelado', bg: '#F5F5F5', text: '#9E9E9E' },
};

// ─── Bag Card ─────────────────────────────────────────────────────────────────

function BagCard({
  bag,
  onCancel,
  onRelist,
}: {
  bag: MockBag;
  onCancel: (id: string) => void;
  onRelist: (bag: MockBag) => void;
}) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const cfg = STATUS_CONFIG[bag.status];
  const discountPct = Math.round((1 - bag.discountedPrice / bag.originalPrice) * 100);
  const isAvailable = bag.quantityAvailable > 0;
  const isRelistable = bag.status === 'expired' || bag.status === 'cancelled' || bag.status === 'sold_out';

  const renderLeftActions = () => (
    <TouchableOpacity
      style={styles.cancelAction}
      onPress={() => {
        swipeableRef.current?.close();
        onCancel(bag.id);
      }}
    >
      <Ionicons name="close-circle-outline" size={20} color={colors.white} />
      <Text style={styles.cancelActionText}>Cancelar</Text>
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.relistAction}
      onPress={() => {
        swipeableRef.current?.close();
        onRelist(bag);
      }}
    >
      <Ionicons name="refresh-outline" size={20} color={colors.white} />
      <Text style={styles.relistActionText}>Volver a publicar</Text>
    </TouchableOpacity>
  );

  const card = (
    <View style={[styles.bagCard, shadows.sm]}>
      {/* Title + status */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle} numberOfLines={1}>{bag.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Pricing + quantity */}
      <View style={styles.cardMidRow}>
        <View style={styles.priceGroup}>
          <Text style={styles.discountedPrice}>${bag.discountedPrice.toFixed(2)}</Text>
          <Text style={styles.originalPrice}>${bag.originalPrice.toFixed(2)}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        </View>
        <View style={styles.qtyGroup}>
          <Ionicons
            name="people-outline"
            size={14}
            color={isAvailable ? colors.text.secondary : colors.error}
          />
          <Text style={[styles.qtyText, !isAvailable && styles.qtyEmpty]}>
            {bag.quantityAvailable}/{bag.quantityTotal}
          </Text>
        </View>
      </View>

      {/* Pickup */}
      <View style={styles.cardBottomRow}>
        <View style={styles.pickupInfo}>
          <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
          <Text style={styles.pickupText}>
            {bag.date} · {bag.pickupStart}–{bag.pickupEnd}
          </Text>
        </View>
      </View>
    </View>
  );

  if (bag.status === 'active') {
    return (
      <ReanimatedSwipeable ref={swipeableRef} renderLeftActions={renderLeftActions}>
        {card}
      </ReanimatedSwipeable>
    );
  }

  if (bag.status === 'sold_out') {
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

  if (isRelistable) {
    return (
      <ReanimatedSwipeable ref={swipeableRef} renderRightActions={renderRightActions}>
        {card}
      </ReanimatedSwipeable>
    );
  }

  return card;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterKey }) {
  const messages: Record<FilterKey, string> = {
    all:       "Aún no has creado ninguna bolsa.",
    active:    'No hay bolsas activas en este momento.',
    sold_out:  'No hay bolsas agotadas.',
    expired:   'No hay bolsas vencidas.',
    cancelled: 'No hay maletas canceladas.',
  };
  return (
    <View style={styles.emptyState}>
      <Ionicons name="bag-outline" size={48} color={colors.gray[300]} />
      <Text style={styles.emptyText}>{messages[filter]}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BagsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [bags, setBags] = useState(MOCK_BAGS);

  const filtered = bags.filter(
    (b) => activeFilter === 'all' || b.status === activeFilter
  );

  const handleCreate = () => router.push('/bag/create' as any);
  const handleCancel = (id: string) => setBags((prev) => prev.filter((b) => b.id !== id));
  const handleRelist = (bag: MockBag) =>
    router.push({
      pathname: '/bag/create',
      params: {
        title: bag.title,
        originalPrice: String(bag.originalPrice),
        discountedPrice: String(bag.discountedPrice),
        quantityTotal: String(bag.quantityTotal),
        pickupStartLabel: bag.pickupStart,
        pickupEndLabel: bag.pickupEnd,
      },
    } as any);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Bolsos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

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
                ? bags.length
                : bags.filter((b) => b.status === f.key).length;
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

      {/* Bag list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <BagCard bag={item} onCancel={handleCancel} onRelist={handleRelist} />}
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
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
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

  // Bag card
  bagCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitleWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
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

  // Pricing
  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  discountedPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  qtyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  qtyEmpty: {
    color: colors.error,
  },

  // Bottom row
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickupText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // Re-list swipe action
  relistAction: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  relistActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },

  // Cancel swipe action
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
