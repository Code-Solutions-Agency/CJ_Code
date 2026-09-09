"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { Banner, Field, GhostButton, PrimaryButton, TextInput } from "./brand";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
  active: boolean;
};

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; deactivated?: boolean };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function ServicesManager({ initial }: { initial: Service[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function refreshAfter(action: () => Promise<unknown>) {
    setError("");
    setMessage("");
    setPending(true);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update services");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      {error ? <Banner>{error}</Banner> : null}
      {message ? <Banner tone="ok">{message}</Banner> : null}

      <form
        className="surface space-y-4 rounded-3xl p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const price = String(form.get("price") || "").trim();
          void refreshAfter(() =>
            send("/api/admin/services", "POST", {
              name: form.get("name"),
              durationMinutes: Number(form.get("durationMinutes")),
              priceCents: price === "" ? null : Math.round(Number(price) * 100),
            }),
          ).then(() => event.currentTarget.reset());
        }}
      >
        <h2 className="font-display text-2xl">Add a service</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name">
            <TextInput name="name" required placeholder="Garden consult" />
          </Field>
          <Field label="Duration (minutes)">
            <TextInput name="durationMinutes" type="number" min={15} max={480} step={5} required defaultValue={30} />
          </Field>
          <Field label="Price (USD, optional)">
            <TextInput name="price" type="number" min={0} step="0.01" placeholder="45.00" />
          </Field>
        </div>
        <PrimaryButton type="submit" disabled={pending}>
          Add service
        </PrimaryButton>
      </form>

      <div className="space-y-3">
        {initial.length === 0 ? (
          <p className="text-muted">No services yet. Add one so the widget has something to book.</p>
        ) : null}
        {initial.map((service) => (
          <form
            key={service.id}
            className="surface grid gap-3 rounded-3xl p-5 md:grid-cols-[1fr_8rem_8rem_auto] md:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const price = String(form.get("price") || "").trim();
              void refreshAfter(() =>
                send(`/api/admin/services/${service.id}`, "PATCH", {
                  name: form.get("name"),
                  durationMinutes: Number(form.get("durationMinutes")),
                  priceCents: price === "" ? null : Math.round(Number(price) * 100),
                  active: form.get("active") === "on",
                }),
              );
            }}
          >
            <Field label="Name">
              <TextInput name="name" defaultValue={service.name} required />
            </Field>
            <Field label="Minutes">
              <TextInput
                name="durationMinutes"
                type="number"
                min={15}
                max={480}
                defaultValue={service.durationMinutes}
                required
              />
            </Field>
            <Field label="Price">
              <TextInput
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service.priceCents == null ? "" : (service.priceCents / 100).toFixed(2)}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input name="active" type="checkbox" defaultChecked={service.active} />
                Active
              </label>
              <GhostButton type="submit" disabled={pending}>
                Save
              </GhostButton>
              <GhostButton
                type="button"
                disabled={pending}
                onClick={() =>
                  void refreshAfter(async () => {
                    const result = await send(`/api/admin/services/${service.id}`, "DELETE");
                    if (result.deactivated) {
                      setMessage(`${service.name} has bookings, so it was hidden instead of deleted.`);
                    }
                  })
                }
              >
                Remove
              </GhostButton>
            </div>
            <p className="text-xs text-faint md:col-span-4">
              {service.active ? "Shown on the widget" : "Hidden from the widget"}
              {service.priceCents != null ? ` · ${formatMoney(service.priceCents)}` : ""}
            </p>
          </form>
        ))}
      </div>
    </div>
  );
}
