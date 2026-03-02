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
import { DEFAULT_BAG_QUANTITY, MIN_BAG_QUANTITY, MAX_BAG_QUANTITY } from '../../src/constants/app';
import ProgressBar from '../../src/components/ui/ProgressBar';
import RecommendationBox from '../../src/components/ui/RecommendationBox';
import HelpSection from '../../src/components/ui/HelpSection';
import Button from '../../src/components/ui/Button';

const HELP_ITEMS = [
  { question: strings.bagQuantitySetup.helpItems.noFoodQuestion, answer: strings.bagQuantitySetup.helpItems.noFoodAnswer },
  { question: strings.bagQuantitySetup.helpItems.earningsQuestion, answer: strings.bagQuantitySetup.helpItems.earningsAnswer },
];

export default function BagQuantityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [quantity, setQuantity] = useState(DEFAULT_BAG_QUANTITY);

  const increment = () => {
    if (quantity < MAX_BAG_QUANTITY) setQuantity((q) => q + 1);
  };

  const decrement = () => {
    if (quantity > MIN_BAG_QUANTITY) setQuantity((q) => q - 1);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/bag-schedule',
      params: {
        ...params,
        bagQuantity: String(quantity),
      },
    });
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
        <Text style={styles.title}>{strings.bagQuantitySetup.title}</Text>
        <Text style={styles.subtitle}>{strings.bagQuantitySetup.subtitle}</Text>

        {/* Quantity selector */}
        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={[styles.selectorButton, quantity <= MIN_BAG_QUANTITY && styles.selectorDisabled]}
            onPress={decrement}
            disabled={quantity <= MIN_BAG_QUANTITY}
          >
            <Ionicons
              name="remove"
              size={24}
              color={quantity <= MIN_BAG_QUANTITY ? colors.gray[300] : colors.primary[500]}
            />
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>

          <TouchableOpacity
            style={[styles.selectorButton, quantity >= MAX_BAG_QUANTITY && styles.selectorDisabled]}
            onPress={increment}
            disabled={quantity >= MAX_BAG_QUANTITY}
          >
            <Ionicons
              name="add"
              size={24}
              color={quantity >= MAX_BAG_QUANTITY ? colors.gray[300] : colors.primary[500]}
            />
          </TouchableOpacity>
        </View>

        <RecommendationBox
          title={strings.bagQuantitySetup.recommendationTitle}
          message={strings.bagQuantitySetup.recommendationMessage}
        />

        <HelpSection items={HELP_ITEMS} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <ProgressBar current={4} total={6} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.bagQuantitySetup.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
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
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  selectorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  selectorDisabled: {
    borderColor: colors.gray[300],
  },
  quantityDisplay: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  quantityText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
