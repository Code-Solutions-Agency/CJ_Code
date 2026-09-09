import { z } from "zod";
import { isSupportedTimezone } from "./timezones";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #1c4694");

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  businessName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
  timezone: z.string().refine(isSupportedTimezone, "Choose a supported timezone").optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const tenantUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  timezone: z.string().refine(isSupportedTimezone, "Choose a supported timezone"),
  primaryColor: hexColor,
  notifyEmail: z
    .string()
    .trim()
    .email()
    .max(120)
    .optional()
    .or(z.literal("")),
});

export const serviceCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  durationMinutes: z.number().int().min(15).max(480),
  priceCents: z.number().int().min(0).max(1_000_000).nullable().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

export const availabilitySchema = z.object({
  rules: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startMinute: z.number().int().min(0).max(24 * 60 - 1),
        endMinute: z.number().int().min(1).max(24 * 60),
        enabled: z.boolean(),
      }),
    )
    .length(7)
    .superRefine((rules, ctx) => {
      const days = new Set(rules.map((rule) => rule.dayOfWeek));
      if (days.size !== 7) {
        ctx.addIssue({ code: "custom", message: "Each weekday must appear once" });
      }
      for (const rule of rules) {
        if (rule.enabled && rule.endMinute <= rule.startMinute) {
          ctx.addIssue({
            code: "custom",
            message: "Closing time must be after opening time",
            path: ["rules", rule.dayOfWeek],
          });
        }
      }
    }),
});

export const publicBookingSchema = z.object({
  serviceId: z.string().min(1),
  startAt: z.iso.datetime({ offset: true }),
  guestName: z.string().trim().min(1).max(80),
  guestEmail: z.string().trim().email().max(120),
  guestPhone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
