import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BagCardVertical from '../../src/components/bags/BagCardVertical';
import BusinessCard from '../../src/components/business/BusinessCard';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import FavoriteBottomSheet from '../../src/components/favorites/FavoriteBottomSheet';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getFavoriteBagsList, getFavoriteBusinessesList } from '../../src/data';
import { useFavorites } from '../../src/context/FavoritesContext';
import useFavoriteSheet from '../../src/hooks/useFavoriteSheet';
import type { BagWithBusiness, BusinessWithBags } from '../../src/types';

type Tab = 'bags' | 'stores';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteBagIds, favoriteBusinessIds, isItemFavorited, removeBusinessFavorite } = useFavorites();
  const { sheetRef, sheetData, openSheet } = useFavoriteSheet();

  const [activeTab, setActiveTab] = useState<Tab>('bags');
  const [bags, setBags] = useState<BagWithBusiness[]>([]);
  const [businesses, setBusinesses] = useState<BusinessWithBags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [b, s] = await Promise.all([
        getFavoriteBagsList(favoriteBagIds),
        getFavoriteBusinessesList(favoriteBusinessIds),
      ]);
      setBags(b);
      setBusinesses(s);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [favoriteBagIds, favoriteBusinessIds]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ErrorState onRetry={loadData} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.favorites.title}</Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bags' && styles.tabActive]}
          onPress={() => setActiveTab('bags')}
        >
          <Text style={[styles.tabText, activeTab === 'bags' && styles.tabTextActive]}>
            {strings.favorites.tabBags}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stores' && styles.tabActive]}
          onPress={() => setActiveTab('stores')}
        >
          <Text style={[styles.tabText, activeTab === 'stores' && styles.tabTextActive]}>
            {strings.favorites.tabStores}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'bags' ? (
        <FlatList
          data={bags}
          renderItem={({ item }) => (
            <BagCardVertical
              bag={{ ...item, isFavorite: isItemFavorited(item.id, item.business_id) }}
              onPress={() => router.push(`/bag/${item.id}`)}
              onToggleFavorite={() => openSheet(item.id, item.business_id, item.title, item.business.name)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title={strings.favorites.emptyBagsTitle}
              subtitle={strings.favorites.emptyBagsSubtitle}
              actionLabel={strings.profile.startExploring}
              onAction={() => router.push('/(tabs)/')}
            />
          }
        />
      ) : (
        <FlatList
          data={businesses}
          renderItem={({ item }) => (
            <BusinessCard
              business={item}
              onPress={() => router.push(`/business/${item.id}`)}
              onRemoveFavorite={() => removeBusinessFavorite(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="storefront-outline"
              title={strings.favorites.emptyStoresTitle}
              subtitle={strings.favorites.emptyStoresSubtitle}
              actionLabel={strings.profile.startExploring}
              onAction={() => router.push('/(tabs)/')}
            />
          }
        />
      )}

      <FavoriteBottomSheet ref={sheetRef} data={sheetData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxxl,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
});
