import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { getBusinessPhotos } from '../../src/data/auth';
import type { SurplusBag } from '../../src/types';
import ErrorState from '../../src/components/ui/ErrorState';
import EmptyState from '../../src/components/ui/EmptyState';
import Badge from '../../src/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'popular' | 'nuevo' | 'remaining' | 'soldOut'> = {
  active: 'popular',
  draft: 'nuevo',
  sold_out: 'soldOut',
  expired: 'soldOut',
  cancelled: 'soldOut',
};

export default function BusinessBagsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [bags, setBags] = useState<SurplusBag[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBags = useCallback(async () => {
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
        .from('surplus_bags')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);
      setBags(data || []);

      // Load first business photo for cards
      const photos = await getBusinessPhotos(business.id);
      if (photos.length > 0) {
        setPhotoUrl(photos[0].photo_url);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadBags();
  }, [loadBags]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBags();
  };

  const renderBag = ({ item }: { item: SurplusBag }) => {
    const statusLabel = strings.businessBags.status[item.status] || item.status;
    const variant = STATUS_VARIANT[item.status] || 'soldOut';

    return (
      <TouchableOpacity
        style={styles.bagCard}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/business-edit-bag', params: { bagId: item.id } })}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.bagImage} />
        ) : (
          <View style={styles.bagImagePlaceholder}>
            <Ionicons name="bag-handle-outline" size={32} color={colors.gray[400]} />
          </View>
        )}
        <View style={styles.bagContent}>
          <View style={styles.bagHeader}>
            <Text style={styles.bagTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Badge text={statusLabel} variant={variant} />
          </View>
          <View style={styles.bagDetails}>
            <Text style={styles.bagPrice}>
              USD {item.discounted_price.toFixed(2)}{' '}
              <Text style={styles.bagOriginalPrice}>
                USD {item.original_price.toFixed(2)}
              </Text>
            </Text>
            <Text style={styles.bagQuantity}>
              {item.quantity_available}/{item.quantity_total}
            </Text>
          </View>
          <View style={styles.bagFooter}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.bagTime}>
              {item.pickup_start_time.slice(0, 5)} - {item.pickup_end_time.slice(0, 5)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} style={styles.chevron} />
          </View>
        </View>
      </TouchableOpacity>
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
        <ErrorState message={error} onRetry={loadBags} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{strings.businessBags.title}</Text>
      </View>

      <FlatList
        data={bags}
        keyExtractor={(item) => item.id}
        renderItem={renderBag}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="bag-handle-outline"
            title={strings.businessBags.emptyTitle}
            subtitle={strings.businessBags.emptySubtitle}
          />
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  bagCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    ...shadows.sm,
  },
  bagImage: {
    width: '100%',
    height: 140,
  },
  bagImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagContent: {
    padding: spacing.lg,
  },
  bagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bagTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  bagDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bagPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  bagOriginalPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  bagQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  bagFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bagTime: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
