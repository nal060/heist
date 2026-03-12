import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
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
import ScreenShell from '../../src/components/ui/ScreenShell';
import BagSummaryCard from '../../src/components/ui/BagSummaryCard';
import Button from '../../src/components/ui/Button';

export default function BagReviewScreen() {
  const router = useRouter();
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

  const startDateFormatted = new Date().toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = async (status: 'active' | 'draft') => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
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

      await setBusinessCategory(business.id, params.categoryId!);

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

      if (schedule.length > 0) {
        await saveBagSchedule(bag.id, schedule);
      }

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
    <ScreenShell
      title={strings.bagReviewSetup.title}
      subtitle={strings.bagReviewSetup.subtitle}
      progress={{ current: 6, total: 6 }}
      error={error || undefined}
      footer={
        <>
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
        </>
      }
    >
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

      <BagSummaryCard
        title={params.bagTitle || ''}
        quantity={params.bagQuantity}
        quantityLabel={strings.bagWhatsNext.perDay}
        price={params.bagPrice || ''}
        originalPrice={params.bagValue || ''}
        extraDetail={`${params.activeDays} dias/semana`}
      />

      {/* Earnings */}
      <View style={styles.section}>
        <Ionicons name="cash-outline" size={28} color={colors.primary[500]} />
        <Text style={styles.sectionTitle}>{strings.bagReviewSetup.earningsAndFees}</Text>
        <Text style={styles.earningsValue}>~USD {params.earningsPerWeek}/semana</Text>
      </View>

    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  earningsValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
});
