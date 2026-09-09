"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WEEKDAYS } from "@/lib/timezones";
import { minutesToInput } from "@/lib/utils";
import { Banner, PrimaryButton } from "./brand";

type Rule = { dayOfWeek: number; startMinute: number; endMinute: number };

export function HoursForm({ initial }: { initial: Rule[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const byDay = new Map(initial.map((rule) => [rule.dayOfWeek, rule]));

  return (
    <form
      className="surface space-y-4 rounded-3xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setSaved(false);
        setPending(true);
        const form = new FormData(event.currentTarget);
        const rules = WEEKDAYS.map((day) => {
          const enabled = form.get(`enabled-${day.value}`) === "on";
          const [startH, startM] = String(form.get(`start-${day.value}`) || "09:00").split(":").map(Number);
          const [endH, endM] = String(form.get(`end-${day.value}`) || "17:00").split(":").map(Number);
          return {
            dayOfWeek: day.value,
            enabled,
            startMinute: startH * 60 + startM,
            endMinute: endH * 60 + endM,
          };
        });
        try {
          const response = await fetch("/api/admin/availability", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rules }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) throw new Error(data.error || "Could not save hours");
          setSaved(true);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save hours");
        } finally {
          setPending(false);
        }
      }}
    >
      {error ? <Banner>{error}</Banner> : null}
      {saved ? <Banner tone="ok">Weekly hours saved. The widget uses these immediately.</Banner> : null}
      <div className="divide-y divide-line">
        {WEEKDAYS.map((day) => {
          const rule = byDay.get(day.value);
          return (
            <div key={day.value} className="grid items-center gap-3 py-3 sm:grid-cols-[8rem_auto_1fr_1fr]">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name={`enabled-${day.value}`} type="checkbox" defaultChecked={Boolean(rule)} />
                {day.label}
              </label>
              <span className="hidden text-xs text-faint sm:inline">Open</span>
              <input
                name={`start-${day.value}`}
                type="time"
                defaultValue={minutesToInput(rule?.startMinute ?? 9 * 60)}
                className="rounded-xl border border-line bg-bg-2 px-3 py-2"
              />
              <input
                name={`end-${day.value}`}
                type="time"
                defaultValue={minutesToInput(rule?.endMinute ?? 17 * 60)}
                className="rounded-xl border border-line bg-bg-2 px-3 py-2"
              />
            </div>
          );
        })}
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save hours"}
      </PrimaryButton>
    </form>
  );
}
