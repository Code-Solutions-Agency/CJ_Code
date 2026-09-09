window.SITE = {
  name: "CJ Code",
  title: "CJ Code — Websites & AI for businesses",
  contactEmail: "hello@cjcode.com",
  chatEndpoint: "/api/chat",
  /**
   * Public endpoint for chat leads (no private API secret).
   * Leave blank to POST to FormSubmit.co AJAX for contactEmail:
   *   https://formsubmit.co/ajax/{contactEmail}
   * First submission: FormSubmit emails a confirmation link to contactEmail — click it once.
   * After that, leads arrive as email. You can paste a FormSubmit random string URL
   * (shown after activation) or any other public form backend here.
   */
  leadEndpoint: "",
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
