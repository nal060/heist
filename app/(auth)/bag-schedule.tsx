import { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { DAYS_OF_WEEK } from '../../src/constants/app';
import ScreenShell from '../../src/components/ui/ScreenShell';
import DayScheduleEditor, { type DaySchedule } from '../../src/components/ui/DayScheduleEditor';
import RecommendationBox from '../../src/components/ui/RecommendationBox';
import HelpSection from '../../src/components/ui/HelpSection';
import Button from '../../src/components/ui/Button';

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
  const params = useLocalSearchParams<{ bagPrice: string; bagQuantity: string }>();

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
    <ScreenShell
      title={strings.bagScheduleSetup.title}
      subtitle={strings.bagScheduleSetup.subtitle}
      progress={{ current: 5, total: 6 }}
      footer={
        <>
          {activeDays > 0 && (
            <View style={styles.earningsBanner}>
              <Text style={styles.earningsLabel}>{strings.bagScheduleSetup.earningsPerWeek}</Text>
              <Text style={styles.earningsAmount}>USD {earningsPerWeek}</Text>
            </View>
          )}
          <Button
            label={strings.bagScheduleSetup.continue}
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </>
      }
    >
      <DayScheduleEditor
        schedule={schedule}
        onToggleDay={toggleDay}
        onUpdateTime={updateTime}
        showEditAll
        onEditAll={editAllDays}
        editAllLabel={strings.bagScheduleSetup.editForAllDays}
      />

      <RecommendationBox
        title={strings.bagScheduleSetup.recommendationTitle}
        message={strings.bagScheduleSetup.recommendationMessage}
      />

      <HelpSection items={HELP_ITEMS} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
});
