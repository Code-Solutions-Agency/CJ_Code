"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TIMEZONES } from "@/lib/timezones";
import { Banner, Field, PrimaryButton, TextInput } from "./brand";

type Tenant = {
  name: string;
  timezone: string;
  primaryColor: string;
  notifyEmail: string | null;
};

export function SettingsForm({ initial }: { initial: Tenant }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [color, setColor] = useState(initial.primaryColor);

  return (
    <form
      className="surface space-y-4 rounded-3xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setSaved(false);
        setPending(true);
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch("/api/admin/tenant", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              timezone: form.get("timezone"),
              primaryColor: form.get("primaryColor"),
              notifyEmail: form.get("notifyEmail"),
            }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) throw new Error(data.error || "Could not save");
          setSaved(true);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save");
        } finally {
          setPending(false);
        }
      }}
    >
      {error ? <Banner>{error}</Banner> : null}
      {saved ? <Banner tone="ok">Business settings saved.</Banner> : null}
      <Field label="Business name">
        <TextInput name="name" defaultValue={initial.name} required />
      </Field>
      <Field label="Timezone" hint="Visitors see times in this zone.">
        <select
          name="timezone"
          defaultValue={initial.timezone}
          className="w-full rounded-xl border border-line bg-bg-2 px-3 py-2.5"
        >
          {TIMEZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Primary color">
        <div className="flex items-center gap-3">
          <input
            name="primaryColor"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-bg-2 p-1"
          />
          <span className="text-sm text-muted">{color}</span>
        </div>
      </Field>
      <Field label="Notification email" hint="New bookings are sent here. Guest confirmations go to the visitor.">
        <TextInput name="notifyEmail" type="email" defaultValue={initial.notifyEmail ?? ""} />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </PrimaryButton>
    </form>
  );
}
