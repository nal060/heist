import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsRowProps {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
  /** Red text/icon for destructive actions like logout or delete */
  danger?: boolean;
  /** Hide the chevron (e.g. for logout/delete rows) */
  hideChevron?: boolean;
}

export default function SettingsRow({ icon, label, onPress, danger, hideChevron }: SettingsRowProps) {
  const iconColor = danger ? colors.error : colors.text.primary;
  const textColor = danger ? colors.error : colors.text.primary;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {!hideChevron && !danger && (
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
  },
});
