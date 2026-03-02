import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { saveUserPreference } from '../../src/data/auth';
import Button from '../../src/components/ui/Button';

const PREFERENCE_OPTIONS = [
  { key: 'groceries', label: strings.userPreferences.options.groceries },
  { key: 'saveMoney', label: strings.userPreferences.options.saveMoney },
  { key: 'treats', label: strings.userPreferences.options.treats },
  { key: 'mealOptions', label: strings.userPreferences.options.mealOptions },
  { key: 'immediateMeal', label: strings.userPreferences.options.immediateMeal },
  { key: 'explore', label: strings.userPreferences.options.explore },
];

export default function UserPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { countryId } = useLocalSearchParams<{ countryId: string }>();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleNext = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (selected.size > 0) {
        await saveUserPreference(user.id, 'what_brings_you', Array.from(selected));
      }
      router.push({
        pathname: '/(auth)/pickup-preferences',
        params: { countryId },
      });
    } catch {
      // Continue even if save fails
      router.push({
        pathname: '/(auth)/pickup-preferences',
        params: { countryId },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{strings.userPreferences.whatBringsTitle}</Text>
        <Text style={styles.subtitle}>{strings.userPreferences.whatBringsSubtitle}</Text>
        <Text style={styles.selectLabel}>{strings.userPreferences.selectAll}</Text>

        <View style={styles.optionsList}>
          {PREFERENCE_OPTIONS.map((option) => {
            const isSelected = selected.has(option.key);
            return (
              <TouchableOpacity
                key={option.key}
                style={styles.optionRow}
                onPress={() => toggle(option.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <View style={[styles.circle, isSelected && styles.circleSelected]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Page indicator */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.common.next}
          onPress={handleNext}
          size="lg"
          fullWidth
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  selectLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginRight: spacing.md,
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
