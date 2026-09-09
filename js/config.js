window.SITE = {
  name: "CJ Code",
  title: "Web and AI Services Portfolio",
  contactEmail: "hello@cjcode.com",
  /**
   * Booklane app origin. Local default matches `booking/` (`npm run dev`).
   * Swap to the public Booklane URL when that app is deployed.
   */
  booklaneUrl: "http://localhost:3000",
  /**
   * Tenant public key from Booklane → Dashboard → Embed.
   * Demo key ships with the seed; replace with the CJ Code workspace key when ready.
   */
  booklanePublicKey: "pk_demo_willow_grove",
  /**
   * How many times a visitor can generate in each portfolio demo (per browser).
   * These tools stay sample-only on this site — not a free product.
   */
  demoMaxUses: 2,
};
