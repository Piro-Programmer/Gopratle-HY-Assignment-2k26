"use client";

import { useFormContext } from "react-hook-form";
import { CATEGORIES, EVENT_TYPES } from "@/lib/options";
import { todayISO, type FormValues } from "@/lib/schema";
import { FieldShell, inputClass } from "../ui";

export function BasicsStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();
  const dateType = watch("dateType");
  const startDate = watch("startDate");
  const today = todayISO();

  return (
    <div className="space-y-5">
      <FieldShell label="Event name" htmlFor="eventName" error={errors.eventName?.message}>
        <input
          id="eventName"
          className={inputClass}
          placeholder="e.g. Sharma Wedding Reception"
          aria-invalid={!!errors.eventName}
          {...register("eventName")}
        />
      </FieldShell>

      <FieldShell label="Event type" htmlFor="eventType" error={errors.eventType?.message}>
        <select id="eventType" className={inputClass} aria-invalid={!!errors.eventType} {...register("eventType")}>
          <option value="">Select…</option>
          {EVENT_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell label="When is it?" as="fieldset">
        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 text-sm">
          {(
            [
              ["single", "Single day"],
              ["range", "Multiple days"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="cursor-pointer rounded-md px-3 py-1.5 text-slate-600 has-[:checked]:bg-white has-[:checked]:font-semibold has-[:checked]:text-slate-900 has-[:checked]:shadow-sm"
            >
              <input type="radio" value={value} className="sr-only" {...register("dateType")} />
              {label}
            </label>
          ))}
        </div>
        <div className={`grid gap-3 ${dateType === "range" ? "sm:grid-cols-2" : ""}`}>
          <FieldShell label={dateType === "range" ? "Start date" : "Date"} htmlFor="startDate" error={errors.startDate?.message}>
            <input id="startDate" type="date" min={today} className={inputClass} aria-invalid={!!errors.startDate} {...register("startDate")} />
          </FieldShell>
          {dateType === "range" && (
            <FieldShell label="End date" htmlFor="endDate" error={errors.endDate?.message}>
              <input
                id="endDate"
                type="date"
                min={startDate || today}
                className={inputClass}
                aria-invalid={!!errors.endDate}
                {...register("endDate")}
              />
            </FieldShell>
          )}
        </div>
      </FieldShell>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell label="Location" htmlFor="location" error={errors.location?.message}>
          <input id="location" className={inputClass} placeholder="City, e.g. Jaipur" aria-invalid={!!errors.location} {...register("location")} />
        </FieldShell>
        <FieldShell label="Venue" htmlFor="venue" optional error={errors.venue?.message}>
          <input id="venue" className={inputClass} placeholder="e.g. Rambagh Palace" {...register("venue")} />
        </FieldShell>
      </div>

      <FieldShell label="Who are you looking for?" as="fieldset" error={errors.category?.message}>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <label
              key={c.value}
              className="relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-4 transition hover:border-indigo-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
            >
              <input type="radio" value={c.value} className="sr-only" {...register("category")} />
              <span className="font-semibold text-slate-900">{c.label}</span>
              <span className="text-xs leading-relaxed text-slate-500">{c.description}</span>
            </label>
          ))}
        </div>
      </FieldShell>
    </div>
  );
}
