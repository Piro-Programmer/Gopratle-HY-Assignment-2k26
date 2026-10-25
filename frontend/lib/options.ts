// Select options. Values must match the backend enums in backend/src/constants.js.

export type Category = "planner" | "performer" | "crew";
export type Option = { value: string; label: string };

const opts = (pairs: [string, string][]): Option[] =>
  pairs.map(([value, label]) => ({ value, label }));

export const CATEGORIES: (Option & { value: Category; description: string })[] = [
  { value: "planner", label: "Event Planner", description: "Plan, coordinate and manage the event end to end" },
  { value: "performer", label: "Performer", description: "Singers, DJs, bands, dancers and other acts" },
  { value: "crew", label: "Crew", description: "Sound, lighting, photography and on-ground staff" },
];

export const EVENT_TYPES = opts([
  ["wedding", "Wedding"],
  ["corporate", "Corporate"],
  ["birthday", "Birthday"],
  ["concert", "Concert"],
  ["festival", "Festival"],
  ["private_party", "Private party"],
  ["other", "Other"],
]);

export const PLANNER_SERVICES = opts([
  ["decor", "Decor"],
  ["catering", "Catering"],
  ["venue_booking", "Venue booking"],
  ["logistics", "Logistics"],
  ["entertainment", "Entertainment"],
  ["photography", "Photography"],
  ["invitations", "Invitations"],
  ["full_coordination", "Full coordination"],
]);

export const PLANNING_SCOPES = opts([
  ["full", "Full planning"],
  ["partial", "Partial planning"],
  ["day_of", "Day-of coordination"],
]);

export const PERFORMER_TYPES = opts([
  ["singer", "Singer"],
  ["band", "Band"],
  ["dj", "DJ"],
  ["dancer", "Dancer"],
  ["comedian", "Comedian"],
  ["magician", "Magician"],
  ["anchor", "Anchor / Emcee"],
  ["instrumentalist", "Instrumentalist"],
  ["other", "Other"],
]);

export const CREW_ROLES = opts([
  ["sound_engineer", "Sound engineer"],
  ["lighting", "Lighting technician"],
  ["photographer", "Photographer"],
  ["videographer", "Videographer"],
  ["stagehand", "Stagehand"],
  ["security", "Security"],
  ["makeup_artist", "Makeup artist"],
  ["runner", "Runner"],
  ["other", "Other"],
]);

export const EXPERIENCE_LEVELS = opts([
  ["any", "Any"],
  ["junior", "Junior"],
  ["mid", "Mid-level"],
  ["senior", "Senior"],
]);

export function labelFor(options: Option[], value?: string) {
  return options.find((o) => o.value === value)?.label ?? value ?? "";
}

export function categoryLabel(value?: string) {
  return labelFor(CATEGORIES, value);
}
