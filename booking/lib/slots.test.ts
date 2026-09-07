import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DateTime } from "luxon";
import { daysOpenInMonth, generateSlots, slotStillOpen } from "./slots";

const weekdayRules = [
  { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 17 * 60 },
  { dayOfWeek: 2, startMinute: 9 * 60, endMinute: 17 * 60 },
];

describe("generateSlots", () => {
  it("builds duration-aware openings on an available weekday", () => {
    const slots = generateSlots({
      dateISO: "2026-09-08",
      timezone: "America/New_York",
      durationMinutes: 60,
      rules: weekdayRules,
      bookings: [],
      now: new Date("2026-09-01T12:00:00.000Z"),
    });

    assert.equal(slots[0]?.startAt, "2026-09-08T13:00:00.000Z");
    assert.equal(slots[0]?.endAt, "2026-09-08T14:00:00.000Z");
    const last = slots.at(-1);
    assert.equal(last?.startAt, "2026-09-08T20:00:00.000Z");
    assert.equal(last?.endAt, "2026-09-08T21:00:00.000Z");
  });

  it("hides times that overlap an existing booking", () => {
    const slots = generateSlots({
      dateISO: "2026-09-08",
      timezone: "America/New_York",
      durationMinutes: 60,
      rules: weekdayRules,
      bookings: [
        {
          startAt: new Date("2026-09-08T14:00:00.000Z"),
          endAt: new Date("2026-09-08T15:00:00.000Z"),
        },
      ],
      now: new Date("2026-09-01T12:00:00.000Z"),
    });

    assert.ok(!slots.some((slot) => slot.startAt === "2026-09-08T13:30:00.000Z"));
    assert.ok(!slots.some((slot) => slot.startAt === "2026-09-08T14:00:00.000Z"));
    assert.ok(slots.some((slot) => slot.startAt === "2026-09-08T15:00:00.000Z"));
  });

  it("returns no slots on a closed day", () => {
    const slots = generateSlots({
      dateISO: "2026-09-06",
      timezone: "America/New_York",
      durationMinutes: 30,
      rules: weekdayRules,
      bookings: [],
      now: new Date("2026-09-01T12:00:00.000Z"),
    });
    assert.equal(slots.length, 0);
  });

  it("skips slots that already started", () => {
    const now = DateTime.fromISO("2026-09-08T14:10:00.000Z").toJSDate();
    const slots = generateSlots({
      dateISO: "2026-09-08",
      timezone: "America/New_York",
      durationMinutes: 30,
      rules: weekdayRules,
      bookings: [],
      now,
    });
    assert.ok(slots.every((slot) => DateTime.fromISO(slot.startAt) > DateTime.fromJSDate(now)));
  });
});

describe("slotStillOpen", () => {
  it("re-checks a candidate start against duration and bookings", () => {
    const options = {
      timezone: "America/New_York",
      durationMinutes: 45,
      rules: weekdayRules,
      bookings: [] as { startAt: Date; endAt: Date }[],
      now: new Date("2026-09-01T12:00:00.000Z"),
    };
    assert.equal(slotStillOpen("2026-09-08T13:00:00.000Z", options), true);
    assert.equal(
      slotStillOpen("2026-09-08T13:00:00.000Z", {
        ...options,
        bookings: [
          {
            startAt: new Date("2026-09-08T13:15:00.000Z"),
            endAt: new Date("2026-09-08T14:00:00.000Z"),
          },
        ],
      }),
      false,
    );
  });
});

describe("daysOpenInMonth", () => {
  it("marks weekdays that have hours", () => {
    const days = daysOpenInMonth(2026, 9, "America/New_York", weekdayRules);
    assert.ok(days.includes(7));
    assert.ok(days.includes(8));
    assert.ok(!days.includes(6));
  });
});
