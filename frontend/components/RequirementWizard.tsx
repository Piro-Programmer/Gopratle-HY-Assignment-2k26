"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import type { ZodTypeAny } from "zod";
import { ApiError, createRequirement, type CreatedRequirement } from "@/lib/api";
import { CATEGORY_STEPS, stepForDetailsField } from "@/lib/categoryConfig";
import type { Category } from "@/lib/options";
import { DEFAULT_VALUES, basicsSchema, stepSchemas, type FormValues } from "@/lib/schema";
import { Stepper } from "./Stepper";
import { SuccessScreen } from "./SuccessScreen";
import { BasicsStep } from "./steps/BasicsStep";
import { CategoryStep } from "./steps/CategoryStep";
import { ReviewStep } from "./steps/ReviewStep";
import { Button } from "./ui";

const LAST_STEP = 3;

export function RequirementWizard() {
  const methods = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });
  const { getValues, setError, clearErrors, watch, reset } = methods;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [slow, setSlow] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedRequirement | null>(null);
  const inFlight = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const category = watch("category") as Category | "";

  // Clear a field's error as soon as the user edits it.
  useEffect(() => {
    const sub = watch((_values, { name }) => {
      if (name) clearErrors(name as FieldPath<FormValues>);
    });
    return () => sub.unsubscribe();
  }, [watch, clearErrors]);

  const stepTitles = [
    "Event basics",
    category ? CATEGORY_STEPS[category][0].title : "Details",
    category ? CATEGORY_STEPS[category][1].title : "Requirements",
    "Review & submit",
  ];

  function setFieldError(path: (string | number)[], message: string, focus: boolean) {
    let name = path.join(".");
    // Array-level errors on a field array live under `.root` in react-hook-form.
    if (path[path.length - 1] === "roles") name += ".root";
    setError(name as FieldPath<FormValues>, { type: "validate", message }, { shouldFocus: focus });
  }

  // Validates one schema against a slice of form state and copies issues onto the form.
  function check<T>(schema: ZodTypeAny, value: unknown, prefix: string[]): T | null {
    const parsed = schema.safeParse(value);
    if (parsed.success) return parsed.data as T;
    parsed.error.issues.forEach((issue, i) => setFieldError([...prefix, ...issue.path], issue.message, i === 0));
    return null;
  }

  function validateStep(s: number) {
    clearErrors();
    const values = getValues();
    if (s === 0) return check(basicsSchema, values, []);
    const cat = values.category as Category;
    return check<Record<string, unknown>>(stepSchemas[cat][s - 1], values[cat], [cat]);
  }

  function goTo(s: number) {
    setStep(s);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    if (validateStep(step)) goTo(step + 1);
  }

  async function submit() {
    if (inFlight.current) return;

    // Re-validate every step; jump back to the first one with a problem.
    const basics = validateStep(0) as ReturnType<typeof basicsSchema.parse> | null;
    if (!basics) return goTo(0);
    const part1 = validateStep(1);
    if (!part1) return goTo(1);
    const part2 = validateStep(2);
    if (!part2) return goTo(2);

    const cat = basics.category;
    inFlight.current = true;
    setSubmitting(true);
    setSubmitError(null);
    const slowTimer = setTimeout(() => setSlow(true), 4000);

    try {
      const created = await createRequirement({ ...basics, details: { ...part1, ...part2 } });
      setResult(created);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        // Map server field errors ("details.budget.max") back onto the form and its step.
        let target = LAST_STEP;
        const entries = Object.entries(err.fields);
        entries.forEach(([key, message], i) => {
          const parts = key.split(".");
          if (parts[0] === "details") {
            target = Math.min(target, stepForDetailsField(cat, parts[1]));
            setTimeout(() => setFieldError([cat, ...parts.slice(1)], message, i === 0));
          } else {
            target = 0;
            setTimeout(() => setFieldError(parts, message, i === 0));
          }
        });
        goTo(target);
        setSubmitError("Please fix the highlighted fields.");
      } else {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      clearTimeout(slowTimer);
      inFlight.current = false;
      setSubmitting(false);
      setSlow(false);
    }
  }

  function startOver() {
    reset(DEFAULT_VALUES);
    setResult(null);
    goTo(0);
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SuccessScreen result={result} onReset={startOver} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="scroll-mt-6 space-y-6">
        <Stepper steps={stepTitles} current={step} />

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < LAST_STEP) next();
            else submit();
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Step {step + 1} of {LAST_STEP + 1}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{stepTitles[step]}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === 0 && "Tell us about your event and who you need."}
              {(step === 1 || step === 2) && category && CATEGORY_STEPS[category][step - 1].description}
              {step === LAST_STEP && "Check everything before posting."}
            </p>
          </header>

          {step === 0 && <BasicsStep />}
          {step === 1 && category && <CategoryStep category={category} index={0} />}
          {step === 2 && category && <CategoryStep category={category} index={1} />}
          {step === LAST_STEP && <ReviewStep onEdit={goTo} />}

          {submitError && (
            <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <footer className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => goTo(step - 1)}
              disabled={step === 0 || submitting}
              className={step === 0 ? "invisible" : ""}
            >
              ← Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {step < LAST_STEP ? "Continue →" : submitting ? (slow ? "Waking up server…" : "Posting…") : "Post requirement"}
            </Button>
          </footer>
          {slow && (
            <p className="mt-3 text-right text-xs text-slate-500">
              The free-tier server may take up to a minute to start. Please keep this page open.
            </p>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
