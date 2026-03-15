import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getBusinessById, getBusinessActiveBags } from '../../src/data';
import { useFavorites } from '../../src/context/FavoritesContext';
import useFavoriteSheet from '../../src/hooks/useFavoriteSheet';
import FavoriteBottomSheet from '../../src/components/favorites/FavoriteBottomSheet';
import ErrorState from '../../src/components/ui/ErrorState';
import EmptyState from '../../src/components/ui/EmptyState';
import RatingBadge from '../../src/components/ui/RatingBadge';
import Divider from '../../src/components/ui/Divider';
import SectionHeader from '../../src/components/ui/SectionHeader';
import BagCardVertical from '../../src/components/bags/BagCardVertical';
import Button from '../../src/components/ui/Button';
import type { Business, BagWithBusiness } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 250;

export default function BusinessProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, addFavorites, removeBusinessFavorite, isItemFavorited } = useFavorites();
  const { sheetRef, sheetData, openSheet } = useFavoriteSheet();

  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [activeBags, setActiveBags] = useState<BagWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const [biz, bags] = await Promise.all([
        getBusinessById(id),
        getBusinessActiveBags(id),
      ]);
      setBusiness(biz);
      setActiveBags(bags);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDirections = useCallback(() => {
    if (!business) return;
    const { latitude, longitude, address } = business;

    const options = [
      strings.consumerBusinessProfile.googleMaps,
      strings.consumerBusinessProfile.appleMaps,
      strings.consumerBusinessProfile.copyAddress,
      strings.common.cancel,
    ];

    const handleAction = (index: number) => {
      if (index === 0) {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
      } else if (index === 1) {
        Linking.openURL(`maps://app?daddr=${latitude},${longitude}`);
      } else if (index === 2) {
        Clipboard.setStringAsync(address);
        Alert.alert('', strings.consumerBusinessProfile.addressCopied);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, title: strings.consumerBusinessProfile.selectNavApp },
        handleAction,
      );
    } else {
      // Simple alert-based fallback for Android
      Alert.alert(
        strings.consumerBusinessProfile.selectNavApp,
        undefined,
        [
          { text: strings.consumerBusinessProfile.googleMaps, onPress: () => handleAction(0) },
          { text: strings.consumerBusinessProfile.appleMaps, onPress: () => handleAction(1) },
          { text: strings.consumerBusinessProfile.copyAddress, onPress: () => handleAction(2) },
          { text: strings.common.cancel, style: 'cancel' },
        ],
      );
    }
  }, [business]);

  const favorite = business ? isFavorite(business.id) : false;

  const toggleBusinessFavorite = useCallback(() => {
    if (!business) return;
    if (favorite) {
      removeBusinessFavorite(business.id);
    } else {
      addFavorites(null, business.id);
    }
  }, [business, favorite, addFavorites, removeBusinessFavorite]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorState onRetry={loadData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {business.photo_url ? (
            <Image source={{ uri: business.photo_url }} style={styles.heroImage} contentFit="cover" transition={300} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="storefront-outline" size={64} color={colors.gray[300]} />
            </View>
          )}

          <View style={[styles.topButtons, { top: insets.top + spacing.sm }]}>
            <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={toggleBusinessFavorite}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? colors.primary[500] : colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Info */}
        <View style={styles.infoSection}>
          <Text style={styles.businessName}>{business.name}</Text>
          <RatingBadge rating={business.rating} reviewCount={business.total_reviews} />

          {business.description && (
            <Text style={styles.description}>{business.description}</Text>
          )}

          {/* Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.addressText}>{business.address}</Text>
          </View>

          <Button
            label={strings.consumerBusinessProfile.getDirections}
            onPress={handleDirections}
            variant="outline"
            size="lg"
            fullWidth
          />
        </View>

        <Divider />

        {/* Active Bags */}
        <View style={styles.bagsSection}>
          <SectionHeader title={strings.consumerBusinessProfile.activeBagsSection} />
          {activeBags.length > 0 ? (
            <View style={styles.bagsList}>
              {activeBags.map((bag) => (
                <BagCardVertical
                  key={bag.id}
                  bag={{ ...bag, isFavorite: isItemFavorited(bag.id, bag.business_id) }}
                  onPress={() => router.push(`/bag/${bag.id}`)}
                  onToggleFavorite={() => openSheet(bag.id, bag.business_id, bag.title, bag.business.name)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="bag-handle-outline"
              title={strings.consumerBusinessProfile.noBagsTitle}
              subtitle={strings.consumerBusinessProfile.noBagsSubtitle}
            />
          )}
        </View>
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
  heroContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  heroPlaceholder: {
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtons: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  infoSection: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  businessName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  bagsSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  bagsList: {
    gap: spacing.md,
  },
});
