import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function IconButton({
  icon,
  onPress,
  size = 40,
  iconSize,
  color = colors.text.primary,
  backgroundColor = colors.gray[100],
  style,
}: IconButtonProps) {
  const resolvedIconSize = iconSize ?? Math.round(size * 0.5);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={resolvedIconSize} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
});
