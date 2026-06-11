import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
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

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function TimePicker({
  visible,
  value,
  onSelect,
  onClose,
  minTime,
}: {
  visible: boolean;
  value: string;
  onSelect: (time: string) => void;
  onClose: () => void;
  minTime?: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar hora</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
            {TIME_SLOTS.map((time) => {
              const disabled = minTime !== undefined && time <= minTime;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    time === value && styles.timeOptionSelected,
                    disabled && styles.timeOptionDisabled,
                  ]}
                  onPress={() => {
                    if (!disabled) {
                      onSelect(time);
                      onClose();
                    }
                  }}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      time === value && styles.timeOptionTextSelected,
                      disabled && styles.timeOptionTextDisabled,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
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
  const [picker, setPicker] = useState<{ dayKey: string; field: 'startTime' | 'endTime' } | null>(null);

  const pickerValue = picker ? schedule[picker.dayKey][picker.field] : '';
  const pickerMinTime = picker?.field === 'endTime' ? schedule[picker.dayKey].startTime : undefined;

  const handleTimeSelect = (time: string) => {
    if (!picker) return;
    onUpdateTime(picker.dayKey, picker.field, time);
    // If setting start time >= end time, auto-advance end time
    if (picker.field === 'startTime') {
      const dayData = schedule[picker.dayKey];
      if (time >= dayData.endTime) {
        const nextIdx = TIME_SLOTS.indexOf(time) + 1;
        if (nextIdx < TIME_SLOTS.length) {
          onUpdateTime(picker.dayKey, 'endTime', TIME_SLOTS[nextIdx]);
        }
      }
    }
  };

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
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setPicker({ dayKey: day.key, field: 'startTime' })}
                  >
                    <Text style={styles.timeButtonText}>{dayData.startTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeDash}>-</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setPicker({ dayKey: day.key, field: 'endTime' })}
                  >
                    <Text style={styles.timeButtonText}>{dayData.endTime}</Text>
                  </TouchableOpacity>
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

      <TimePicker
        visible={picker !== null}
        value={pickerValue}
        onSelect={handleTimeSelect}
        onClose={() => setPicker(null)}
        minTime={pickerMinTime}
      />
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
  timeButton: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '50%',
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  timeList: {
    paddingHorizontal: spacing.lg,
  },
  timeOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  timeOptionDisabled: {
    opacity: 0.3,
  },
  timeOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  timeOptionTextSelected: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  timeOptionTextDisabled: {
    color: colors.text.tertiary,
  },
});
