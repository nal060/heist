import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import Button from '../../src/components/ui/Button';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{strings.orderConfirmation.title}</Text>
        <Text style={styles.subtitle}>{strings.orderConfirmation.subtitle}</Text>

        {/* Pickup Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{strings.orderConfirmation.pickupCode}</Text>
          <Text style={styles.codeValue}>{pickupCode}</Text>
        </View>

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.reminderText}>
            {strings.orderConfirmation.pickupReminder}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          label={strings.orderConfirmation.viewOrders}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.replace('/order-history')}
        />
        <View style={styles.buttonSpacer} />
        <Button
          label={strings.orderConfirmation.keepExploring}
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.replace('/(tabs)/')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  codeCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  codeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  reminderText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  buttons: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  buttonSpacer: {
    height: spacing.md,
  },
});
