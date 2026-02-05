import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../../theme';
import { shadows, borderRadius } from '../../theme';

type CardVariant = 'default' | 'flat';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
}

export default function Card({
  children,
  onPress,
  style,
  variant = 'default',
}: CardProps) {
  const cardStyles: StyleProp<ViewStyle>[] = [
    styles.base,
    variant === 'default' && styles.elevated,
    variant === 'flat' && styles.flat,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.md,
  } as ViewStyle,
  flat: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
});
