import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationHeader from '../../src/components/layout/LocationHeader';
import CategoryPill from '../../src/components/ui/CategoryPill';
import SectionHeader from '../../src/components/ui/SectionHeader';
import BagCardHorizontal from '../../src/components/bags/BagCardHorizontal';
import { colors, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getNearbyBags, getRecommendedBags, getCategories } from '../../src/data';
import ErrorState from '../../src/components/ui/ErrorState';
import EmptyState from '../../src/components/ui/EmptyState';

import { useFavorites } from '../../src/context/FavoritesContext';
import { useLocation } from '../../src/context/LocationContext';
import useFavoriteSheet from '../../src/hooks/useFavoriteSheet';
import FavoriteBottomSheet from '../../src/components/favorites/FavoriteBottomSheet';
import type { BagWithBusiness, Category } from '../../src/types';

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isItemFavorited } = useFavorites();
  const { sheetRef, sheetData, openSheet } = useFavoriteSheet();
  const { location, isLoaded } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allBags, setAllBags] = useState<BagWithBusiness[]>([]);
  const [recommended, setRecommended] = useState<BagWithBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lat = location?.latitude ?? strings.discover.latitude;
  const lon = location?.longitude ?? strings.discover.longitude;

  const loadBags = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [bags, recs, cats] = await Promise.all([
        getNearbyBags(lat, lon).catch(() => [] as BagWithBusiness[]),
        getRecommendedBags(),
        getCategories(),
      ]);
      setAllBags(bags);
      setRecommended(recs);
      setCategories(cats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (!isLoaded) return;
    loadBags();
  }, [loadBags, isLoaded]);

  const activeBags = allBags.filter((b) => b.status === 'active');

  const filteredBags = selectedCategory
    ? activeBags.filter((b) => b.category?.id === selectedCategory)
    : activeBags;

  const nearbyBags = filteredBags.slice(0, 8);

  const filteredRecommended = selectedCategory
    ? recommended.filter((b) => b.category?.id === selectedCategory)
    : recommended;
  const recommendedBags = filteredRecommended.slice(0, 12);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBags();
    setRefreshing(false);
  }, [loadBags]);

  const handleBagPress = (bag: BagWithBusiness) => {
    router.push(`/bag/${bag.id}`);
  };

  const allCategories = [{ id: null, name: strings.categories.all, icon: null, created_at: '' }, ...categories];

  const renderBagCard = ({ item }: { item: BagWithBusiness }) => (
    <BagCardHorizontal
      bag={{ ...item, isFavorite: isItemFavorited(item.id, item.business_id) }}
      onPress={() => handleBagPress(item)}
      onToggleFavorite={() => openSheet(item.id, item.business_id, item.title, item.business.name)}
    />
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
        <ErrorState onRetry={loadBags} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LocationHeader
        location={location?.name ?? strings.discover.defaultLocation}
        paddingTop={insets.top}
        onPress={() => router.push('/change-location')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
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

        {/* Nearby Offers */}
        <SectionHeader
          title={strings.discover.nearbyOffers}
          actionText={strings.discover.seeAll}
          onActionPress={nearbyBags.length > 0 ? () => router.push('/(tabs)/browse') : undefined}
        />
        {nearbyBags.length > 0 ? (
          <FlatList
            data={nearbyBags}
            renderItem={renderBagCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            ItemSeparatorComponent={() => <View style={styles.carouselSeparator} />}
            scrollEnabled
          />
        ) : (
          <EmptyState
            icon="location-outline"
            title={strings.discover.noNearbyTitle}
            subtitle={strings.discover.noNearbySubtitle}
          />
        )}

        {/* Recommended */}
        <SectionHeader
          title={strings.discover.recommended}
          actionText={strings.discover.seeAll}
          onActionPress={() => router.push('/(tabs)/browse')}
        />
        <FlatList
          data={recommendedBags}
          renderItem={renderBagCard}
          keyExtractor={(item) => `rec-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          ItemSeparatorComponent={() => <View style={styles.carouselSeparator} />}
          scrollEnabled
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  carouselContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  carouselSeparator: {
    width: spacing.md,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
