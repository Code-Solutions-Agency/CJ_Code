import { Resend } from "resend";
import { formatInZone } from "./utils";

type BookingMail = {
  tenantName: string;
  timezone: string;
  serviceName: string;
  startAt: Date;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  notes?: string | null;
  notifyEmail: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bookingCopy(input: BookingMail) {
  const when = formatInZone(input.startAt, input.timezone, "cccc, LLLL d, yyyy 'at' h:mm a");
  return {
    when,
    subjectGuest: `You're booked with ${input.tenantName}`,
    subjectBusiness: `New booking: ${input.guestName} · ${input.serviceName}`,
    textGuest: [
      `Hi ${input.guestName},`,
      "",
      `Your ${input.serviceName} with ${input.tenantName} is confirmed.`,
      `When: ${when} (${input.timezone})`,
      "",
      "If you need to change it, reply to this email or contact the business directly.",
    ].join("\n"),
    textBusiness: [
      `New booking for ${input.tenantName}.`,
      `Service: ${input.serviceName}`,
      `When: ${when} (${input.timezone})`,
      `Guest: ${input.guestName} <${input.guestEmail}>`,
      input.guestPhone ? `Phone: ${input.guestPhone}` : null,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function sendMail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Booklane <noreply@localhost>";

  if (!apiKey) {
    console.info("[booklane:email:stub]", { to, from, subject, text });
    return { stubbed: true };
  }

  const resend = new Resend(apiKey);
  const html = `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  const result = await resend.emails.send({ from, to, subject, text, html });
  if (result.error) {
    console.error("[booklane:email:error]", result.error);
    throw new Error(result.error.message);
  }
  return { stubbed: false, id: result.data?.id };
}

export async function sendBookingEmails(input: BookingMail) {
  const copy = bookingCopy(input);
  const results = await Promise.allSettled([
    sendMail(input.guestEmail, copy.subjectGuest, copy.textGuest),
    sendMail(input.notifyEmail, copy.subjectBusiness, copy.textBusiness),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[booklane:email:failed]", result.reason);
    }
  }
}
