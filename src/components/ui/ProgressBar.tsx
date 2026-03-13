import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { borderRadius } from '../../theme';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    <View style={styles.container}>
      {segments.map((i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < current ? styles.segmentFilled : styles.segmentEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: borderRadius.sm,
  },
  segmentFilled: {
    backgroundColor: colors.primary[500],
  },
  segmentEmpty: {
    backgroundColor: colors.gray[200],
  },
});
