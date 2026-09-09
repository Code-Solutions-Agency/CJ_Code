(() => {
  const mount = document.getElementById("booking-embed");
  if (!mount) return;

  const site = window.SITE || {};
  const booking = site.booking || {};
  const timezone = booking.timezone || "America/New_York";
  const notifyEmail = booking.notifyEmail || site.contactEmail || "hello@cjcode.com";
  const stepMinutes = Number(booking.stepMinutes) || 30;
  const minNoticeMinutes = Number(booking.minNoticeMinutes) || 60;
  const services = Array.isArray(booking.services) && booking.services.length
    ? booking.services
    : [{ id: "intro", name: "Intro call", durationMinutes: 30 }];
  const hours = Array.isArray(booking.hours) ? booking.hours : [];

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const state = {
    year: 0,
    month: 0, /* 1–12 */
    selectedDay: null, /* { year, month, day } */
    selectedSlot: null, /* ISO string */
    serviceId: services[0].id,
    name: "",
    email: "",
    company: "",
    note: "",
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function zonedParts(date) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    const map = {};
    for (const part of fmt.formatToParts(date)) {
      if (part.type !== "literal") map[part.type] = part.value;
    }
    return {
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: Number(map.hour) % 24,
      minute: Number(map.minute),
      second: Number(map.second),
      weekday: map.weekday,
    };
  }

  function tzOffsetMs(date) {
    const p = zonedParts(date);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return asUtc - date.getTime();
  }

  function zonedTimeToDate(year, month, day, hour, minute) {
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    let date = new Date(utcGuess);
    date = new Date(utcGuess - tzOffsetMs(date));
    date = new Date(utcGuess - tzOffsetMs(date));
    return date;
  }

  function dayOfWeek(year, month, day) {
    const date = zonedTimeToDate(year, month, day, 12, 0);
    return WEEKDAYS.indexOf(zonedParts(date).weekday);
  }

  function hoursForDay(year, month, day) {
    const dow = dayOfWeek(year, month, day);
    return hours.filter((rule) => Number(rule.dayOfWeek) === dow);
  }

  function slotsOnDay(year, month, day, durationMinutes) {
    const now = Date.now() + minNoticeMinutes * 60 * 1000;
    const result = [];
    for (const rule of hoursForDay(year, month, day)) {
      const start = Number(rule.startMinute);
      const end = Number(rule.endMinute);
      for (let minute = start; minute + durationMinutes <= end; minute += stepMinutes) {
        const hour = Math.floor(minute / 60);
        const min = minute % 60;
        const date = zonedTimeToDate(year, month, day, hour, min);
        if (date.getTime() >= now) {
          result.push(date);
        }
      }
    }
    return result;
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatLong(date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }

  function currentService() {
    return services.find((s) => s.id === state.serviceId) || services[0];
  }

  function initMonth() {
    const now = zonedParts(new Date());
    state.year = now.year;
    state.month = now.month;
    const duration = Number(currentService().durationMinutes) || 30;
    for (let day = now.day; day <= daysInMonth(now.year, now.month); day += 1) {
      if (slotsOnDay(now.year, now.month, day, duration).length) {
        state.selectedDay = { year: now.year, month: now.month, day };
        return;
      }
    }
    const nextMonth = now.month === 12 ? 1 : now.month + 1;
    const nextYear = now.month === 12 ? now.year + 1 : now.year;
    state.year = nextYear;
    state.month = nextMonth;
    for (let day = 1; day <= daysInMonth(nextYear, nextMonth); day += 1) {
      if (slotsOnDay(nextYear, nextMonth, day, duration).length) {
        state.selectedDay = { year: nextYear, month: nextMonth, day };
        return;
      }
    }
  }

  function canShiftMonth(delta) {
    const now = zonedParts(new Date());
    let year = state.year;
    let month = state.month + delta;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const minYear = now.year;
    const minMonth = now.month;
    const maxDate = new Date(now.year, now.month - 1 + 3, 1); /* ~3 months ahead */
    const maxYear = maxDate.getFullYear();
    const maxMonth = maxDate.getMonth() + 1;
    if (year < minYear || (year === minYear && month < minMonth)) return false;
    if (year > maxYear || (year === maxYear && month > maxMonth)) return false;
    return true;
  }

  function shiftMonth(delta) {
    if (!canShiftMonth(delta)) return;
    state.month += delta;
    if (state.month < 1) {
      state.month = 12;
      state.year -= 1;
    }
    if (state.month > 12) {
      state.month = 1;
      state.year += 1;
    }
    state.selectedSlot = null;
    const duration = Number(currentService().durationMinutes) || 30;
    const last = daysInMonth(state.year, state.month);
    let pick = null;
    for (let day = 1; day <= last; day += 1) {
      if (slotsOnDay(state.year, state.month, day, duration).length) {
        pick = { year: state.year, month: state.month, day };
        break;
      }
    }
    state.selectedDay = pick;
    render();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderCalendar() {
    const duration = Number(currentService().durationMinutes) || 30;
    const firstDow = dayOfWeek(state.year, state.month, 1);
    const last = daysInMonth(state.year, state.month);
    const cells = [];
    for (let i = 0; i < firstDow; i += 1) cells.push('<span class="booking-cell is-empty"></span>');
    for (let day = 1; day <= last; day += 1) {
      const open = slotsOnDay(state.year, state.month, day, duration);
      const selected = state.selectedDay
        && state.selectedDay.year === state.year
        && state.selectedDay.month === state.month
        && state.selectedDay.day === day;
      const disabled = open.length === 0;
      cells.push(
        `<button type="button" class="booking-cell${selected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}" data-day="${day}" ${disabled ? "disabled" : ""} aria-pressed="${selected ? "true" : "false"}" aria-label="${MONTHS[state.month - 1]} ${day}">${day}</button>`,
      );
    }
    return `
      <div class="booking-cal">
        <div class="booking-cal-nav">
          <button type="button" class="booking-nav" data-month="-1" ${canShiftMonth(-1) ? "" : "disabled"} aria-label="Previous month">‹</button>
          <p class="booking-cal-label">${MONTHS[state.month - 1]} ${state.year}</p>
          <button type="button" class="booking-nav" data-month="1" ${canShiftMonth(1) ? "" : "disabled"} aria-label="Next month">›</button>
        </div>
        <div class="booking-dow" aria-hidden="true">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
        <div class="booking-grid">${cells.join("")}</div>
      </div>
    `;
  }

  function renderSlots() {
    const duration = Number(currentService().durationMinutes) || 30;
    if (!state.selectedDay) {
      return `<div class="booking-slots"><p class="booking-slots-empty">No open days this month. Try the next month.</p></div>`;
    }
    const { year, month, day } = state.selectedDay;
    const slots = slotsOnDay(year, month, day, duration);
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(zonedTimeToDate(year, month, day, 12, 0));
    if (!slots.length) {
      return `<div class="booking-slots"><p class="booking-slots-kicker">${escapeHtml(label)}</p><p class="booking-slots-empty">No times left this day.</p></div>`;
    }
    return `
      <div class="booking-slots">
        <p class="booking-slots-kicker">${escapeHtml(label)}</p>
        <div class="booking-slot-list" role="list">
          ${slots.map((slot) => {
            const iso = slot.toISOString();
            const selected = state.selectedSlot === iso;
            return `<button type="button" class="booking-slot${selected ? " is-selected" : ""}" data-slot="${escapeHtml(iso)}" aria-pressed="${selected ? "true" : "false"}">${escapeHtml(formatTime(slot))}</button>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  function render() {
    const selectedDate = state.selectedSlot ? new Date(state.selectedSlot) : null;
    mount.innerHTML = `
      <div class="booking-widget">
        <div class="booking-widget-head">
          <p class="booking-kicker">Book a call</p>
          <p class="booking-lede">Pick a service and a time. Confirm opens an email draft to ${escapeHtml(notifyEmail)} — no account, no login.</p>
        </div>
        <div class="booking-widget-body">
          <label class="booking-service">
            <span>What do you need?</span>
            <select id="booking-service">
              ${services.map((service) => (
                `<option value="${escapeHtml(service.id)}" ${service.id === state.serviceId ? "selected" : ""}>${escapeHtml(service.name)} (${Number(service.durationMinutes) || 30} min)</option>`
              )).join("")}
            </select>
          </label>
          <div class="booking-split">
            ${renderCalendar()}
            ${renderSlots()}
          </div>
          <form class="booking-form" id="booking-form" novalidate>
            <div class="field">
              <label for="booking-name">Name</label>
              <input id="booking-name" name="name" type="text" autocomplete="name" required value="${escapeHtml(state.name)}" />
            </div>
            <div class="field">
              <label for="booking-email">Email</label>
              <input id="booking-email" name="email" type="email" autocomplete="email" required value="${escapeHtml(state.email)}" />
            </div>
            <div class="field field-full">
              <label for="booking-company">Company <span class="booking-optional">(optional)</span></label>
              <input id="booking-company" name="company" type="text" autocomplete="organization" value="${escapeHtml(state.company)}" />
            </div>
            <div class="field field-full">
              <label for="booking-note">What should we cover? <span class="booking-optional">(optional)</span></label>
              <textarea id="booking-note" name="note" rows="3">${escapeHtml(state.note)}</textarea>
            </div>
            <div class="form-actions">
              <button class="btn primary" type="submit">Confirm time</button>
              <p class="form-status" id="booking-status" role="status">${selectedDate ? escapeHtml(formatLong(selectedDate)) : "Select a day and time."}</p>
            </div>
          </form>
        </div>
      </div>
    `;

    mount.querySelector("[data-month='-1']")?.addEventListener("click", () => shiftMonth(-1));
    mount.querySelector("[data-month='1']")?.addEventListener("click", () => shiftMonth(1));
    mount.querySelectorAll(".booking-cell[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedDay = {
          year: state.year,
          month: state.month,
          day: Number(btn.getAttribute("data-day")),
        };
        state.selectedSlot = null;
        render();
      });
    });
    mount.querySelectorAll(".booking-slot[data-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedSlot = btn.getAttribute("data-slot");
        render();
      });
    });
    mount.querySelector("#booking-service")?.addEventListener("change", (event) => {
      state.serviceId = event.target.value;
      state.selectedSlot = null;
      if (state.selectedDay) {
        const { year, month, day } = state.selectedDay;
        const duration = Number(currentService().durationMinutes) || 30;
        if (!slotsOnDay(year, month, day, duration).length) {
          initMonth();
        }
      }
      render();
    });
    mount.querySelector("#booking-form")?.addEventListener("submit", onSubmit);
    ["name", "email", "company", "note"].forEach((key) => {
      const el = mount.querySelector(`[name="${key}"]`);
      el?.addEventListener("input", () => {
        state[key] = el.value;
      });
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("booking-status");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const service = currentService();

    if (!state.selectedSlot) {
      status.textContent = "Pick a day and a time first.";
      return;
    }
    if (!data.name || !data.email) {
      status.textContent = "Name and email are required.";
      return;
    }

    const when = new Date(state.selectedSlot);
    const subject = `Call request — ${service.name} — ${data.company || data.name}`;
    const body = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company: ${data.company || "—"}`,
      `Need: ${service.name}`,
      `Duration: ${Number(service.durationMinutes) || 30} minutes`,
      `Requested time: ${formatLong(when)}`,
      "",
      data.note || "(no note)",
    ].join("\n");

    const href = `mailto:${notifyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    status.textContent = `Your email app should open a draft to ${notifyEmail}. If it doesn’t, write that address and include the time above.`;
  }

  initMonth();
  render();
})();
