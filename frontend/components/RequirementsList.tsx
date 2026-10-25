"use client";

import { useEffect, useState } from "react";
import { listRequirements, type Requirement } from "@/lib/api";
import { CATEGORY_STEPS } from "@/lib/categoryConfig";
import { formatDateRange, formatField } from "@/lib/format";
import { CATEGORIES, EVENT_TYPES, categoryLabel, labelFor, type Category } from "@/lib/options";
import { categoryBadge } from "./ui";

const TABS: { value?: Category; label: string }[] = [{ label: "All" }, ...CATEGORIES];

export function RequirementsList({ initialCategory }: { initialCategory?: Category }) {
  const [category, setCategory] = useState<Category | undefined>(initialCategory);
  const [items, setItems] = useState<Requirement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    listRequirements(category)
      .then((res) => !cancelled && setItems(res.items))
      .catch((err: Error) => !cancelled && setError(err.message));
    // Keep the URL shareable without a full navigation.
    const url = category ? `/requirements?category=${category}` : "/requirements";
    window.history.replaceState(null, "", url);
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={category === t.value}
            onClick={() => setCategory(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === t.value ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!items && !error && <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}
      {items?.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
          No {category ? categoryLabel(category).toLowerCase() : ""} requirements yet.
        </p>
      )}

      <ul className="space-y-3">
        {items?.map((r) => {
          const fields = CATEGORY_STEPS[r.category].flatMap((s) => s.fields).filter((f) => f.name !== "notes");
          return (
            <li key={r._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.eventName}</h3>
                  <p className="text-sm text-slate-500">
                    {labelFor(EVENT_TYPES, r.eventType)} · {formatDateRange(r.startDate, r.endDate)} · {r.location}
                    {r.venue ? `, ${r.venue}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryBadge[r.category]}`}>
                  {categoryLabel(r.category)}
                </span>
              </div>
              <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className="flex gap-2">
                    <dt className="shrink-0 text-slate-500">{f.label}:</dt>
                    <dd className="truncate text-slate-800">{formatField(f, r.details[f.name])}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
