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
  return (
    <View style={[styles.container, paddingTop != null && { paddingTop: paddingTop + spacing.md }]}>
      <View style={styles.row}>

        {onPress && (
          <TouchableOpacity
            onPress={onPress}
            hitSlop={8}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cambiar ubicacion"
          >
          <Ionicons
            name="location-sharp"
            size={18}
            color={colors.text.inverse}
            style={styles.pinIcon}
          />
          </TouchableOpacity>
        )}

        <View style={styles.textWrapper}>
          <Text style={styles.label}>Ubicacion actual</Text>
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

      </View>
    </View>
  );
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
