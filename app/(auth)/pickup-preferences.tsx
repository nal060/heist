import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { saveUserPreference } from '../../src/data/auth';
import ScreenShell from '../../src/components/ui/ScreenShell';
import MultiSelectList from '../../src/components/ui/MultiSelectList';
import PageDots from '../../src/components/ui/PageDots';
import Button from '../../src/components/ui/Button';

const OPTIONS = [
  { key: 'earlyMorning', label: strings.pickupPreferences.options.earlyMorning },
  { key: 'lateMorning', label: strings.pickupPreferences.options.lateMorning },
  { key: 'midday', label: strings.pickupPreferences.options.midday },
  { key: 'afternoon', label: strings.pickupPreferences.options.afternoon },
  { key: 'evening', label: strings.pickupPreferences.options.evening },
  { key: 'lateNight', label: strings.pickupPreferences.options.lateNight },
];

export default function PickupPreferencesScreen() {
  const router = useRouter();
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
        await saveUserPreference(user.id, 'pickup_times', Array.from(selected));
      }
    } catch {
      // Continue even if save fails
    } finally {
      setSaving(false);
      router.push({ pathname: '/(auth)/user-location', params: { countryId } });
    }
  };

  return (
    <ScreenShell
      title={strings.pickupPreferences.title}
      subtitle={strings.pickupPreferences.subtitle}
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
      footer={
        <>
          <PageDots total={3} current={1} />
          <Button label={strings.common.next} onPress={handleNext} size="lg" fullWidth loading={saving} />
        </>
      }
    >
      <Text style={styles.selectLabel}>{strings.pickupPreferences.selectAll}</Text>
      <MultiSelectList options={OPTIONS} selected={selected} onToggle={toggle} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
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
});
