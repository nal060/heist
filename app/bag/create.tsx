import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { createSurplusBag, saveBagSchedule, uploadBagPhoto } from '../../src/data/auth';
import { BAG_SIZES, DAYS_OF_WEEK, type BagSize } from '../../src/constants/app';
import type { BagSizeType } from '../../src/types';
import ScreenShell from '../../src/components/ui/ScreenShell';
import FormField from '../../src/components/ui/FormField';
import CurrencyInput from '../../src/components/ui/CurrencyInput';
import RadioButton from '../../src/components/ui/RadioButton';
import DayScheduleEditor, { type DaySchedule } from '../../src/components/ui/DayScheduleEditor';
import Button from '../../src/components/ui/Button';
import ImagePickerSection, { type PhotoItem } from '../../src/components/ui/ImagePickerSection';

const SIZES: { key: BagSize; label: string; recommended?: boolean }[] = [
  { key: 'small', label: strings.bagSizeSetup.small },
  { key: 'medium', label: strings.bagSizeSetup.medium, recommended: true },
  { key: 'large', label: strings.bagSizeSetup.large },
];

function scheduleToEntries(schedule: Record<string, DaySchedule>) {
  const keyToDay: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
  return DAYS_OF_WEEK
    .filter((d) => schedule[d.key].active)
    .map((d) => ({
      dayOfWeek: keyToDay[d.key],
      startTime: schedule[d.key].startTime,
      endTime: schedule[d.key].endTime,
      isActive: true,
    }));
}

export default function CreateBagScreen() {
  const router = useRouter();
  const { businessId } = useAuth();
  const params = useLocalSearchParams<{
    title?: string;
    originalPrice?: string;
    discountedPrice?: string;
    quantityTotal?: string;
  }>();

  const isRelist = !!params.title;

  const [submitting, setSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BagSizeType>('medium');
  const [title, setTitle] = useState<string>(params.title ?? strings.bagForm.bagNameDefault);
  const [description, setDescription] = useState<string>(strings.bagForm.bagDescriptionDefault);
  const [value, setValue] = useState(params.originalPrice ?? String(BAG_SIZES.medium.value));
  const [price, setPrice] = useState(params.discountedPrice ?? String(BAG_SIZES.medium.price));
  const [quantity, setQuantity] = useState(params.quantityTotal ?? '3');
  const [pendingPhotos, setPendingPhotos] = useState<PhotoItem[]>([]);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const state: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((d) => {
      // Default: weekdays active
      const isWeekday = !['sat', 'sun'].includes(d.key);
      state[d.key] = { active: isWeekday, startTime: '17:00', endTime: '18:00' };
    });
    return state;
  });

  const handleSizeSelect = (size: BagSize) => {
    setSelectedSize(size);
    setValue(String(BAG_SIZES[size].value));
    setPrice(String(BAG_SIZES[size].price));
  };

  const handleToggleDay = (key: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active },
    }));
  };

  const handleUpdateTime = (key: string, field: 'startTime' | 'endTime', val: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: val },
    }));
  };

  const handleEditAll = () => {
    const firstActive = DAYS_OF_WEEK.find((d) => schedule[d.key].active);
    if (!firstActive) return;
    const { startTime, endTime } = schedule[firstActive.key];
    setSchedule((prev) => {
      const next = { ...prev };
      DAYS_OF_WEEK.forEach((d) => {
        if (next[d.key].active) {
          next[d.key] = { ...next[d.key], startTime, endTime };
        }
      });
      return next;
    });
  };

  // Validation
  const valueNum = parseFloat(value);
  const priceNum = parseFloat(price);
  const hasBothPrices = !isNaN(valueNum) && !isNaN(priceNum) && value !== '' && price !== '';
  const pricingError = hasBothPrices && priceNum >= valueNum ? strings.bagForm.pricingError : null;
  const discountPct = hasBothPrices && priceNum < valueNum
    ? Math.round((1 - priceNum / valueNum) * 100)
    : null;
  const canSubmit = title.trim() !== '' && hasBothPrices && !pricingError;

  const handleSubmit = async (status: 'active' | 'draft') => {
    if (!canSubmit || submitting || !businessId) return;
    setSubmitting(true);
    try {
      const bag = await createSurplusBag({
        businessId,
        title: title.trim(),
        description: description.trim() || undefined,
        originalPrice: valueNum,
        discountedPrice: priceNum,
        value: valueNum,
        bagSize: selectedSize,
        quantityTotal: parseInt(quantity, 10) || 3,
        pickupStartTime: '17:00',
        pickupEndTime: '18:00',
        status,
      });

      const entries = scheduleToEntries(schedule);
      const promises: Promise<unknown>[] = [];
      if (entries.length > 0) {
        promises.push(saveBagSchedule(bag.id, entries));
      }
      pendingPhotos.forEach((photo, i) => {
        promises.push(uploadBagPhoto(bag.id, photo.url, i));
      });
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      router.back();
    } catch (e) {
      Alert.alert(strings.common.error, (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell
      keyboardAvoiding
      title={isRelist ? strings.bagForm.relistBag : strings.bagForm.newBag}
      subtitle={strings.bagNameSetup.subtitle}
      footer={
        <View style={styles.footerRow}>
          <Button
            label={submitting ? strings.bagForm.savingDraft : strings.bagForm.saveDraft}
            onPress={() => handleSubmit('draft')}
            variant="outline"
            size="lg"
            loading={submitting}
            disabled={!canSubmit}
            style={styles.draftBtn}
          />
          <Button
            label={submitting ? strings.bagForm.publishing : strings.bagForm.publish}
            onPress={() => handleSubmit('active')}
            size="lg"
            loading={submitting}
            disabled={!canSubmit}
            style={styles.publishBtn}
          />
        </View>
      }
    >
      {/* Size selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.bagForm.size}</Text>
        <View style={styles.sizeRow}>
          {SIZES.map((size) => {
            const isSelected = selectedSize === size.key;
            const sizeData = BAG_SIZES[size.key];
            return (
              <TouchableOpacity
                key={size.key}
                style={[styles.sizeCard, isSelected && styles.sizeCardSelected]}
                onPress={() => handleSizeSelect(size.key)}
                activeOpacity={0.7}
              >
                <RadioButton selected={isSelected} />
                <Text style={[styles.sizeLabel, isSelected && styles.sizeLabelSelected]}>
                  {size.label}
                </Text>
                <Text style={styles.sizeDetail}>
                  {strings.bagForm.value}: ${sizeData.value.toFixed(2)}
                </Text>
                <Text style={styles.sizeDetail}>
                  {strings.bagForm.priceInApp}: ${sizeData.price.toFixed(2)}
                </Text>
                {size.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Ionicons name="star" size={10} color={colors.primary[500]} />
                    <Text style={styles.recommendedText}>{strings.bagSizeSetup.recommendedForYou}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bag details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.bagForm.bagDetails}</Text>
        <FormField
          label={strings.bagForm.bagName}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          showCounter
        />
        <FormField
          label={strings.bagForm.bagDescription}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={450}
          showCounter
        />
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.bagForm.pricing}</Text>
        <View style={styles.priceRow}>
          <CurrencyInput label={strings.bagForm.value} value={value} onChangeText={setValue} />
          <CurrencyInput label={strings.bagForm.priceInApp} value={price} onChangeText={setPrice} />
        </View>
        {pricingError ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={13} color={colors.error} />
            <Text style={styles.errorText}>{pricingError}</Text>
          </View>
        ) : discountPct !== null && discountPct > 0 ? (
          <View style={styles.savingsBanner}>
            <Ionicons name="pricetag-outline" size={14} color="#2E7D32" />
            <Text style={styles.savingsText}>
              {strings.bagForm.savingsMessage.replace('{pct}', String(discountPct))}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Quantity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.bagForm.quantity}</Text>
        <FormField
          label={strings.bagForm.quantityLabel}
          value={quantity}
          onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.bagForm.schedule}</Text>
        <DayScheduleEditor
          schedule={schedule}
          onToggleDay={handleToggleDay}
          onUpdateTime={handleUpdateTime}
          showEditAll
          onEditAll={handleEditAll}
          editAllLabel={strings.bagScheduleSetup.editForAllDays}
        />
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <ImagePickerSection
          photos={pendingPhotos}
          onAdd={(uri) => setPendingPhotos((prev) => [...prev, { id: `pending-${Date.now()}`, url: uri }])}
          onRemove={(photo) => setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Size cards
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  sizeLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sizeLabelSelected: {
    color: colors.primary[600],
  },
  sizeDetail: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  recommendedText: {
    fontSize: 10,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },

  // Pricing
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    flex: 1,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    color: '#2E7D32',
    fontWeight: typography.fontWeight.medium,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  draftBtn: {
    flex: 1,
  },
  publishBtn: {
    flex: 2,
  },
});
