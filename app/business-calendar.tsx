import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';
import { saveBagSchedule, getBagSchedule } from '../src/data/auth';
import { DAYS_OF_WEEK } from '../src/constants/app';
import type { BagPickupSchedule } from '../src/types';
import ScreenShell from '../src/components/ui/ScreenShell';
import DayScheduleEditor, { type DaySchedule } from '../src/components/ui/DayScheduleEditor';
import Button from '../src/components/ui/Button';

const DEFAULT_START = '17:00';
const DEFAULT_END = '18:00';

export default function BusinessCalendarScreen() {
  const router = useRouter();
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

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

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

  return (
    <ScreenShell
      title={strings.businessCalendar.title}
      subtitle={strings.businessCalendar.calendarDescription}
      loading={loading}
      loadingError={!bagId && !loading ? error : undefined}
      onRetry={loadSchedule}
      error={!loading && bagId && error ? error : undefined}
      footer={
        <Button
          label={strings.businessProfileEdit.save}
          onPress={handleSave}
          size="lg"
          fullWidth
          loading={saving}
          disabled={!bagId}
        />
      }
    >
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

      <DayScheduleEditor
        schedule={schedule}
        onToggleDay={toggleDay}
        onUpdateTime={updateTime}
      />

      <Text style={styles.hint}>{strings.businessCalendar.tapToEdit}</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});
