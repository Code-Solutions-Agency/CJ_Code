"use client";

import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { formatInZone, formatMoney } from "@/lib/utils";
import { Banner, Field, PrimaryButton, TextArea, TextInput } from "./brand";

type TenantPayload = {
  name: string;
  timezone: string;
  primaryColor: string;
  publicKey: string;
  services: Array<{
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number | null;
  }>;
  availability: Array<{ dayOfWeek: number; startMinute: number; endMinute: number }>;
};

type Slot = { startAt: string; endAt: string };

type Confirmed = {
  id: string;
  startAt: string;
  guestName: string;
  serviceName: string;
  timezone: string;
  tenantName: string;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function loadJson<T>(url: string) {
  const response = await fetch(url);
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function MonthGrid({
  cursor,
  timezone,
  openDays,
  selected,
  onSelect,
  onPrev,
  onNext,
}: {
  cursor: DateTime;
  timezone: string;
  openDays: Set<number>;
  selected: string | null;
  onSelect: (isoDate: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = cursor.startOf("month");
  const startWeekday = start.weekday % 7;
  const days = start.daysInMonth ?? 30;
  const today = DateTime.now().setZone(timezone).startOf("day");
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="rounded-full px-2 py-1 text-sm text-muted hover:bg-bg-3" onClick={onPrev}>
          ←
        </button>
        <p className="text-sm font-medium">{cursor.toFormat("LLLL yyyy")}</p>
        <button type="button" className="rounded-full px-2 py-1 text-sm text-muted hover:bg-bg-3" onClick={onNext}>
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-faint">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`e-${index}`} />;
          const date = start.set({ day });
          const iso = date.toISODate();
          const past = date < today;
          const open = openDays.has(date.weekday === 7 ? 0 : date.weekday);
          const enabled = Boolean(iso && !past && open);
          const isSelected = iso === selected;
          return (
            <button
              key={day}
              type="button"
              disabled={!enabled}
              onClick={() => iso && onSelect(iso)}
              className={`h-9 rounded-lg text-sm ${
                isSelected
                  ? "bg-[var(--brand)] text-white"
                  : enabled
                    ? "hover:bg-bg-3"
                    : "text-faint/70"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingWidget({
  publicKey,
  framed = false,
}: {
  publicKey: string;
  framed?: boolean;
}) {
  const [tenant, setTenant] = useState<TenantPayload | null>(null);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [month, setMonth] = useState<DateTime>(() => DateTime.now());
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  useEffect(() => {
    loadJson<{ tenant: TenantPayload }>(`/api/public/${publicKey}`)
      .then((data) => {
        setTenant(data.tenant);
        setServiceId(data.tenant.services[0]?.id ?? null);
        setMonth(DateTime.now().setZone(data.tenant.timezone));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load booking page"));
  }, [publicKey]);

  useEffect(() => {
    if (!tenant || !serviceId || !date) return;
    let cancelled = false;
    loadJson<{ slots: Slot[] }>(
      `/api/public/${publicKey}/slots?serviceId=${encodeURIComponent(serviceId)}&date=${date}`,
    )
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load times");
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey, tenant, serviceId, date]);

  useEffect(() => {
    if (!framed) return;
    const publish = () => {
      window.parent?.postMessage(
        { type: "booklane:height", height: document.documentElement.scrollHeight },
        "*",
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [framed, tenant, serviceId, date, slots, confirmed, error]);

  const service = tenant?.services.find((item) => item.id === serviceId) ?? null;
  const openDays = useMemo(() => {
    return new Set((tenant?.availability ?? []).map((rule) => rule.dayOfWeek));
  }, [tenant]);

  if (error && !tenant) {
    return <div className="rounded-2xl border border-line bg-bg-2 p-6 text-sm text-muted">{error}</div>;
  }
  if (!tenant) {
    return <div className="rounded-2xl border border-line bg-bg-2 p-6 text-sm text-muted">Loading booking…</div>;
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border border-line bg-bg-2 shadow-[0_16px_40px_rgba(33,43,63,0.08)]"
      style={{ ["--brand" as string]: tenant.primaryColor }}
    >
      <div className="px-6 py-5 text-white" style={{ background: tenant.primaryColor }}>
        <p className="text-xs uppercase tracking-[0.18em] opacity-80">Book with</p>
        <h2 className="font-display text-2xl">{tenant.name}</h2>
        <p className="mt-1 text-sm opacity-80">Times shown in {tenant.timezone.replace(/_/g, " ")}</p>
      </div>

      <div className="space-y-6 p-6">
        {confirmed ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-sage">You&apos;re booked</p>
            <h3 className="font-display text-2xl">See you {formatInZone(confirmed.startAt, confirmed.timezone, "cccc")}</h3>
            <p className="text-muted">
              {confirmed.serviceName} with {confirmed.tenantName} on{" "}
              {formatInZone(confirmed.startAt, confirmed.timezone)}. A confirmation is on its way to your email.
            </p>
            <PrimaryButton
              type="button"
              className="bg-[var(--brand)]"
              onClick={() => {
                setConfirmed(null);
                setSlot(null);
                setDate(null);
              }}
            >
              Book another
            </PrimaryButton>
          </div>
        ) : (
          <>
            <div>
              <p className="mb-2 text-sm font-medium">Service</p>
              <div className="grid gap-2">
                {tenant.services.map((item) => {
                  const selected = item.id === serviceId;
                  const price = formatMoney(item.priceCents);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setServiceId(item.id);
                        setSlot(null);
                        setSlots([]);
                      }}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                        selected ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,white)]" : "border-line"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="text-sm text-muted">{item.durationMinutes} minutes</span>
                      </span>
                      {price ? <span className="text-sm">{price}</span> : null}
                    </button>
                  );
                })}
                {tenant.services.length === 0 ? (
                  <p className="text-sm text-muted">This business has not published services yet.</p>
                ) : null}
              </div>
            </div>

            {service ? (
              <div className="grid gap-6 md:grid-cols-2">
                <MonthGrid
                  cursor={month}
                  timezone={tenant.timezone}
                  openDays={openDays}
                  selected={date}
                  onSelect={(isoDate) => {
                    setDate(isoDate);
                    setSlot(null);
                    setSlots([]);
                  }}
                  onPrev={() => setMonth((current) => current.minus({ months: 1 }))}
                  onNext={() => setMonth((current) => current.plus({ months: 1 }))}
                />
                <div>
                  <p className="mb-2 text-sm font-medium">
                    {date ? `Times on ${DateTime.fromISO(date).toFormat("LLL d")}` : "Pick a date"}
                  </p>
                  {date && slots.length === 0 ? (
                    <p className="text-sm text-muted">No remaining times that day.</p>
                  ) : (
                    <div className="grid max-h-64 grid-cols-2 gap-2 overflow-auto">
                      {slots.map((item) => {
                        const selected = slot?.startAt === item.startAt;
                        return (
                          <button
                            key={item.startAt}
                            type="button"
                            onClick={() => setSlot(item)}
                            className={`rounded-xl border px-3 py-2 text-sm ${
                              selected ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,white)]" : "border-line"
                            }`}
                          >
                            {formatInZone(item.startAt, tenant.timezone, "h:mm a")}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {slot && service ? (
              <form
                className="space-y-3 border-t border-line pt-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError("");
                  setPending(true);
                  const form = new FormData(event.currentTarget);
                  try {
                    const result = await fetch(`/api/public/${publicKey}/bookings`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        serviceId: service.id,
                        startAt: slot.startAt,
                        guestName: form.get("guestName"),
                        guestEmail: form.get("guestEmail"),
                        guestPhone: form.get("guestPhone"),
                        notes: form.get("notes"),
                      }),
                    });
                    const data = (await result.json()) as { error?: string; booking?: Confirmed };
                    if (!result.ok || !data.booking) {
                      throw new Error(data.error || "Could not book");
                    }
                    setConfirmed(data.booking);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not book");
                  } finally {
                    setPending(false);
                  }
                }}
              >
                <p className="text-sm text-muted">
                  {service.name} · {formatInZone(slot.startAt, tenant.timezone)}
                </p>
                {error ? <Banner>{error}</Banner> : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    <TextInput name="guestName" required autoComplete="name" />
                  </Field>
                  <Field label="Email">
                    <TextInput name="guestEmail" type="email" required autoComplete="email" />
                  </Field>
                </div>
                <Field label="Phone (optional)">
                  <TextInput name="guestPhone" type="tel" autoComplete="tel" />
                </Field>
                <Field label="Notes (optional)">
                  <TextArea name="notes" rows={3} />
                </Field>
                <PrimaryButton type="submit" disabled={pending} className="bg-[var(--brand)]">
                  {pending ? "Booking…" : "Confirm booking"}
                </PrimaryButton>
              </form>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
