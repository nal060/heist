import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getUser, getOrderHistory } from '../../src/data';
import Divider from '../../src/components/ui/Divider';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = getUser();
  const orders = getOrderHistory();
  const completedOrders = orders.filter((o) => o.status === 'picked_up');

  const impactStats = [
    {
      icon: 'leaf' as const,
      value: `${(completedOrders.length * 2.5).toFixed(1)} kg`,
      label: strings.profile.co2Saved,
      color: '#4CAF50',
    },
    {
      icon: 'cash' as const,
      value: `$${completedOrders.reduce((sum, o) => sum + (o.bag.original_price - o.bag.discounted_price) * o.quantity, 0).toFixed(2)}`,
      label: strings.profile.moneySaved,
      color: colors.primary[500],
    },
    {
      icon: 'restaurant' as const,
      value: `${completedOrders.length}`,
      label: strings.profile.mealsSaved,
      color: '#FF9800',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with settings */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{strings.profile.title}</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userJoined}>Miembro desde 2024</Text>
          </View>
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* Impact Stats */}
        <Text style={styles.sectionTitle}>{strings.profile.impact}</Text>
        <View style={styles.statsRow}>
          {impactStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Divider marginVertical={spacing.lg} />

        {/* Orders */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/order-history')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="receipt-outline" size={22} color={colors.text.primary} />
            <Text style={styles.menuItemText}>{strings.profile.myOrders}</Text>
          </View>
          <View style={styles.menuItemRight}>
            {orders.length > 0 && (
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{orders.length}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    marginLeft: spacing.lg,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userJoined: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  bottomPadding: {
    height: spacing.xxxxl,
  },
});
