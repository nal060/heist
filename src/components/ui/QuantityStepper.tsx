import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.button, atMin && styles.buttonDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
      >
        <Ionicons
          name="remove"
          size={20}
          color={atMin ? colors.gray[400] : colors.primary[500]}
        />
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        style={[styles.button, atMax && styles.buttonDisabled]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={atMax}
      >
        <Ionicons
          name="add"
          size={20}
          color={atMax ? colors.gray[400] : colors.primary[500]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: colors.gray[300],
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
});
