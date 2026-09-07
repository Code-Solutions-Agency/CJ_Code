import { DateTime } from "luxon";

export type AvailabilityRuleInput = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

export type BookingWindow = {
  startAt: Date;
  endAt: Date;
};

export type Slot = {
  startAt: string;
  endAt: string;
};

export const SLOT_STEP_MINUTES = 15;
export const MIN_NOTICE_MINUTES = 15;

export function luxonWeekdayToJs(weekday: number) {
  return weekday === 7 ? 0 : weekday;
}

export function generateSlots(options: {
  dateISO: string;
  timezone: string;
  durationMinutes: number;
  rules: AvailabilityRuleInput[];
  bookings: BookingWindow[];
  now?: Date;
  stepMinutes?: number;
  minNoticeMinutes?: number;
}): Slot[] {
  const {
    dateISO,
    timezone,
    durationMinutes,
    rules,
    bookings,
    now = new Date(),
    stepMinutes = SLOT_STEP_MINUTES,
    minNoticeMinutes = MIN_NOTICE_MINUTES,
  } = options;

  if (durationMinutes <= 0) return [];

  const day = DateTime.fromISO(dateISO, { zone: timezone });
  if (!day.isValid) return [];

  const rule = rules.find((item) => item.dayOfWeek === luxonWeekdayToJs(day.weekday));
  if (!rule || rule.endMinute - rule.startMinute < durationMinutes) return [];

  const earliest = DateTime.fromJSDate(now, { zone: timezone }).plus({
    minutes: minNoticeMinutes,
  });

  const slots: Slot[] = [];

  for (
    let startMinute = rule.startMinute;
    startMinute + durationMinutes <= rule.endMinute;
    startMinute += stepMinutes
  ) {
    const start = day.startOf("day").plus({ minutes: startMinute });
    const end = start.plus({ minutes: durationMinutes });
    if (start < earliest) continue;

    const overlaps = bookings.some((booking) => {
      const bookingStart = DateTime.fromJSDate(booking.startAt);
      const bookingEnd = DateTime.fromJSDate(booking.endAt);
      return bookingStart < end.toUTC() && bookingEnd > start.toUTC();
    });
    if (overlaps) continue;

    const startISO = start.toUTC().toISO();
    const endISO = end.toUTC().toISO();
    if (!startISO || !endISO) continue;
    slots.push({ startAt: startISO, endAt: endISO });
  }

  return slots;
}

export function slotStillOpen(
  startAtISO: string,
  options: Omit<Parameters<typeof generateSlots>[0], "dateISO"> & { timezone: string },
) {
  const start = DateTime.fromISO(startAtISO, { setZone: true }).setZone(options.timezone);
  if (!start.isValid) return false;
  const dateISO = start.toISODate();
  if (!dateISO) return false;
  return generateSlots({ ...options, dateISO }).some((slot) => slot.startAt === start.toUTC().toISO());
}

export function daysOpenInMonth(
  year: number,
  month: number,
  timezone: string,
  rules: AvailabilityRuleInput[],
) {
  const start = DateTime.fromObject({ year, month, day: 1 }, { zone: timezone });
  if (!start.isValid) return [];
  const count = start.daysInMonth ?? 0;
  const days: number[] = [];
  for (let day = 1; day <= count; day += 1) {
    const dt = start.set({ day });
    const rule = rules.find((item) => item.dayOfWeek === luxonWeekdayToJs(dt.weekday));
    if (rule && rule.endMinute > rule.startMinute) days.push(day);
  }
  return days;
}
