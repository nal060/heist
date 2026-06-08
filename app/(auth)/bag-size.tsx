import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { BAG_SIZES, type BagSize } from '../../src/constants/app';
import ScreenShell from '../../src/components/ui/ScreenShell';
import RadioButton from '../../src/components/ui/RadioButton';
import RecommendationBox from '../../src/components/ui/RecommendationBox';
import HelpSection from '../../src/components/ui/HelpSection';
import Button from '../../src/components/ui/Button';

const SIZES: { key: BagSize; label: string }[] = [
  { key: 'small', label: strings.bagSizeSetup.small },
  { key: 'medium', label: strings.bagSizeSetup.medium },
  { key: 'large', label: strings.bagSizeSetup.large },
];

const HELP_ITEMS = [
  { question: strings.bagSizeSetup.helpItems.sizeQuestion, answer: strings.bagSizeSetup.helpItems.sizeAnswer },
  { question: strings.bagSizeSetup.helpItems.earningsQuestion, answer: strings.bagSizeSetup.helpItems.earningsAnswer },
  { question: strings.bagSizeSetup.helpItems.valueQuestion, answer: strings.bagSizeSetup.helpItems.valueAnswer },
  { question: strings.bagSizeSetup.helpItems.payoutsQuestion, answer: strings.bagSizeSetup.helpItems.payoutsAnswer },
  { question: strings.bagSizeSetup.helpItems.costQuestion, answer: strings.bagSizeSetup.helpItems.costAnswer },
];

export default function BagSizeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedSize, setSelectedSize] = useState<BagSize | null>(null);
  const [values, setValues] = useState<Record<BagSize, { value: string; price: string }>>({
    small: { value: String(BAG_SIZES.small.value), price: String(BAG_SIZES.small.price) },
    medium: { value: String(BAG_SIZES.medium.value), price: String(BAG_SIZES.medium.price) },
    large: { value: String(BAG_SIZES.large.value), price: String(BAG_SIZES.large.price) },
  });

  const updateValue = (size: BagSize, field: 'value' | 'price', text: string) => {
    setValues((prev) => ({
      ...prev,
      [size]: { ...prev[size], [field]: text },
    }));
  };

  const handleContinue = () => {
    if (!selectedSize) return;
    const chosen = values[selectedSize];
    router.push({
      pathname: '/(auth)/bag-quantity',
      params: { ...params, bagSize: selectedSize, bagValue: chosen.value, bagPrice: chosen.price },
    });
  };

  return (
    <ScreenShell
      title={strings.bagSizeSetup.title}
      subtitle={strings.bagSizeSetup.subtitle}
      progress={{ current: 4, total: 7 }}
      footer={
        <Button
          label={strings.bagSizeSetup.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={!selectedSize}
        />
      }
    >
      <View style={styles.sizeList}>
        {SIZES.map((size) => {
          const isSelected = selectedSize === size.key;
          const isRecommended = size.key === 'medium';
          const sizeValues = values[size.key];

          return (
            <View key={size.key}>
              {isRecommended && (
                <Text style={styles.recommendedLabel}>
                  {strings.bagSizeSetup.recommendedForYou}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.sizeCard, isSelected && styles.sizeCardSelected]}
                onPress={() => setSelectedSize(size.key)}
                activeOpacity={0.7}
              >
                <View style={styles.sizeLeft}>
                  <RadioButton selected={isSelected} />
                  <Text style={styles.sizeName}>{size.label}</Text>
                </View>
                <View style={styles.sizeRight}>
                  <View style={styles.editableRow}>
                    <Text style={styles.currency}>USD </Text>
                    <TextInput
                      style={styles.editableInput}
                      value={sizeValues.value}
                      onChangeText={(t) => updateValue(size.key, 'value', t)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Text style={styles.sizeSubLabel}>{strings.bagSizeSetup.minValue}</Text>
                  <View style={styles.editableRow}>
                    <Text style={styles.currency}>USD </Text>
                    <TextInput
                      style={styles.editableInput}
                      value={sizeValues.price}
                      onChangeText={(t) => updateValue(size.key, 'price', t)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Text style={styles.sizeSubLabel}>{strings.bagSizeSetup.priceInApp}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <RecommendationBox
        title={strings.bagSizeSetup.recommendedForYou}
        message={strings.bagSizeSetup.recommendationMessage}
      />

      <HelpSection items={HELP_ITEMS} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sizeList: {
    gap: spacing.sm,
  },
  recommendedLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    backgroundColor: colors.primary[50],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  sizeCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  sizeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sizeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sizeRight: {
    alignItems: 'flex-end',
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  editableInput: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    minWidth: 50,
    textAlign: 'right',
    paddingVertical: 0,
  },
  sizeSubLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
});
