import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { strings } from '../../../src/constants/strings';
import { getBusinessBagById, updateBagStatus } from '../../../src/data/business';
import { updateSurplusBag, saveBagSchedule, uploadBagPhoto, deleteBagPhoto } from '../../../src/data/auth';
import { BAG_SIZES, DAYS_OF_WEEK, type BagSize } from '../../../src/constants/app';
import type { SurplusBag, BagSizeType, BagPhoto } from '../../../src/types';
import ScreenShell from '../../../src/components/ui/ScreenShell';
import FormField from '../../../src/components/ui/FormField';
import CurrencyInput from '../../../src/components/ui/CurrencyInput';
import DayScheduleEditor, { type DaySchedule } from '../../../src/components/ui/DayScheduleEditor';
import Button from '../../../src/components/ui/Button';
import ImagePickerSection, { type PhotoItem } from '../../../src/components/ui/ImagePickerSection';
import { scheduleToEntries, buildScheduleState } from '../../../src/utils/schedule';

const SIZES: { key: BagSize; label: string }[] = [
  { key: 'small', label: strings.bagSizeSetup.small },
  { key: 'medium', label: strings.bagSizeSetup.medium },
  { key: 'large', label: strings.bagSizeSetup.large },
];

export default function EditBagScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [bag, setBag] = useState<SurplusBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSize, setSelectedSize] = useState<BagSizeType>('medium');
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const state: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((d) => { state[d.key] = { active: false, startTime: '17:00', endTime: '18:00' }; });
    return state;
  });

  const loadBag = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBusinessBagById(id);
      if (!result) throw new Error(strings.common.bagNotFound);
      const { bag: bagData, schedule: scheduleData, photos: photosData } = result;
      setBag(bagData);
      setTitle(bagData.title);
      setDescription(bagData.description || '');
      setSelectedSize(bagData.bag_size || 'medium');
      setValue(String(bagData.value || bagData.original_price));
      setPrice(String(bagData.discounted_price));
      setQuantity(String(bagData.quantity_total));
      setSchedule(buildScheduleState(scheduleData));
      setPhotos(photosData.map((p) => ({ id: p.id, url: p.photo_url })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.common.error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadBag(); }, [loadBag]);

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

  const handleAddPhoto = async (uri: string) => {
    if (!bag) return;
    setUploading(true);
    try {
      const photoUrl = await uploadBagPhoto(bag.id, uri, photos.length);
      setPhotos((prev) => [...prev, { id: `new-${Date.now()}`, url: photoUrl }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.common.error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (photo: PhotoItem) => {
    try {
      await deleteBagPhoto(photo.id, photo.url);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.common.error);
    }
  };

  const handleToggleStatus = async () => {
    if (!bag) return;
    setSaving(true);
    setError(null);
    try {
      const newStatus = bag.status === 'active' ? 'draft' : 'active';
      await updateBagStatus(bag.id, newStatus);
      setBag({ ...bag, status: newStatus });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!bag || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const sizeDefaults = BAG_SIZES[selectedSize];
      await Promise.all([
        updateSurplusBag(bag.id, {
          title: title.trim(),
          description: description.trim() || null,
          bag_size: selectedSize,
          value: parseFloat(value) || sizeDefaults.value,
          original_price: parseFloat(value) || sizeDefaults.value,
          discounted_price: parseFloat(price) || sizeDefaults.price,
          quantity_total: parseInt(quantity, 10) || bag.quantity_total,
        }),
        saveBagSchedule(bag.id, scheduleToEntries(schedule)),
      ]);
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.common.error);
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = bag?.status === 'active'
    ? strings.bagForm.deactivate
    : strings.bagForm.activate;

  return (
    <ScreenShell
      keyboardAvoiding
      loading={loading}
      loadingError={!bag ? error : undefined}
      onRetry={loadBag}
      error={!loading && bag && error ? error : undefined}
      footer={
        <Button
          label={saving ? strings.bagForm.saving : strings.bagForm.saveChanges}
          onPress={handleSave}
          size="lg"
          fullWidth
          loading={saving}
          disabled={!title.trim()}
        />
      }
    >
      {/* Header with status toggle */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{strings.bagForm.editBag}</Text>
        {bag && (
          <TouchableOpacity
            style={[styles.statusBadge, bag.status === 'active' ? styles.statusActive : styles.statusDraft]}
            onPress={handleToggleStatus}
          >
            <Text style={[styles.statusBadgeText, bag.status === 'active' ? styles.statusTextActive : styles.statusTextDraft]}>
              {strings.businessBags.status[bag.status] || bag.status}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name & description */}
      <FormField
        label={strings.bagForm.bagName}
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
      <FormField
        label={strings.bagForm.bagDescription}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={450}
      />

      {/* Size selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{strings.bagForm.size}</Text>
        <View style={styles.sizeRow}>
          {SIZES.map((size) => {
            const isSelected = selectedSize === size.key;
            return (
              <TouchableOpacity
                key={size.key}
                style={[styles.sizeChip, isSelected && styles.sizeChipSelected]}
                onPress={() => {
                  setSelectedSize(size.key);
                  setValue(String(BAG_SIZES[size.key].value));
                  setPrice(String(BAG_SIZES[size.key].price));
                }}
              >
                <Text style={[styles.sizeChipText, isSelected && styles.sizeChipTextSelected]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Value and Price */}
      <View style={styles.rowFields}>
        <CurrencyInput label={strings.bagForm.value} value={value} onChangeText={setValue} />
        <CurrencyInput label={strings.bagForm.priceInApp} value={price} onChangeText={setPrice} />
      </View>

      {/* Quantity */}
      <FormField
        label={strings.bagForm.quantityLabel}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
      />

      {/* Schedule */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{strings.bagForm.schedule}</Text>
        <DayScheduleEditor
          schedule={schedule}
          onToggleDay={handleToggleDay}
          onUpdateTime={handleUpdateTime}
          showEditAll
          onEditAll={handleEditAll}
          editAllLabel={strings.bagScheduleSetup.editForAllDays}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  screenTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusActive: { backgroundColor: colors.primary[50] },
  statusDraft: { backgroundColor: colors.gray[100] },
  statusBadgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  statusTextActive: { color: colors.primary[600] },
  statusTextDraft: { color: colors.text.tertiary },
  fieldGroup: { marginBottom: spacing.xl },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  sizeRow: { flexDirection: 'row', gap: spacing.sm },
  sizeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  sizeChipSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  sizeChipText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary },
  sizeChipTextSelected: { color: colors.primary[600], fontWeight: typography.fontWeight.bold },
  rowFields: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
});
