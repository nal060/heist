import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { DAYS_OF_WEEK } from '../../constants/app';

export interface DaySchedule {
  active: boolean;
  startTime: string;
  endTime: string;
}

interface DayScheduleEditorProps {
  schedule: Record<string, DaySchedule>;
  onToggleDay: (key: string) => void;
  onUpdateTime: (key: string, field: 'startTime' | 'endTime', value: string) => void;
  showEditAll?: boolean;
  onEditAll?: () => void;
  editAllLabel?: string;
}

export default function DayScheduleEditor({
  schedule,
  onToggleDay,
  onUpdateTime,
  showEditAll = false,
  onEditAll,
  editAllLabel,
}: DayScheduleEditorProps) {
  const activeDays = DAYS_OF_WEEK.filter((d) => schedule[d.key].active).length;

  return (
    <View>
      <View style={styles.daysList}>
        {DAYS_OF_WEEK.map((day) => {
          const dayData = schedule[day.key];
          return (
            <View key={day.key} style={styles.dayRow}>
              <TouchableOpacity
                style={[styles.checkbox, dayData.active && styles.checkboxChecked]}
                onPress={() => onToggleDay(day.key)}
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
                    onChangeText={(t) => onUpdateTime(day.key, 'startTime', t)}
                    placeholder="17:00"
                    placeholderTextColor={colors.gray[400]}
                  />
                  <Text style={styles.timeDash}>-</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={dayData.endTime}
                    onChangeText={(t) => onUpdateTime(day.key, 'endTime', t)}
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

      {showEditAll && activeDays > 1 && onEditAll && (
        <TouchableOpacity style={styles.editAllButton} onPress={onEditAll}>
          <Text style={styles.editAllText}>{editAllLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
