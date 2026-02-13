import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BagCardVertical from '../../src/components/bags/BagCardVertical';
import EmptyState from '../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getFavoriteBags } from '../../src/data';
import ErrorState from '../../src/components/ui/ErrorState';
import { useFavorites } from '../../src/context/FavoritesContext';
import type { BagWithBusiness } from '../../src/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteBusinessIds, toggleFavorite } = useFavorites();
  const [favoriteBags, setFavoriteBags] = useState<BagWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getFavoriteBags(favoriteBusinessIds)
      .then((bags) => {
        setFavoriteBags(bags);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favoriteBusinessIds]);

  const handleBagPress = (bag: BagWithBusiness) => {
    router.push(`/bag/${bag.id}`);
  };

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
        <ErrorState onRetry={() => {
          setLoading(true);
          setError(false);
          getFavoriteBags(favoriteBusinessIds)
            .then((bags) => setFavoriteBags(bags))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
        }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.favorites.title}</Text>
      </View>
      <FlatList
        data={favoriteBags}
        renderItem={({ item }) => (
          <BagCardVertical
            bag={{ ...item, isFavorite: true }}
            onPress={() => handleBagPress(item)}
            onToggleFavorite={() => toggleFavorite(item.business_id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title={strings.favorites.emptyTitle}
            subtitle={strings.favorites.emptySubtitle}
            actionLabel={strings.profile.startExploring}
            onAction={() => router.push('/(tabs)/')}
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
