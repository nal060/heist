import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { DAYS_OF_WEEK } from '../../src/constants/app';
import ProgressBar from '../../src/components/ui/ProgressBar';
import RecommendationBox from '../../src/components/ui/RecommendationBox';
import HelpSection from '../../src/components/ui/HelpSection';
import Button from '../../src/components/ui/Button';

interface DaySchedule {
  active: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_START = '17:00';
const DEFAULT_END = '18:00';

const HELP_ITEMS = [
  { question: strings.bagScheduleSetup.helpItems.howSaleWorks, answer: strings.bagScheduleSetup.helpItems.howSaleAnswer },
  { question: strings.bagScheduleSetup.helpItems.earningsQuestion, answer: strings.bagScheduleSetup.helpItems.earningsAnswer },
  { question: strings.bagScheduleSetup.helpItems.pickupWindowQuestion, answer: strings.bagScheduleSetup.helpItems.pickupWindowAnswer },
  { question: strings.bagScheduleSetup.helpItems.noFoodQuestion, answer: strings.bagScheduleSetup.helpItems.noFoodAnswer },
];

export default function BagScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bagPrice: string;
    bagQuantity: string;
  }>();

  const bagPrice = parseFloat(params.bagPrice || '5.99');
  const bagQuantity = parseInt(params.bagQuantity || '3', 10);

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const init: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((day) => {
      init[day.key] = { active: false, startTime: DEFAULT_START, endTime: DEFAULT_END };
    });
    return init;
  });

  const activeDays = useMemo(
    () => DAYS_OF_WEEK.filter((d) => schedule[d.key].active).length,
    [schedule],
  );

  const earningsPerWeek = useMemo(
    () => (bagPrice * bagQuantity * activeDays).toFixed(2),
    [bagPrice, bagQuantity, activeDays],
  );

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

  const editAllDays = () => {
    setSchedule((prev) => {
      const updated = { ...prev };
      const firstActiveDay = DAYS_OF_WEEK.find((d) => prev[d.key].active);
      const refStart = firstActiveDay ? prev[firstActiveDay.key].startTime : DEFAULT_START;
      const refEnd = firstActiveDay ? prev[firstActiveDay.key].endTime : DEFAULT_END;
      DAYS_OF_WEEK.forEach((d) => {
        if (updated[d.key].active) {
          updated[d.key] = { ...updated[d.key], startTime: refStart, endTime: refEnd };
        }
      });
      return updated;
    });
  };

  const handleContinue = () => {
    // Build schedule data to pass forward
    const scheduleData = DAYS_OF_WEEK
      .filter((d) => schedule[d.key].active)
      .map((d, i) => ({
        dayOfWeek: i,
        startTime: schedule[d.key].startTime,
        endTime: schedule[d.key].endTime,
        isActive: true,
      }));

    router.push({
      pathname: '/(auth)/bag-review',
      params: {
        ...params,
        scheduleJson: JSON.stringify(scheduleData),
        earningsPerWeek,
        activeDays: String(activeDays),
      },
    });
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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{strings.bagScheduleSetup.title}</Text>
        <Text style={styles.subtitle}>{strings.bagScheduleSetup.subtitle}</Text>

        {/* Day rows with checkboxes and time inputs */}
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

        {/* Edit all days button */}
        {activeDays > 1 && (
          <TouchableOpacity style={styles.editAllButton} onPress={editAllDays}>
            <Text style={styles.editAllText}>{strings.bagScheduleSetup.editForAllDays}</Text>
          </TouchableOpacity>
        )}

        <RecommendationBox
          title={strings.bagScheduleSetup.recommendationTitle}
          message={strings.bagScheduleSetup.recommendationMessage}
        />

        <HelpSection items={HELP_ITEMS} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Earnings banner */}
      {activeDays > 0 && (
        <View style={styles.earningsBanner}>
          <Text style={styles.earningsLabel}>{strings.bagScheduleSetup.earningsPerWeek}</Text>
          <Text style={styles.earningsAmount}>USD {earningsPerWeek}</Text>
        </View>
      )}

      <ProgressBar current={5} total={6} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.bagScheduleSetup.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={activeDays === 0}
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
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
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
  editAllButton: {
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  editAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  earningsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  earningsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  earningsAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
