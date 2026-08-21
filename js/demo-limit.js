/**
 * Caps portfolio demos so visitors can try the walkthrough, not run a free tool.
 * Count is per browser (localStorage), not per page load.
 */
(() => {
  const PREFIX = "cpai-demo-uses:";
  const DEFAULT_MAX = 2;
  const memory = Object.create(null);

  function maxUses() {
    const n = Number((window.SITE && window.SITE.demoMaxUses) || DEFAULT_MAX);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX;
  }

  function stored(id) {
    try {
      const n = Number(window.localStorage.getItem(PREFIX + id) || 0);
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }

  function used(id) {
    return Math.max(stored(id), memory[id] || 0);
  }

  function remaining(id) {
    return Math.max(0, maxUses() - used(id));
  }

  function consume(id) {
    if (remaining(id) <= 0) return false;
    const next = used(id) + 1;
    memory[id] = next;
    try {
      window.localStorage.setItem(PREFIX + id, String(next));
    } catch {
      /* private mode still counts in this page session */
    }
    return true;
  }

  window.DemoUses = { maxUses, used, remaining, consume };
})();
