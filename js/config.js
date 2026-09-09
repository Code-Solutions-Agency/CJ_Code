window.SITE = {
  name: "CJ Code",
  title: "Web and AI Services Portfolio",
  contactEmail: "hello@cjcode.com",
  /**
   * How many times a visitor can generate in each portfolio demo (per browser).
   * These tools stay sample-only on this site — not a free product.
   */
  demoMaxUses: 2,
  /**
   * Public endpoint for chat leads (no private API secret).
   * Leave blank to POST to FormSubmit.co AJAX for contactEmail:
   *   https://formsubmit.co/ajax/{contactEmail}
   * First submission: FormSubmit emails a confirmation link to contactEmail — click it once.
   * After that, leads arrive as email. You can paste a FormSubmit random string URL
   * (shown after activation) or any other public form backend here.
   */
  leadEndpoint: "",
};
