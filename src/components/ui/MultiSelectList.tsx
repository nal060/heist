import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface MultiSelectOption {
  key: string;
  label: string;
}

interface MultiSelectListProps {
  options: MultiSelectOption[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}

export default function MultiSelectList({ options, selected, onToggle }: MultiSelectListProps) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const isSelected = selected.has(option.key);
        return (
          <TouchableOpacity
            key={option.key}
            style={styles.row}
            onPress={() => onToggle(option.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.text}>{option.label}</Text>
            <View style={[styles.circle, isSelected && styles.circleSelected]}>
              {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
});
