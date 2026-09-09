window.SITE = {
  name: "CJ Code",
  title: "Web and AI Services Portfolio",
  contactEmail: "hello@cjcode.com",
  /**
   * On-site “book a call” calendar (runs on GitHub Pages — no localhost, no login).
   * Confirm opens an email draft to notifyEmail.
   */
  booking: {
    timezone: "America/New_York",
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
    hours: [
      { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 2, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 3, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 4, startMinute: 9 * 60, endMinute: 17 * 60 },
      { dayOfWeek: 5, startMinute: 9 * 60, endMinute: 17 * 60 },
    ],
  },
  /**
   * How many times a visitor can generate in each portfolio demo (per browser).
   * These tools stay sample-only on this site — not a free product.
   */
  demoMaxUses: 2,
};
