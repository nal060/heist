import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NoticeVariant = 'success' | 'error' | 'warning';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface NoticeCardProps {
  message: string;
  variant: NoticeVariant;
  icon?: IoniconsName;
}

const VARIANT_CONFIG: Record<NoticeVariant, { bg: string; color: string; icon: IoniconsName }> = {
  success: { bg: '#E8F5E9', color: '#2E7D32', icon: 'checkmark-circle-outline' },
  error:   { bg: '#FFEBEE', color: colors.error, icon: 'alert-circle-outline' },
  warning: { bg: '#FFF8E1', color: '#F57F17', icon: 'warning-outline' },
};

export default function NoticeCard({ message, variant, icon }: NoticeCardProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View style={[styles.notice, { backgroundColor: config.bg }]}>
      <Ionicons name={icon ?? config.icon} size={16} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
});
