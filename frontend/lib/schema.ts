import { z } from "zod";
import {
  CREW_ROLES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNING_SCOPES,
  type Category,
  type Option,
} from "./options";

// Raw form state. Number inputs hold strings until validated.
export type FormValues = {
  eventName: string;
  eventType: string;
  dateType: "single" | "range";
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  category: Category | "";
  planner: {
    services: string[];
    guestCount: string;
    planningScope: string;
    budget: { min: string; max: string };
    notes: string;
  };
  performer: {
    performerType: string;
    genre: string;
    durationHours: string;
    numberOfSets: string;
    equipmentProvided: boolean;
    budget: { min: string; max: string };
    notes: string;
  };
  crew: {
    roles: { role: string; count: string }[];
    shiftHours: string;
    experienceLevel: string;
    budget: { min: string; max: string };
    notes: string;
  };
};

export const DEFAULT_VALUES: FormValues = {
  eventName: "",
  eventType: "",
  dateType: "single",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
  category: "",
  planner: { services: [], guestCount: "", planningScope: "", budget: { min: "", max: "" }, notes: "" },
  performer: {
    performerType: "",
    genre: "",
    durationHours: "",
    numberOfSets: "1",
    equipmentProvided: false,
    budget: { min: "", max: "" },
    notes: "",
  },
  crew: {
    roles: [{ role: "", count: "1" }],
    shiftHours: "",
    experienceLevel: "any",
    budget: { min: "", max: "" },
    notes: "",
  },
};

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

const required = (label: string) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

const oneOf = (options: Option[], label: string) =>
  z
    .string({ required_error: `Select ${label}` })
    .refine((v) => options.some((o) => o.value === v), `Select ${label}`);

const num = (label: string, min: number, max: number, int = false) => {
  let n = z.number({
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be a number`,
  });
  if (int) n = n.int(`${label} must be a whole number`);
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    n.min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`)
  );
};

const budget = z.object({
  min: num("Minimum budget", 0, 1_000_000_000),
  max: num("Maximum budget", 0, 1_000_000_000),
});

const checkBudget = (data: { budget: { min: number; max: number } }, ctx: z.RefinementCtx) => {
  if (data.budget.max < data.budget.min) {
    ctx.addIssue({ code: "custom", path: ["budget", "max"], message: "Maximum must be at least the minimum" });
  }
};

export const basicsSchema = z
  .object({
    eventName: required("Event name").pipe(z.string().max(120, "Keep it under 120 characters")),
    eventType: oneOf(EVENT_TYPES, "an event type"),
    dateType: z.enum(["single", "range"]),
    startDate: required("Date"),
    endDate: z.string().optional(),
    location: required("Location").pipe(z.string().max(120, "Keep it under 120 characters")),
    venue: optionalText(160),
    category: z.enum(["planner", "performer", "crew"], {
      errorMap: () => ({ message: "Choose who you are looking for" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.startDate < todayISO()) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "Date cannot be in the past" });
    }
    if (data.dateType === "range") {
      if (!data.endDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date is required" });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date" });
      }
    }
  })
  .transform(({ endDate, ...rest }) => ({
    ...rest,
    ...(rest.dateType === "range" ? { endDate } : {}),
  }));

export type Basics = z.infer<typeof basicsSchema>;

// Steps 2 and 3 for each category. Each schema validates its slice of form state.
export const stepSchemas: Record<Category, [z.ZodTypeAny, z.ZodTypeAny]> = {
  planner: [
    z.object({
      services: z.array(z.string()).min(1, "Select at least one service"),
      guestCount: num("Guest count", 1, 100000, true),
    }),
    z
      .object({
        planningScope: oneOf(PLANNING_SCOPES, "a planning scope"),
        budget,
        notes: optionalText(1000),
      })
      .superRefine(checkBudget),
  ],
  performer: [
    z.object({
      performerType: oneOf(PERFORMER_TYPES, "a performer type"),
      genre: optionalText(80),
    }),
    z
      .object({
        durationHours: num("Duration", 0.5, 24),
        numberOfSets: num("Number of sets", 1, 10, true),
        equipmentProvided: z.boolean(),
        budget,
        notes: optionalText(1000),
      })
      .superRefine(checkBudget),
  ],
  crew: [
    z.object({
      roles: z
        .array(z.object({ role: oneOf(CREW_ROLES, "a role"), count: num("Count", 1, 500, true) }))
        .min(1, "Add at least one crew role")
        .superRefine((roles, ctx) => {
          const seen = new Set<string>();
          roles.forEach((r, i) => {
            if (seen.has(r.role)) {
              ctx.addIssue({ code: "custom", path: [i, "role"], message: "This role is already listed" });
            }
            seen.add(r.role);
          });
        }),
    }),
    z
      .object({
        shiftHours: num("Shift length", 1, 24),
        experienceLevel: oneOf(EXPERIENCE_LEVELS, "an experience level"),
        budget,
        notes: optionalText(1000),
      })
      .superRefine(checkBudget),
  ],
};
