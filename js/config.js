window.SITE = {
  name: "CJ Code",
  title: "Web and AI Services Portfolio",
  contactEmail: "hello@cjcode.com",
  /**
   * On-site “book a call” calendar (runs on the static site — no localhost, no login).
   * Confirm opens an email draft to notifyEmail.
   */
  booking: {
    timezone: "America/Chicago",
    timezoneLabel: "Central Time",
    notifyEmail: "hello@cjcode.com",
    stepMinutes: 30,
    minNoticeMinutes: 60,
    durationMinutes: 30,
    needs: [
      { id: "web", name: "Web" },
      { id: "automation", name: "Automation" },
      { id: "web-and-automation", name: "Web and Automation" },
    ],
    /* 0 = Sunday … 6 = Saturday. Minutes from midnight in `timezone`. */
    /* Monday–Thursday 1:00–3:00pm Central. Friday is closed. */
    hours: [
      { dayOfWeek: 1, startMinute: 13 * 60, endMinute: 15 * 60 },
      { dayOfWeek: 2, startMinute: 13 * 60, endMinute: 15 * 60 },
      { dayOfWeek: 3, startMinute: 13 * 60, endMinute: 15 * 60 },
      { dayOfWeek: 4, startMinute: 13 * 60, endMinute: 15 * 60 },
    ],
    /* One-off closed days as YYYY-MM-DD in Central Time, e.g. "2026-09-15" */
    blockedDates: [],
  },
  /**
   * How many times a visitor can generate in each portfolio demo (per browser).
   * These tools stay sample-only on this site — not a free product.
   */
  demoMaxUses: 2,
};
