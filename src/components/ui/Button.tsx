import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import { borderRadius } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const HEIGHT_MAP: Record<ButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 48,
};

const FONT_SIZE_MAP: Record<ButtonSize, number> = {
  sm: typography.fontSize.sm,
  md: typography.fontSize.base,
  lg: typography.fontSize.md,
};

const ICON_SIZE_MAP: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

const PADDING_MAP: Record<ButtonSize, number> = {
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    {
      height: HEIGHT_MAP[size],
      paddingHorizontal: PADDING_MAP[size],
    } as ViewStyle,
    variantStyles[variant].container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.label,
    {
      fontSize: FONT_SIZE_MAP[size],
    } as TextStyle,
    variantStyles[variant].text,
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const iconColor = isDisabled
    ? colors.gray[400]
    : variantStyles[variant].iconColor;

  const spinnerColor =
    variant === 'primary' ? colors.white : colors.primary[500];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={ICON_SIZE_MAP[size]}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={textStyles}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; iconColor: string }
> = {
  primary: {
    container: {
      backgroundColor: colors.primary[500],
    },
    text: {
      color: colors.text.inverse,
    },
    iconColor: colors.text.inverse,
  },
  secondary: {
    container: {
      backgroundColor: colors.primary[100],
    },
    text: {
      color: colors.primary[500],
    },
    iconColor: colors.primary[500],
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary[500],
    },
    text: {
      color: colors.primary[500],
    },
    iconColor: colors.primary[500],
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: colors.primary[500],
    },
    iconColor: colors.primary[500],
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minWidth: 44,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.2,
  },
  icon: {
    marginRight: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
    opacity: 0.7,
  },
  disabledText: {
    color: colors.gray[400],
  },
});
