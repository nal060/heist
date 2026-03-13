import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  /** Hide back button (e.g. first screen in flow) */
  hideBack?: boolean;
  /** Optional right-side element */
  right?: React.ReactNode;
}

export default function ScreenHeader({ title, onBack, hideBack, right }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {hideBack ? (
        <View style={styles.placeholder} />
      ) : (
        <TouchableOpacity onPress={onBack ?? (() => router.back())} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {right ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
