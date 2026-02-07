import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';

interface LocationHeaderProps {
  location: string;
  onPress?: () => void;
  paddingTop?: number;
}

export default function LocationHeader({
  location,
  onPress,
  paddingTop,
}: LocationHeaderProps) {
  const content = (
    <View style={[styles.container, paddingTop != null && { paddingTop: paddingTop + spacing.md }]}>
      <View style={styles.row}>
        <Ionicons
          name="location-sharp"
          size={18}
          color={colors.text.inverse}
          style={styles.pinIcon}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.label}>Ubicacion actual</Text>
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
        {onPress && (
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.text.inverse}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Ubicacion: ${location}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: spacing.sm,
  },
  textWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  location: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
