import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme';
import { typography } from '../../theme';

type LogoSize = 'sm' | 'md' | 'lg';

interface BusinessLogoProps {
  imageUrl?: string | null;
  name: string;
  size?: LogoSize;
}

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

const FONT_SIZE_MAP: Record<LogoSize, number> = {
  sm: typography.fontSize.sm,
  md: typography.fontSize.lg,
  lg: typography.fontSize.xl,
};

const FALLBACK_COLORS = [
  '#D32F2F',
  '#1976D2',
  '#388E3C',
  '#F57C00',
  '#7B1FA2',
  '#00796B',
  '#5D4037',
  '#455A64',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export default function BusinessLogo({
  imageUrl,
  name,
  size = 'md',
}: BusinessLogoProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const initial = name.charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <View
        style={[
          styles.container,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  const bgColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.container,
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.white,
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
