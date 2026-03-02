import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import ErrorState from '../../src/components/ui/ErrorState';

interface DashboardStats {
  activeBags: number;
  pendingOrders: number;
  totalEarnings: number;
  businessName: string;
}

export default function BusinessDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      // Get the business for this user
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (bizError) throw new Error(bizError.message);

      // Get active bags count
      const { count: activeBags } = await supabase
        .from('surplus_bags')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'active');

      // Get pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*, surplus_bags!inner(business_id)', { count: 'exact', head: true })
        .eq('surplus_bags.business_id', business.id)
        .eq('status', 'reserved');

      // Get total earnings
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price, surplus_bags!inner(business_id)')
        .eq('surplus_bags.business_id', business.id)
        .eq('status', 'collected');

      const totalEarnings = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

      setStats({
        activeBags: activeBags || 0,
        pendingOrders: pendingOrders || 0,
        totalEarnings,
        businessName: business.name,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
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
        <ErrorState message={error} onRetry={loadDashboard} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.greeting}>
        {strings.businessDashboard.welcome}, {stats?.businessName}
      </Text>

      <Text style={styles.sectionTitle}>
        {strings.businessDashboard.todaySummary}
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.primary[50] }]}>
          <Ionicons name="bag-handle" size={24} color={colors.primary[500]} />
          <Text style={styles.statValue}>{stats?.activeBags || 0}</Text>
          <Text style={styles.statLabel}>
            {strings.businessDashboard.activeBags}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time" size={24} color="#F57C00" />
          <Text style={styles.statValue}>{stats?.pendingOrders || 0}</Text>
          <Text style={styles.statLabel}>
            {strings.businessDashboard.pendingOrders}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="cash" size={24} color="#2E7D32" />
          <Text style={styles.statValue}>
            ${stats?.totalEarnings.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.statLabel}>
            {strings.businessDashboard.totalEarnings}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
