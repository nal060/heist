import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../src/components/ui/SearchBar';
import CategoryPill from '../../src/components/ui/CategoryPill';
import BagCardVertical from '../../src/components/bags/BagCardVertical';
import EmptyState from '../../src/components/ui/EmptyState';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getAllActiveBags, getCategories } from '../../src/data';
import ErrorState from '../../src/components/ui/ErrorState';
import { useFavorites } from '../../src/context/FavoritesContext';
import useFavoriteSheet from '../../src/hooks/useFavoriteSheet';
import FavoriteBottomSheet from '../../src/components/favorites/FavoriteBottomSheet';
import type { BagWithBusiness, Category } from '../../src/types';

type SortOption = 'relevance' | 'price' | 'rating';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'relevance', label: strings.browse.sortOptions.relevance },
  { key: 'price', label: strings.browse.sortOptions.price },
  { key: 'rating', label: strings.browse.sortOptions.rating },
];

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isItemFavorited } = useFavorites();
  const { sheetRef, sheetData, openSheet } = useFavoriteSheet();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [allBags, setAllBags] = useState<BagWithBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(false);
      const [bags, cats] = await Promise.all([
        getAllActiveBags(),
        getCategories(),
      ]);
      setAllBags(bags.filter((b) => b.status === 'active'));
      setCategories(cats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filter + sort — no re-fetch, instant
  const filteredBags = useMemo(() => {
    let results = allBags;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.business.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      results = results.filter((b) => b.category?.id === selectedCategory);
    }

    switch (sortBy) {
      case 'price':
        return [...results].sort((a, b) => a.discounted_price - b.discounted_price);
      case 'rating':
        return [...results].sort((a, b) => b.business.rating - a.business.rating);
      default:
        return results;
    }
  }, [allBags, searchQuery, selectedCategory, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const allCategories = useMemo(
    () => [{ id: null, name: strings.categories.all, icon: null, created_at: '' }, ...categories],
    [categories],
  );

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
      {/* Title + Search */}
      <View style={styles.header}>
        <Text style={styles.title}>{strings.tabs.browse}</Text>
        <SearchBar
          placeholder={strings.browse.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results — single scrollable list with categories + sort as header */}
      <FlatList
        data={filteredBags}
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
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Category Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {allCategories.map((cat) => (
                <CategoryPill
                  key={cat.id ?? 'all'}
                  label={cat.name}
                  isActive={selectedCategory === cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                />
              ))}
            </ScrollView>

            {/* Sort Bar */}
            <View style={styles.sortBar}>
              <Text style={styles.resultCount}>
                {filteredBags.length} {strings.browse.results}
              </Text>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setShowSortOptions((prev) => !prev)}
              >
                <Ionicons name="swap-vertical" size={16} color={colors.text.secondary} />
                <Text style={styles.sortText}>
                  {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sort Dropdown */}
            {showSortOptions && (
              <View style={styles.sortDropdown}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sortOption, sortBy === option.key && styles.sortOptionActive]}
                    onPress={() => {
                      setSortBy(option.key);
                      setShowSortOptions(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, sortBy === option.key && styles.sortOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={strings.browse.noResults}
            subtitle={strings.browse.noResultsSubtitle}
          />
        }
      />
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  resultCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  sortDropdown: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  sortOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sortOptionActive: {
    backgroundColor: colors.primary[50],
  },
  sortOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  sortOptionTextActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxxl,
    flexGrow: 1,
  },
  listSeparator: {
    height: spacing.md,
  },
});
