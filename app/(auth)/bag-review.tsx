import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import {
  createBusiness,
  setBusinessCategory,
  createSurplusBag,
  saveBagSchedule,
  saveBusinessPhotos,
} from '../../src/data/auth';
import { getPhotoUrl } from '../../src/lib/googlePlaces';
import type { BagSizeType } from '../../src/types';
import ProgressBar from '../../src/components/ui/ProgressBar';
import Button from '../../src/components/ui/Button';

export default function BagReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setOnboarded } = useAuth();
  const params = useLocalSearchParams<{
    name: string;
    description: string;
    address: string;
    phone: string;
    latitude: string;
    longitude: string;
    googlePlaceId: string;
    countryId: string;
    categoryId: string;
    photoRefs: string;
    bagTitle: string;
    bagDescription: string;
    bagSize: string;
    bagValue: string;
    bagPrice: string;
    bagQuantity: string;
    scheduleJson: string;
    earningsPerWeek: string;
    activeDays: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startDate = new Date();
  const startDateFormatted = startDate.toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = async (status: 'active' | 'draft') => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create business
      const business = await createBusiness({
        userId: user.id,
        name: params.name!,
        description: params.description || undefined,
        address: params.address!,
        latitude: parseFloat(params.latitude || '8.953'),
        longitude: parseFloat(params.longitude || '-79.534'),
        phone: params.phone || undefined,
        countryId: params.countryId || undefined,
        googlePlaceId: params.googlePlaceId || undefined,
      });

      // 2. Set category
      await setBusinessCategory(business.id, params.categoryId!);

      // 3. Save Google Maps photos if available
      const photoRefs = JSON.parse(params.photoRefs || '[]') as string[];
      if (photoRefs.length > 0) {
        const photos = photoRefs.map((ref, i) => ({
          url: getPhotoUrl(ref),
          source: 'google_maps',
          isSelected: true,
          order: i,
        }));
        await saveBusinessPhotos(business.id, photos);
      }

      // 4. Create the bag
      const schedule = JSON.parse(params.scheduleJson || '[]');
      const firstScheduleEntry = schedule[0];

      const bag = await createSurplusBag({
        businessId: business.id,
        title: params.bagTitle!,
        description: params.bagDescription || undefined,
        originalPrice: parseFloat(params.bagValue || '18'),
        discountedPrice: parseFloat(params.bagPrice || '5.99'),
        value: parseFloat(params.bagValue || '18'),
        bagSize: (params.bagSize as BagSizeType) || 'medium',
        quantityTotal: parseInt(params.bagQuantity || '3', 10),
        pickupStartTime: firstScheduleEntry?.startTime || '17:00',
        pickupEndTime: firstScheduleEntry?.endTime || '18:00',
        status,
      });

      // 5. Save schedule
      if (schedule.length > 0) {
        await saveBagSchedule(bag.id, schedule);
      }

      // 6. Complete onboarding
      setOnboarded();

      if (status === 'active') {
        router.replace({
          pathname: '/(auth)/bag-whats-next',
          params: {
            bagTitle: params.bagTitle,
            bagPrice: params.bagPrice,
            bagValue: params.bagValue,
            bagQuantity: params.bagQuantity,
          },
        });
      } else {
        router.replace('/(business-tabs)');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.bagReviewSetup.title}</Text>
        <Text style={styles.subtitle}>{strings.bagReviewSetup.subtitle}</Text>

        {/* Start date */}
        <View style={styles.section}>
          <Ionicons name="rocket-outline" size={28} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>{strings.bagReviewSetup.startDate}</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{startDateFormatted}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {strings.bagReviewSetup.startDateDescription}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{params.bagTitle}</Text>
          <Text style={styles.summaryDetail}>
            {params.bagQuantity} {strings.bagWhatsNext.perDay}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.summaryPrice}>USD {params.bagPrice}</Text>
            <Text style={styles.summaryOriginal}>USD {params.bagValue}</Text>
          </View>
          <Text style={styles.summaryDetail}>
            {params.activeDays} dias/semana
          </Text>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Ionicons name="cash-outline" size={28} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>{strings.bagReviewSetup.earningsAndFees}</Text>
          <Text style={styles.earningsValue}>~USD {params.earningsPerWeek}/semana</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <ProgressBar current={6} total={6} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.bagReviewSetup.confirmAndSell}
          onPress={() => handleConfirm('active')}
          size="lg"
          fullWidth
          loading={loading}
        />
        <Button
          label={strings.bagReviewSetup.maybeLater}
          onPress={() => handleConfirm('draft')}
          variant="ghost"
          size="lg"
          fullWidth
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginTop: spacing.sm,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  summaryDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summaryOriginal: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  earningsValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
});
