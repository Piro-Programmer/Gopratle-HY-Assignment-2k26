// Allowed values shared by the Mongoose schemas and the Zod validators.

export const CATEGORIES = ["planner", "performer", "crew"];

export const EVENT_TYPES = [
  "wedding",
  "corporate",
  "birthday",
  "concert",
  "festival",
  "private_party",
  "other",
];

export const DATE_TYPES = ["single", "range"];

export const PLANNER_SERVICES = [
  "decor",
  "catering",
  "venue_booking",
  "logistics",
  "entertainment",
  "photography",
  "invitations",
  "full_coordination",
];

export const PLANNING_SCOPES = ["full", "partial", "day_of"];

export const PERFORMER_TYPES = [
  "singer",
  "band",
  "dj",
  "dancer",
  "comedian",
  "magician",
  "anchor",
  "instrumentalist",
  "other",
];

export const CREW_ROLES = [
  "sound_engineer",
  "lighting",
  "photographer",
  "videographer",
  "stagehand",
  "security",
  "makeup_artist",
  "runner",
  "other",
];

export const EXPERIENCE_LEVELS = ["any", "junior", "mid", "senior"];

export const STATUSES = ["open", "closed"];
