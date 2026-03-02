import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';
import { saveBagSchedule, getBagSchedule } from '../src/data/auth';
import { DAYS_OF_WEEK } from '../src/constants/app';
import type { BagPickupSchedule } from '../src/types';
import Button from '../src/components/ui/Button';
import ErrorState from '../src/components/ui/ErrorState';

interface DaySchedule {
  active: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_START = '17:00';
const DEFAULT_END = '18:00';

export default function BusinessCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [bagId, setBagId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const init: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((day) => {
      init[day.key] = { active: false, startTime: DEFAULT_START, endTime: DEFAULT_END };
    });
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!business) throw new Error(strings.common.error);

      // Get the first bag for this business
      const { data: bags } = await supabase
        .from('surplus_bags')
        .select('id')
        .eq('business_id', business.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (!bags || bags.length === 0) {
        setLoading(false);
        return;
      }

      setBagId(bags[0].id);
      const scheduleData = await getBagSchedule(bags[0].id);

      if (scheduleData.length > 0) {
        setSchedule((prev) => {
          const updated = { ...prev };
          scheduleData.forEach((entry: BagPickupSchedule) => {
            const day = DAYS_OF_WEEK[entry.day_of_week];
            if (day) {
              updated[day.key] = {
                active: entry.is_active,
                startTime: entry.start_time.slice(0, 5),
                endTime: entry.end_time.slice(0, 5),
              };
            }
          });
          return updated;
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const toggleDay = (key: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active },
    }));
  };

  const updateTime = (key: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!bagId) return;
    setSaving(true);
    setError(null);

    try {
      const scheduleData = DAYS_OF_WEEK
        .filter((d) => schedule[d.key].active)
        .map((d) => ({
          dayOfWeek: DAYS_OF_WEEK.indexOf(d),
          startTime: schedule[d.key].startTime,
          endTime: schedule[d.key].endTime,
          isActive: true,
        }));

      await saveBagSchedule(bagId, scheduleData);
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error && !bagId) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={loadSchedule} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.businessCalendar.title}</Text>
        <Text style={styles.description}>{strings.businessCalendar.calendarDescription}</Text>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
            <Text style={styles.legendText}>{strings.businessCalendar.pickup}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.gray[300] }]} />
            <Text style={styles.legendText}>{strings.businessCalendar.noPickup}</Text>
          </View>
        </View>

        {/* Day rows */}
        <View style={styles.daysList}>
          {DAYS_OF_WEEK.map((day) => {
            const dayData = schedule[day.key];
            return (
              <View key={day.key} style={styles.dayRow}>
                <TouchableOpacity
                  style={[styles.checkbox, dayData.active && styles.checkboxChecked]}
                  onPress={() => toggleDay(day.key)}
                >
                  {dayData.active && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </TouchableOpacity>
                <Text style={[styles.dayLabel, !dayData.active && styles.dayLabelInactive]}>
                  {day.label}
                </Text>
                {dayData.active ? (
                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={dayData.startTime}
                      onChangeText={(t) => updateTime(day.key, 'startTime', t)}
                      placeholder="17:00"
                      placeholderTextColor={colors.gray[400]}
                    />
                    <Text style={styles.timeDash}>-</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={dayData.endTime}
                      onChangeText={(t) => updateTime(day.key, 'endTime', t)}
                      placeholder="18:00"
                      placeholderTextColor={colors.gray[400]}
                    />
                  </View>
                ) : (
                  <View style={styles.timeRow}>
                    <Text style={styles.inactiveTime}>--:--</Text>
                    <Text style={styles.timeDash}>-</Text>
                    <Text style={styles.inactiveTime}>--:--</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>{strings.businessCalendar.tapToEdit}</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.businessProfileEdit.save}
          onPress={handleSave}
          size="lg"
          fullWidth
          loading={saving}
          disabled={!bagId}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
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
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  daysList: {
    gap: spacing.md,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  dayLabel: {
    width: 40,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  dayLabelInactive: {
    color: colors.text.tertiary,
  },
  timeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  timeDash: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  inactiveTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    minWidth: 80,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
