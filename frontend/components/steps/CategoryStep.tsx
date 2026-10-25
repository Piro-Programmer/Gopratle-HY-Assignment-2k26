"use client";

import { CATEGORY_STEPS } from "@/lib/categoryConfig";
import type { Category } from "@/lib/options";
import { FieldRenderer } from "../FieldRenderer";

// Steps 2 and 3: fields come from the config for the category chosen in Step 1.
export function CategoryStep({ category, index }: { category: Category; index: 0 | 1 }) {
  const step = CATEGORY_STEPS[category][index];
  return (
    <div className="space-y-5">
      {step.fields.map((field) => (
        <FieldRenderer key={`${category}.${field.name}`} field={field} base={category} />
      ))}
    </div>
  );
}
