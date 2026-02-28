import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import type { BagStatus } from '../../src/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type MockBag = {
  id: string;
  title: string;
  category: string;
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
    title: 'Bakery Surprise Box',
    category: 'Bakery',
    originalPrice: 18.0,
    discountedPrice: 9.99,
    quantityTotal: 5,
    quantityAvailable: 2,
    pickupStart: '5:00 PM',
    pickupEnd: '6:00 PM',
    date: 'Today',
    status: 'active',
  },
  {
    id: 'bag-002',
    title: 'Sushi Mystery Bag',
    category: 'Japanese',
    originalPrice: 28.0,
    discountedPrice: 12.99,
    quantityTotal: 3,
    quantityAvailable: 1,
    pickupStart: '6:00 PM',
    pickupEnd: '7:00 PM',
    date: 'Today',
    status: 'active',
  },
  {
    id: 'bag-003',
    title: 'Pasta Special',
    category: 'Italian',
    originalPrice: 15.0,
    discountedPrice: 7.99,
    quantityTotal: 4,
    quantityAvailable: 0,
    pickupStart: '5:00 PM',
    pickupEnd: '6:00 PM',
    date: 'Today',
    status: 'sold_out',
  },
  {
    id: 'bag-004',
    title: 'Weekend Brunch Bag',
    category: 'Brunch',
    originalPrice: 22.0,
    discountedPrice: 11.99,
    quantityTotal: 6,
    quantityAvailable: 6,
    pickupStart: '11:00 AM',
    pickupEnd: '12:00 PM',
    date: 'Tomorrow',
    status: 'draft',
  },
  {
    id: 'bag-005',
    title: 'Sandwich Variety Pack',
    category: 'Deli',
    originalPrice: 16.0,
    discountedPrice: 8.49,
    quantityTotal: 4,
    quantityAvailable: 4,
    pickupStart: '1:00 PM',
    pickupEnd: '2:00 PM',
    date: 'Tomorrow',
    status: 'draft',
  },
  {
    id: 'bag-006',
    title: "Yesterday's Pastry Box",
    category: 'Bakery',
    originalPrice: 14.0,
    discountedPrice: 6.99,
    quantityTotal: 3,
    quantityAvailable: 0,
    pickupStart: '4:00 PM',
    pickupEnd: '5:00 PM',
    date: 'Yesterday',
    status: 'expired',
  },
];

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'active' | 'draft' | 'sold_out';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'sold_out', label: 'Sold Out' },
];

const STATUS_CONFIG: Record<BagStatus, { label: string; bg: string; text: string }> = {
  active:    { label: 'Active',    bg: '#E8F5E9', text: '#2E7D32' },
  draft:     { label: 'Draft',     bg: '#F5F5F5', text: '#757575' },
  sold_out:  { label: 'Sold Out',  bg: '#FFF8E1', text: '#F57F17' },
  expired:   { label: 'Expired',   bg: '#FFEBEE', text: '#C62828' },
  cancelled: { label: 'Cancelled', bg: '#F5F5F5', text: '#9E9E9E' },
};

// ─── Bag Card ─────────────────────────────────────────────────────────────────

function BagCard({ bag, onEdit }: { bag: MockBag; onEdit: (id: string) => void }) {
  const cfg = STATUS_CONFIG[bag.status];
  const discountPct = Math.round((1 - bag.discountedPrice / bag.originalPrice) * 100);
  const isAvailable = bag.quantityAvailable > 0;

  return (
    <TouchableOpacity
      style={[styles.bagCard, shadows.sm]}
      onPress={() => onEdit(bag.id)}
      activeOpacity={0.85}
    >
      {/* Title + status */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle} numberOfLines={1}>{bag.title}</Text>
          <Text style={styles.cardCategory}>{bag.category}</Text>
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

      {/* Pickup + edit */}
      <View style={styles.cardBottomRow}>
        <View style={styles.pickupInfo}>
          <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
          <Text style={styles.pickupText}>
            {bag.date} · {bag.pickupStart}–{bag.pickupEnd}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(bag.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil-outline" size={14} color={colors.primary[500]} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterKey }) {
  const messages: Record<FilterKey, string> = {
    all:      "You haven't created any bags yet.",
    active:   'No active bags right now.',
    draft:    'No drafts saved.',
    sold_out: 'No sold out bags.',
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

  const filtered = MOCK_BAGS.filter(
    (b) => activeFilter === 'all' || b.status === activeFilter
  );

  const handleEdit = (id: string) => router.push(`/bag/edit/${id}` as any);
  const handleCreate = () => router.push('/bag/create' as any);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bags</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter bar — wrapper View holds the background/border, not the ScrollView content */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? MOCK_BAGS.length
                : MOCK_BAGS.filter((b) => b.status === f.key).length;
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
        renderItem={({ item }) => <BagCard bag={item} onEdit={handleEdit} />}
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
  cardCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
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
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  pickupText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
  },
  editBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
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
