"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatInZone } from "@/lib/utils";
import { Banner, GhostButton } from "./brand";

type Booking = {
  id: string;
  startAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  notes: string | null;
  status: "CONFIRMED" | "CANCELLED";
  service: { name: string; durationMinutes: number };
};

export function BookingsTable({
  bookings,
  timezone,
}: {
  bookings: Booking[];
  timezone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (bookings.length === 0) {
    return <p className="text-muted">No upcoming bookings yet. Share your embed to start taking them.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <Banner>{error}</Banner> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-faint">
            <tr>
              <th className="pb-3 font-medium">When</th>
              <th className="pb-3 font-medium">Service</th>
              <th className="pb-3 font-medium">Guest</th>
              <th className="pb-3 font-medium">Notes</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-line align-top">
                <td className="py-3">
                  <div>{formatInZone(booking.startAt, timezone)}</div>
                  <div className="text-xs text-faint">{booking.service.durationMinutes} min</div>
                </td>
                <td className="py-3">{booking.service.name}</td>
                <td className="py-3">
                  <div>{booking.guestName}</div>
                  <div className="text-xs text-faint">{booking.guestEmail}</div>
                  {booking.guestPhone ? <div className="text-xs text-faint">{booking.guestPhone}</div> : null}
                </td>
                <td className="py-3 text-muted">{booking.notes || "—"}</td>
                <td className="py-3 text-right">
                  {booking.status === "CONFIRMED" ? (
                    <GhostButton
                      type="button"
                      disabled={pendingId === booking.id}
                      onClick={async () => {
                        setError("");
                        setPendingId(booking.id);
                        try {
                          const response = await fetch(`/api/admin/bookings/${booking.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "CANCELLED" }),
                          });
                          const data = (await response.json().catch(() => ({}))) as { error?: string };
                          if (!response.ok) throw new Error(data.error || "Could not cancel");
                          router.refresh();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Could not cancel");
                        } finally {
                          setPendingId(null);
                        }
                      }}
                    >
                      Cancel
                    </GhostButton>
                  ) : (
                    <span className="text-xs text-faint">Cancelled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
