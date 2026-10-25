import {
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  PLANNING_SCOPES,
  type Category,
  type Option,
} from "./options";

// Steps 2 and 3 are rendered from this config, so adding a field is a one-line change
// here plus its rule in lib/schema.ts.
type Base = { name: string; label: string; hint?: string; optional?: boolean };

export type FieldConfig =
  | (Base & { kind: "text" | "textarea"; placeholder?: string })
  | (Base & { kind: "number"; min?: number; max?: number; step?: number; suffix?: string })
  | (Base & { kind: "select" | "radio" | "chips"; options: Option[] })
  | (Base & { kind: "checkbox" })
  | (Base & { kind: "budget" })
  | (Base & { kind: "roles" });

export type StepConfig = { title: string; description: string; fields: FieldConfig[] };

const budget: FieldConfig = { kind: "budget", name: "budget", label: "Budget range (₹)" };
const notes: FieldConfig = {
  kind: "textarea",
  name: "notes",
  label: "Additional notes",
  optional: true,
  placeholder: "Anything else they should know",
};

export const CATEGORY_STEPS: Record<Category, [StepConfig, StepConfig]> = {
  planner: [
    {
      title: "Planning needs",
      description: "What should the planner take care of?",
      fields: [
        { kind: "chips", name: "services", label: "Services needed", options: PLANNER_SERVICES },
        { kind: "number", name: "guestCount", label: "Expected guests", min: 1, max: 100000, suffix: "guests" },
      ],
    },
    {
      title: "Scope & budget",
      description: "How involved should the planner be, and what can you spend?",
      fields: [
        { kind: "radio", name: "planningScope", label: "Planning scope", options: PLANNING_SCOPES },
        budget,
        notes,
      ],
    },
  ],
  performer: [
    {
      title: "Performance",
      description: "What kind of act are you looking for?",
      fields: [
        { kind: "select", name: "performerType", label: "Performer type", options: PERFORMER_TYPES },
        { kind: "text", name: "genre", label: "Genre / style", optional: true, placeholder: "e.g. Bollywood, Sufi, EDM" },
      ],
    },
    {
      title: "Set & budget",
      description: "How long should they perform, and what's your budget?",
      fields: [
        { kind: "number", name: "durationHours", label: "Performance duration", min: 0.5, max: 24, step: 0.5, suffix: "hours" },
        { kind: "number", name: "numberOfSets", label: "Number of sets", min: 1, max: 10 },
        { kind: "checkbox", name: "equipmentProvided", label: "Sound & stage equipment will be provided at the venue" },
        budget,
        notes,
      ],
    },
  ],
  crew: [
    {
      title: "Crew roles",
      description: "Which roles do you need, and how many people for each?",
      fields: [{ kind: "roles", name: "roles", label: "Roles needed" }],
    },
    {
      title: "Shift & budget",
      description: "Working hours, experience and budget for the crew.",
      fields: [
        { kind: "number", name: "shiftHours", label: "Shift length", min: 1, max: 24, suffix: "hours" },
        { kind: "radio", name: "experienceLevel", label: "Experience level", options: EXPERIENCE_LEVELS },
        budget,
        notes,
      ],
    },
  ],
};

// Which wizard step (1 or 2) owns a details field, used to jump to server-side errors.
export function stepForDetailsField(category: Category, field: string) {
  const idx = CATEGORY_STEPS[category].findIndex((s) => s.fields.some((f) => f.name === field));
  return idx === -1 ? 2 : idx + 1;
}
