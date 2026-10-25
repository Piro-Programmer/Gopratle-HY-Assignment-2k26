import { z } from "zod";
import {
  CATEGORIES,
  CREW_ROLES,
  DATE_TYPES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  PLANNING_SCOPES,
} from "../constants.js";

const isoDate = z
  .string({ required_error: "Date is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

const trimmed = (max, label) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`).max(max);

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const budget = z.object({
  min: z.number({ required_error: "Minimum budget is required" }).nonnegative(),
  max: z.number({ required_error: "Maximum budget is required" }).nonnegative(),
});

const base = z.object({
  eventName: trimmed(120, "Event name"),
  eventType: z.enum(EVENT_TYPES),
  dateType: z.enum(DATE_TYPES),
  startDate: isoDate,
  endDate: isoDate.optional(),
  location: trimmed(120, "Location"),
  venue: optionalText(160),
});

const plannerDetails = z.object({
  services: z.array(z.enum(PLANNER_SERVICES)).min(1, "Select at least one service"),
  guestCount: z.number().int().min(1).max(100000),
  planningScope: z.enum(PLANNING_SCOPES),
  budget,
  notes: optionalText(1000),
});

const performerDetails = z.object({
  performerType: z.enum(PERFORMER_TYPES),
  genre: optionalText(80),
  durationHours: z.number().min(0.5).max(24),
  numberOfSets: z.number().int().min(1).max(10),
  equipmentProvided: z.boolean().default(false),
  budget,
  notes: optionalText(1000),
});

const crewDetails = z.object({
  roles: z
    .array(z.object({ role: z.enum(CREW_ROLES), count: z.number().int().min(1).max(500) }))
    .min(1, "Add at least one crew role")
    .refine(
      (roles) => new Set(roles.map((r) => r.role)).size === roles.length,
      "Each role can only be listed once"
    ),
  shiftHours: z.number().min(1).max(24),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  budget,
  notes: optionalText(1000),
});

export const requirementSchema = z
  .discriminatedUnion(
    "category",
    [
      base.extend({ category: z.literal("planner"), details: plannerDetails }),
      base.extend({ category: z.literal("performer"), details: performerDetails }),
      base.extend({ category: z.literal("crew"), details: crewDetails }),
    ],
    {
      errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(", ")}` }),
    }
  )
  .superRefine((data, ctx) => {
    // Allow "yesterday" to absorb timezone differences between client and server.
    const earliest = new Date();
    earliest.setUTCDate(earliest.getUTCDate() - 1);
    const earliestStr = earliest.toISOString().slice(0, 10);

    if (data.startDate < earliestStr) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "Date cannot be in the past" });
    }
    if (data.dateType === "range") {
      if (!data.endDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date is required for a date range" });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after start date" });
      }
    }
    if (data.details.budget.max < data.details.budget.min) {
      ctx.addIssue({
        code: "custom",
        path: ["details", "budget", "max"],
        message: "Maximum budget must be greater than or equal to minimum",
      });
    }
  })
  .transform((data) => ({
    ...data,
    // A single-day event is stored with endDate === startDate so range queries stay simple.
    endDate: data.dateType === "single" ? data.startDate : data.endDate,
  }));

export const listQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Turns Zod issues into { "details.budget.max": "message" } for easy form mapping.
export function formatZodError(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    fields[key] ??= issue.message;
  }
  return fields;
}
