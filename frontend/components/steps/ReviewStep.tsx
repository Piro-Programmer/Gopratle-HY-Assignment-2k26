"use client";

import { useFormContext } from "react-hook-form";
import { CATEGORY_STEPS } from "@/lib/categoryConfig";
import { formatDateRange, formatField } from "@/lib/format";
import { EVENT_TYPES, categoryLabel, labelFor, type Category } from "@/lib/options";
import type { FormValues } from "@/lib/schema";
import { categoryBadge } from "../ui";

type Row = [label: string, value: string];

function Section({ title, rows, onEdit }: { title: string; rows: Row[]; onEdit: () => void }) {
  return (
    <section className="rounded-xl border border-slate-200">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Edit
        </button>
      </header>
      <dl className="divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 gap-1 px-4 py-2.5 text-sm sm:grid-cols-3 sm:gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="break-words text-slate-900 sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReviewStep({ onEdit }: { onEdit: (step: number) => void }) {
  const { getValues } = useFormContext<FormValues>();
  const v = getValues();
  const category = v.category as Category;
  const details = v[category] as Record<string, unknown>;

  const basics: Row[] = [
    ["Event name", v.eventName],
    ["Event type", labelFor(EVENT_TYPES, v.eventType)],
    ["Date", formatDateRange(v.startDate, v.dateType === "range" ? v.endDate : undefined)],
    ["Location", v.location],
    ["Venue", v.venue || "—"],
  ];

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-slate-600">
        This requirement will be posted under
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryBadge[category]}`}>
          {categoryLabel(category)}
        </span>
      </p>
      <Section title="Event basics" rows={basics} onEdit={() => onEdit(0)} />
      {CATEGORY_STEPS[category].map((step, i) => (
        <Section
          key={step.title}
          title={step.title}
          rows={step.fields.map((f) => [f.label, formatField(f, details[f.name])])}
          onEdit={() => onEdit(i + 1)}
        />
      ))}
    </div>
  );
}
