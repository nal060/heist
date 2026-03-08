import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import ScreenShell from '../../src/components/ui/ScreenShell';
import BagSummaryCard from '../../src/components/ui/BagSummaryCard';
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
  const params = useLocalSearchParams<{
    bagTitle: string;
    bagPrice: string;
    bagValue: string;
    bagQuantity: string;
  }>();

  return (
    <ScreenShell
      showBackButton={false}
      containerStyle={styles.topPadding}
      footer={
        <>
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
        </>
      }
    >
      <View style={styles.celebrationIcon}>
        <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
      </View>

      <Text style={styles.title}>{strings.bagWhatsNext.title}</Text>
      <Text style={styles.subtitle}>{strings.bagWhatsNext.subtitle}</Text>

      <BagSummaryCard
        title={params.bagTitle || ''}
        quantity={params.bagQuantity}
        quantityLabel={strings.bagWhatsNext.perDay}
        price={params.bagPrice || ''}
        originalPrice={params.bagValue || ''}
        centered
      />

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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topPadding: {
    paddingTop: spacing.xxl,
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
});
