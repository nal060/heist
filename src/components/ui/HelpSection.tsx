import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface HelpItem {
  question: string;
  answer: string;
}

interface HelpSectionProps {
  items: HelpItem[];
}

export default function HelpSection({ items }: HelpSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Necesitas ayuda?</Text>
      {items.map((item, index) => (
        <View key={index}>
          <TouchableOpacity
            style={styles.questionRow}
            onPress={() => toggle(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.questionText}>{item.question}</Text>
            <Ionicons
              name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {expandedIndex === index && (
            <Text style={styles.answerText}>{item.answer}</Text>
          )}
          {index < items.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  heading: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginRight: spacing.md,
  },
  answerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
});
