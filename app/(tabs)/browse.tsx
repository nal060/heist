import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../src/components/ui/SearchBar';
import CategoryPill from '../../src/components/ui/CategoryPill';
import BagCardVertical from '../../src/components/bags/BagCardVertical';
import EmptyState from '../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { CATEGORIES } from '../../src/constants/categories';
import { searchBags } from '../../src/data';
import ErrorState from '../../src/components/ui/ErrorState';
import { useFavorites } from '../../src/context/FavoritesContext';
import type { BagWithBusiness } from '../../src/types';

type SortOption = 'relevance' | 'price' | 'rating';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'relevance', label: strings.browse.sortOptions.relevance },
  { key: 'price', label: strings.browse.sortOptions.price },
  { key: 'rating', label: strings.browse.sortOptions.rating },
];

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [bags, setBags] = useState<BagWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadBags = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      let results = await searchBags(searchQuery);
      results = results.filter((b) => b.status === 'active');

      if (selectedCategory) {
        results = results.filter((b) => b.category?.id === selectedCategory);
      }

      switch (sortBy) {
        case 'price':
          results = [...results].sort((a, b) => a.discounted_price - b.discounted_price);
          break;
        case 'rating':
          results = [...results].sort((a, b) => b.business.rating - a.business.rating);
          break;
        default:
          break;
      }

      setBags(results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    loadBags();
  }, [loadBags]);

  const handleBagPress = (bag: BagWithBusiness) => {
    router.push(`/bag/${bag.id}`);
  };

  const allCategories = [{ id: null, name: strings.categories.all, icon: null, created_at: '' }, ...CATEGORIES];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{strings.tabs.browse}</Text>
        <SearchBar
          placeholder={strings.browse.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        data={allCategories}
        renderItem={({ item: cat }) => (
          <CategoryPill
            key={cat.id ?? 'all'}
            label={cat.name}
            isActive={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
          />
        )}
        keyExtractor={(item) => item.id ?? 'all'}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>
          {bags.length} {strings.browse.results}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
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
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive,
              ]}
              onPress={() => {
                setSortBy(option.key);
                setShowSortOptions(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ErrorState onRetry={loadBags} />
        </View>
      ) : (
        <FlatList
          data={bags}
          renderItem={({ item }) => (
            <BagCardVertical
              bag={{ ...item, isFavorite: isFavorite(item.business_id) }}
              onPress={() => handleBagPress(item)}
              onToggleFavorite={() => toggleFavorite(item.business_id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={strings.browse.noResults}
              subtitle={strings.browse.noResultsSubtitle}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    backgroundColor: colors.white,
    borderRadius: 12,
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
  },
  listSeparator: {
    height: spacing.md,
  },
});
