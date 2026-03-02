import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import Button from '../../src/components/ui/Button';

const STEPS = [
  {
    icon: 'storefront-outline' as const,
    title: strings.bagWhatsNext.step1Title,
    description: strings.bagWhatsNext.step1Description,
  },
  {
    icon: 'card-outline' as const,
    title: strings.bagWhatsNext.step2Title,
    description: strings.bagWhatsNext.step2Description,
  },
  {
    icon: 'cash-outline' as const,
    title: strings.bagWhatsNext.step3Title,
    description: strings.bagWhatsNext.step3Description,
  },
];

export default function BagWhatsNextScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bagTitle: string;
    bagPrice: string;
    bagValue: string;
    bagQuantity: string;
  }>();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxl }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.celebrationIcon}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
        </View>

        <Text style={styles.title}>{strings.bagWhatsNext.title}</Text>
        <Text style={styles.subtitle}>{strings.bagWhatsNext.subtitle}</Text>

        {/* Bag summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{params.bagTitle}</Text>
          <Text style={styles.summaryDetail}>
            {params.bagQuantity} {strings.bagWhatsNext.perDay}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.summaryPrice}>USD {params.bagPrice}</Text>
            <Text style={styles.summaryOriginal}>USD {params.bagValue}</Text>
          </View>
        </View>

        {/* What's next section */}
        <Text style={styles.whatsNextTitle}>{strings.bagWhatsNext.whatsNextTitle}</Text>
        <Text style={styles.whatsNextSubtitle}>{strings.bagWhatsNext.whatsNextSubtitle}</Text>

        <View style={styles.stepsList}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIconContainer}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                {index < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name={step.icon} size={20} color={colors.primary[500]} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.bagWhatsNext.startSelling}
          onPress={() => router.replace('/(business-tabs)')}
          size="lg"
          fullWidth
        />
        <Button
          label={strings.bagWhatsNext.maybeLater}
          onPress={() => router.replace('/(business-tabs)')}
          variant="ghost"
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
  scroll: {
    flex: 1,
  },
  celebrationIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: typography.fontSize.md,
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
  whatsNextTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  whatsNextSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  stepsList: {
    gap: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  stepIconContainer: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.xs,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  footer: {
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
});
