import { DAYS_OF_WEEK } from '../constants/app';
import type { DaySchedule } from '../components/ui/DayScheduleEditor';
import type { BagPickupSchedule } from '../types';

const KEY_TO_DAY: Record<string, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

const DAY_TO_KEY: Record<number, string> = {
  1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun',
};

export function scheduleToEntries(schedule: Record<string, DaySchedule>) {
  return DAYS_OF_WEEK
    .filter((d) => schedule[d.key].active)
    .map((d) => ({
      dayOfWeek: KEY_TO_DAY[d.key],
      startTime: schedule[d.key].startTime,
      endTime: schedule[d.key].endTime,
      isActive: true,
    }));
}

export function buildScheduleState(scheduleRows: BagPickupSchedule[]): Record<string, DaySchedule> {
  const state: Record<string, DaySchedule> = {};
  DAYS_OF_WEEK.forEach((d) => {
    state[d.key] = { active: false, startTime: '17:00', endTime: '18:00' };
  });
  scheduleRows.forEach((row) => {
    const key = DAY_TO_KEY[row.day_of_week];
    if (key) {
      state[key] = {
        active: true,
        startTime: row.start_time.slice(0, 5),
        endTime: row.end_time.slice(0, 5),
      };
    }
  });
  return state;
}
