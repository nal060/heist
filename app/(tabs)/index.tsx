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
import { CATEGORIES } from '../../src/constants/categories';
import { getNearbyBags } from '../../src/data';

import { useFavorites } from '../../src/context/FavoritesContext';
import type { BagWithBusiness } from '../../src/types';

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allBags, setAllBags] = useState<BagWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBags = useCallback(async () => {
    const bags: BagWithBusiness[] = await getNearbyBags(strings.discover.latitude, strings.discover.longitude);
    setAllBags(bags);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBags();
  }, [loadBags]);

  const activeBags = allBags.filter((b) => b.status === 'active');

  const filteredBags = selectedCategory
    ? activeBags.filter((b) => b.category?.id === selectedCategory)
    : activeBags;

  const nearbyBags = filteredBags.slice(0, 8);
  const recommendedBags = filteredBags.slice(4, 12);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBags();
    setRefreshing(false);
  }, [loadBags]);

  const handleBagPress = (bag: BagWithBusiness) => {
    router.push(`/bag/${bag.id}`);
  };

  const allCategories = [{ id: null, name: strings.categories.all, icon: null, created_at: '' }, ...CATEGORIES];

  const renderBagCard = ({ item }: { item: BagWithBusiness }) => (
    <BagCardHorizontal
      bag={{ ...item, isFavorite: isFavorite(item.business_id) }}
      onPress={() => handleBagPress(item)}
      onToggleFavorite={() => toggleFavorite(item.business_id)}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LocationHeader location={strings.discover.defaultLocation} paddingTop={insets.top} />

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
          onActionPress={() => router.push('/(tabs)/browse')}
        />
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
