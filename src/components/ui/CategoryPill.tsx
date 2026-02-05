import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import { borderRadius } from '../../theme';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function CategoryPill({
  label,
  isActive,
  onPress,
  icon,
}: CategoryPillProps) {
  const containerStyle: ViewStyle[] = [
    styles.container,
    isActive ? styles.active : styles.inactive,
  ];

  const textColor = isActive ? colors.text.inverse : colors.gray[800];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={18}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[styles.label, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    minWidth: 44,
  },
  active: {
    backgroundColor: colors.primary[500],
  },
  inactive: {
    backgroundColor: colors.gray[100],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
