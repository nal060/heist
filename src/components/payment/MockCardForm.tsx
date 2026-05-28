import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { colors, spacing, typography } from '../../theme';
import { strings } from '../../constants/strings';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_SUCCESS_PARAMS: Record<string, string> = {
  card_token: 'MOCK_TOKEN_abc123',
  last_four: '1111',
  brand: 'visa',
  expiry_month: '12',
  expiry_year: '2028',
};

const MOCK_ERROR_PARAMS: Record<string, string> = {
  error: 'card_declined',
};

const SIMULATION_DELAY_MS = 2000;

// ─── Banner background and text — match badge.remaining palette ───────────────
const BANNER_BG = colors.badge.remaining.bg;
const BANNER_TEXT = colors.badge.remaining.text;

// ─── Props ────────────────────────────────────────────────────────────────────

interface MockCardFormProps {
  onSuccess: (params: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MockCardForm({ onSuccess, onCancel, submitLabel = strings.mockCardForm.pay }: MockCardFormProps) {
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);

  const handlePay = useCallback(() => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess(MOCK_SUCCESS_PARAMS);
    }, SIMULATION_DELAY_MS);
  }, [onSuccess]);

  const handleSimulateError = useCallback(() => {
    onSuccess(MOCK_ERROR_PARAMS);
  }, [onSuccess]);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {strings.mockCardForm.simulationBanner}
        </Text>
      </View>

      <View style={styles.content}>
        <FormField
          label={strings.mockCardForm.cardNumber}
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="number-pad"
        />

        <FormField
          label={strings.mockCardForm.expiry}
          value={expiry}
          onChangeText={setExpiry}
          keyboardType="number-pad"
        />

        <FormField
          label={strings.mockCardForm.cvv}
          value={cvv}
          onChangeText={setCvv}
          keyboardType="number-pad"
        />

        <View style={{ height: spacing.xl }} />

        {processing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.processingText}>
              {strings.mockCardForm.processing}
            </Text>
          </View>
        ) : null}

        <Button
          label={submitLabel}
          onPress={handlePay}
          variant="primary"
          size="lg"
          fullWidth
          disabled={processing}
        />

        <View style={{ height: spacing.md }} />

        <Button
          label={strings.mockCardForm.simulateError}
          onPress={handleSimulateError}
          variant="secondary"
          size="lg"
          fullWidth
          disabled={processing}
        />

        <View style={{ height: spacing.md }} />

        <Button
          label={strings.common.cancel}
          onPress={onCancel}
          variant="ghost"
          size="lg"
          fullWidth
          disabled={processing}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  banner: {
    backgroundColor: BANNER_BG,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: BANNER_TEXT,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  processingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
