import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import type { BagStatus } from '../../src/types';

// ─── Time slots ───────────────────────────────────────────────────────────────

function generateTimeSlots() {
  const slots: { label: string; value: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${m === 0 ? '00' : '30'} ${ampm}`;
      const value = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}:00`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

// ─── Date options ─────────────────────────────────────────────────────────────

function getDateOptions() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return [
    { label: 'Today', value: fmt(today) },
    { label: 'Tomorrow', value: fmt(tomorrow) },
  ];
}

const DATE_OPTIONS = getDateOptions();

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.fieldError}>
      <Ionicons name="alert-circle" size={13} color={colors.error} />
      <Text style={styles.fieldErrorText}>{message}</Text>
    </View>
  );
}

function TimePicker({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = TIME_SLOTS.find((s) => s.value === value);

  return (
    <>
      <View style={styles.timePickerWrap}>
        <FormLabel>{label}</FormLabel>
        <TouchableOpacity
          style={[styles.timePickerBtn, error && styles.inputErrorBorder]}
          onPress={() => setOpen(true)}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={error ? colors.error : colors.text.secondary}
          />
          <Text style={[styles.timePickerText, !selected && styles.timePlaceholder]}>
            {selected ? selected.label : 'Select time'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.timeList}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors.primary[500]} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // Local string so the field can be empty while the user is mid-type
  const [inputVal, setInputVal] = useState(String(value));

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    const clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 99);
    onChange(clamped);
    setInputVal(String(clamped));
  };

  const handleStepperPress = (next: number) => {
    onChange(next);
    setInputVal(String(next));
  };

  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= 1 && styles.stepperBtnDisabled]}
        onPress={() => handleStepperPress(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Ionicons name="remove" size={18} color={value <= 1 ? colors.gray[300] : colors.text.primary} />
      </TouchableOpacity>
      <TextInput
        style={styles.stepperValue}
        value={inputVal}
        onChangeText={(t) => setInputVal(t.replace(/[^0-9]/g, ''))}
        onBlur={() => commit(inputVal)}
        keyboardType="number-pad"
        maxLength={2}
        textAlign="center"
        selectTextOnFocus
      />
      <TouchableOpacity
        style={[styles.stepperBtn, value >= 99 && styles.stepperBtnDisabled]}
        onPress={() => handleStepperPress(Math.min(99, value + 1))}
        disabled={value >= 99}
      >
        <Ionicons name="add" size={18} color={value >= 99 ? colors.gray[300] : colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  date: string;
  pickupStart: string;
  pickupEnd: string;
  quantityTotal: number;
};

export default function CreateBagScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    date: DATE_OPTIONS[0].value,
    pickupStart: '',
    pickupEnd: '',
    quantityTotal: 5,
  });

  const set = (key: keyof FormState) => (val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setPrice = (key: 'originalPrice' | 'discountedPrice') => (raw: string) => {
    // Strip everything except digits and decimal point, allow only one "."
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    set(key)(sanitized);
  };

  // ── Derived validation ──────────────────────────────────────────────────────

  const origNum = parseFloat(form.originalPrice);
  const discNum = parseFloat(form.discountedPrice);

  const hasBothPrices =
    form.originalPrice !== '' &&
    form.discountedPrice !== '' &&
    !isNaN(origNum) &&
    !isNaN(discNum);

  const pricingError: string | null = hasBothPrices
    ? discNum >= origNum
      ? 'Selling price must be lower than the original price.'
      : null
    : null;

  const timeError: string | null =
    form.pickupStart && form.pickupEnd && form.pickupEnd <= form.pickupStart
      ? 'End time must be after the start time.'
      : null;

  const discountPct =
    hasBothPrices && discNum < origNum
      ? Math.round((1 - discNum / origNum) * 100)
      : null;

  // A bag can be published only when all required fields are filled and no errors
  const canPublish =
    form.title.trim() !== '' &&
    hasBothPrices &&
    pricingError === null &&
    form.pickupStart !== '' &&
    form.pickupEnd !== '' &&
    timeError === null;

  const handleSave = (status: BagStatus) => {
    if (status === 'active' && !canPublish) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      original_price: origNum,
      discounted_price: discNum,
      date: form.date,
      pickup_start_time: form.pickupStart,
      pickup_end_time: form.pickupEnd,
      quantity_total: form.quantityTotal,
      quantity_available: form.quantityTotal,
      status,
    };
    console.log('Save bag:', payload);

    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Bag</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bag Details */}
          <FormSection title="Bag Details">
            <FormLabel>Bag Name *</FormLabel>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bakery Surprise Box"
              placeholderTextColor={colors.text.tertiary}
              value={form.title}
              onChangeText={set('title')}
              returnKeyType="next"
            />

            <FormLabel>Description</FormLabel>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Tell customers what's inside…"
              placeholderTextColor={colors.text.tertiary}
              value={form.description}
              onChangeText={set('description')}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormSection>

          {/* Pricing */}
          <FormSection title="Pricing">
            <View style={styles.priceRow}>
              <View style={styles.priceField}>
                <FormLabel>Original Price *</FormLabel>
                <View style={styles.currencyInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.currencyTextInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    value={form.originalPrice}
                    onChangeText={setPrice('originalPrice')}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.priceField}>
                <FormLabel>Selling Price *</FormLabel>
                <View style={[styles.currencyInput, pricingError ? styles.inputErrorBorder : null]}>
                  <Text style={[styles.currencySymbol, pricingError ? styles.errorText : null]}>$</Text>
                  <TextInput
                    style={styles.currencyTextInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    value={form.discountedPrice}
                    onChangeText={setPrice('discountedPrice')}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {pricingError ? (
              <FieldError message={pricingError} />
            ) : discountPct !== null && discountPct > 0 ? (
              <View style={styles.savingsBanner}>
                <Ionicons name="pricetag-outline" size={14} color="#2E7D32" />
                <Text style={styles.savingsText}>
                  Customers save {discountPct}% off the original price
                </Text>
              </View>
            ) : null}
          </FormSection>

          {/* Pickup */}
          <FormSection title="Pickup">
            <FormLabel>Date *</FormLabel>
            <View style={styles.dateRow}>
              {DATE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.datePill, form.date === opt.value && styles.datePillActive]}
                  onPress={() => set('date')(opt.value)}
                >
                  <Text
                    style={[
                      styles.datePillText,
                      form.date === opt.value && styles.datePillTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <TimePicker
                  label="Start Time *"
                  value={form.pickupStart}
                  onChange={(v) => set('pickupStart')(v)}
                />
              </View>
              <View style={styles.timeSeparator}>
                <Text style={styles.timeSeparatorText}>→</Text>
              </View>
              <View style={styles.timeField}>
                <TimePicker
                  label="End Time *"
                  value={form.pickupEnd}
                  onChange={(v) => set('pickupEnd')(v)}
                  error={!!timeError}
                />
              </View>
            </View>

            {timeError && <FieldError message={timeError} />}
          </FormSection>

          {/* Quantity */}
          <FormSection title="Quantity">
            <FormLabel>Number of Bags Available *</FormLabel>
            <QuantityStepper value={form.quantityTotal} onChange={(v) => set('quantityTotal')(v)} />
          </FormSection>

          <View style={{ height: spacing.xxxxl }} />
        </ScrollView>

        {/* Footer actions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={styles.draftBtn}
            onPress={() => handleSave('draft')}
          >
            <Text style={styles.draftBtnText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
            onPress={() => handleSave('active')}
            disabled={!canPublish}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
            <Text style={styles.publishBtnText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 36,
  },

  // Scroll
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Section
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  // Label
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Inputs
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  inputErrorBorder: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    color: colors.error,
  },

  // Inline field error
  fieldError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fieldErrorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priceField: {
    flex: 1,
    gap: spacing.xs,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginRight: 4,
  },
  currencyTextInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    color: '#2E7D32',
    fontWeight: typography.fontWeight.medium,
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  datePill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  datePillActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  datePillText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  datePillTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },

  // Time row
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  timeField: {
    flex: 1,
  },
  timeSeparator: {
    paddingBottom: spacing.sm,
  },
  timeSeparatorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // Time picker
  timePickerWrap: {
    gap: spacing.xs,
  },
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timePickerText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  timePlaceholder: {
    color: colors.text.tertiary,
  },

  // Time modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  timeList: {
    paddingVertical: spacing.sm,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  timeOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  timeOptionTextSelected: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },

  // Quantity stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    width: 52,
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  quantityHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  draftBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  publishBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  publishBtnDisabled: {
    backgroundColor: colors.gray[300],
  },
  publishBtnText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
