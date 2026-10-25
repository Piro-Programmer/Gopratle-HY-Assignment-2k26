"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/categoryConfig";
import { CREW_ROLES } from "@/lib/options";
import { FieldShell, getError, inputClass } from "./ui";

// Renders one config-driven field. `base` is the category key, e.g. "planner".
export function FieldRenderer({ field, base }: { field: FieldConfig; base: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const path = `${base}.${field.name}`;
  const error = getError(errors, path);
  const common = { label: field.label, optional: field.optional, hint: field.hint, error };

  switch (field.kind) {
    case "text":
      return (
        <FieldShell {...common} htmlFor={path}>
          <input id={path} className={inputClass} placeholder={field.placeholder} aria-invalid={!!error} {...register(path)} />
        </FieldShell>
      );

    case "textarea":
      return (
        <FieldShell {...common} htmlFor={path}>
          <textarea id={path} rows={3} className={inputClass} placeholder={field.placeholder} aria-invalid={!!error} {...register(path)} />
        </FieldShell>
      );

    case "number":
      return (
        <FieldShell {...common} htmlFor={path}>
          <div className="relative">
            <input
              id={path}
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              className={`${inputClass} ${field.suffix ? "pr-16" : ""}`}
              aria-invalid={!!error}
              {...register(path)}
            />
            {field.suffix && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
                {field.suffix}
              </span>
            )}
          </div>
        </FieldShell>
      );

    case "select":
      return (
        <FieldShell {...common} htmlFor={path}>
          <select id={path} className={inputClass} aria-invalid={!!error} {...register(path)}>
            <option value="">Select…</option>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case "radio":
      return (
        <FieldShell {...common} as="fieldset">
          <div className="grid gap-2 sm:grid-cols-3">
            {field.options.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-indigo-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-900"
              >
                <input type="radio" value={o.value} className="accent-indigo-600" {...register(path)} />
                {o.label}
              </label>
            ))}
          </div>
        </FieldShell>
      );

    case "chips":
      return (
        <FieldShell {...common} as="fieldset">
          <Controller
            name={path}
            control={control}
            render={({ field: f }) => {
              const value: string[] = f.value ?? [];
              return (
                <div className="flex flex-wrap gap-2">
                  {field.options.map((o) => {
                    const selected = value.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => f.onChange(selected ? value.filter((v) => v !== o.value) : [...value, o.value])}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                          selected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        {selected && "✓ "}
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              );
            }}
          />
        </FieldShell>
      );

    case "checkbox":
      return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-600" {...register(path)} />
          {field.label}
        </label>
      );

    case "budget": {
      const minErr = getError(errors, `${path}.min`);
      const maxErr = getError(errors, `${path}.max`);
      return (
        <FieldShell {...common} error={minErr ?? maxErr} as="fieldset">
          <div className="grid grid-cols-2 gap-3">
            {(["min", "max"] as const).map((k) => (
              <div key={k} className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  placeholder={k === "min" ? "Minimum" : "Maximum"}
                  aria-label={k === "min" ? "Minimum budget" : "Maximum budget"}
                  aria-invalid={!!(k === "min" ? minErr : maxErr)}
                  className={`${inputClass} pl-7`}
                  {...register(`${path}.${k}`)}
                />
              </div>
            ))}
          </div>
        </FieldShell>
      );
    }

    case "roles":
      return <RolesField path={path} label={field.label} />;
  }
}

function RolesField({ path, label }: { path: string; label: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: path });
  const rootError = getError(errors, `${path}.root`) ?? getError(errors, path);

  return (
    <FieldShell label={label} error={rootError} as="fieldset">
      <div className="space-y-2">
        {fields.map((row, i) => {
          const roleErr = getError(errors, `${path}.${i}.role`);
          const countErr = getError(errors, `${path}.${i}.count`);
          return (
            <div key={row.id}>
              <div className="flex gap-2">
                <select
                  aria-label={`Role ${i + 1}`}
                  aria-invalid={!!roleErr}
                  className={`${inputClass} flex-1`}
                  {...register(`${path}.${i}.role`)}
                >
                  <option value="">Select role…</option>
                  {CREW_ROLES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={500}
                  aria-label={`People needed for role ${i + 1}`}
                  aria-invalid={!!countErr}
                  className={`${inputClass} w-24`}
                  {...register(`${path}.${i}.count`)}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                  aria-label={`Remove role ${i + 1}`}
                  className="rounded-lg px-3 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:invisible"
                >
                  ✕
                </button>
              </div>
              {(roleErr || countErr) && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {roleErr ?? countErr}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => append({ role: "", count: "1" })}
        disabled={fields.length >= CREW_ROLES.length}
        className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400"
      >
        + Add another role
      </button>
    </FieldShell>
  );
}
