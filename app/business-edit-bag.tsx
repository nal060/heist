import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../src/theme';
import { strings } from '../src/constants/strings';
import { updateSurplusBag } from '../src/data/auth';
import { supabase } from '../src/lib/supabase';
import { type BagSize } from '../src/constants/app';
import type { SurplusBag, BagSizeType } from '../src/types';
import ScreenShell from '../src/components/ui/ScreenShell';
import FormField from '../src/components/ui/FormField';
import CurrencyInput from '../src/components/ui/CurrencyInput';
import Button from '../src/components/ui/Button';

const SIZES: { key: BagSize; label: string }[] = [
  { key: 'small', label: strings.bagSizeSetup.small },
  { key: 'medium', label: strings.bagSizeSetup.medium },
  { key: 'large', label: strings.bagSizeSetup.large },
];

export default function BusinessEditBagScreen() {
  const router = useRouter();
  const { bagId } = useLocalSearchParams<{ bagId: string }>();

  const [bag, setBag] = useState<SurplusBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSize, setSelectedSize] = useState<BagSizeType>('medium');
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const loadBag = useCallback(async () => {
    if (!bagId) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('surplus_bags').select('*').eq('id', bagId).single();
      if (fetchError) throw new Error(fetchError.message);
      setBag(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setSelectedSize(data.bag_size || 'medium');
      setValue(String(data.value || data.original_price));
      setPrice(String(data.discounted_price));
      setQuantity(String(data.quantity_total));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bagId]);

  useEffect(() => { loadBag(); }, [loadBag]);

  const handleSave = async () => {
    if (!bag || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateSurplusBag(bag.id, {
        title: title.trim(),
        description: description.trim() || null,
        bag_size: selectedSize,
        value: parseFloat(value) || bag.value,
        original_price: parseFloat(value) || bag.original_price,
        discounted_price: parseFloat(price) || bag.discounted_price,
        quantity_total: parseInt(quantity, 10) || bag.quantity_total,
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!bag) return;
    setSaving(true);
    setError(null);
    try {
      const newStatus = bag.status === 'active' ? 'draft' : 'active';
      const updated = await updateSurplusBag(bag.id, { status: newStatus });
      setBag(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      keyboardAvoiding
      loading={loading}
      loadingError={!bag ? error : undefined}
      onRetry={loadBag}
      error={!loading && bag && error ? error : undefined}
      footer={
        <Button
          label={strings.businessProfileEdit.save}
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
        <Text style={styles.screenTitle}>{strings.bagNameSetup.title}</Text>
        {bag && (
          <TouchableOpacity
            style={[styles.statusBadge, bag.status === 'active' ? styles.statusActive : styles.statusDraft]}
            onPress={handleToggleStatus}
          >
            <Text style={[styles.statusText, bag.status === 'active' ? styles.statusTextActive : styles.statusTextDraft]}>
              {strings.businessBags.status[bag.status] || bag.status}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FormField label={strings.bagNameSetup.nameLabel} value={title} onChangeText={setTitle} />
      <FormField label={strings.bagNameSetup.descriptionLabel} value={description} onChangeText={setDescription} multiline />

      {/* Size selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{strings.bagSizeSetup.title}</Text>
        <View style={styles.sizeRow}>
          {SIZES.map((size) => (
            <TouchableOpacity
              key={size.key}
              style={[styles.sizeChip, selectedSize === size.key && styles.sizeChipSelected]}
              onPress={() => setSelectedSize(size.key)}
            >
              <Text style={[styles.sizeChipText, selectedSize === size.key && styles.sizeChipTextSelected]}>
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Value and Price */}
      <View style={styles.rowFields}>
        <CurrencyInput label={strings.bagSizeSetup.minValue} value={value} onChangeText={setValue} />
        <CurrencyInput label={strings.bagSizeSetup.priceInApp} value={price} onChangeText={setPrice} />
      </View>

      <FormField label={strings.bagQuantitySetup.title} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
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
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
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
