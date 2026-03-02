import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { borderRadius } from '../../theme';

interface RecommendationBoxProps {
  title?: string;
  message: string;
}

export default function RecommendationBox({ title, message }: RecommendationBoxProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.header}>
          <Ionicons name="bulb-outline" size={16} color={colors.primary[700]} />
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
