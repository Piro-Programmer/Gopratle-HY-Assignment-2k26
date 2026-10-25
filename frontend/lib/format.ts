import type { FieldConfig } from "./categoryConfig";
import { CREW_ROLES, labelFor } from "./options";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateRange(start?: string, end?: string) {
  const s = formatDate(start);
  const e = formatDate(end);
  return !e || s === e ? s : `${s} – ${e}`;
}

export function formatBudget(budget?: { min: string | number; max: string | number }) {
  if (!budget || budget.min === "" || budget.max === "") return "—";
  return `${inr.format(Number(budget.min))} – ${inr.format(Number(budget.max))}`;
}

// Human-readable value for any config-driven field (used by the review step and listing).
export function formatField(field: FieldConfig, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  switch (field.kind) {
    case "select":
    case "radio":
      return labelFor(field.options, value as string);
    case "chips":
      return (value as string[]).map((v) => labelFor(field.options, v)).join(", ") || "—";
    case "checkbox":
      return value ? "Yes" : "No";
    case "number":
      return field.suffix ? `${value} ${field.suffix}` : String(value);
    case "budget":
      return formatBudget(value as { min: string; max: string });
    case "roles":
      return (
        (value as { role: string; count: string | number }[])
          .filter((r) => r.role)
          .map((r) => `${r.count} × ${labelFor(CREW_ROLES, r.role)}`)
          .join(", ") || "—"
      );
    default:
      return String(value);
  }
}
