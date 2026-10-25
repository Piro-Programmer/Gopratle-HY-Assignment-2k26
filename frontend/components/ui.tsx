import type { ReactNode } from "react";

export const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 " +
  "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-500/10";

export function getError(errors: unknown, path: string): string | undefined {
  const node = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], errors) as
    | { message?: string }
    | undefined;
  return node?.message;
}

type FieldShellProps = {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  as?: "div" | "fieldset";
};

export function FieldShell({ label, htmlFor, optional, hint, error, children, as = "div" }: FieldShellProps) {
  const Tag = as;
  const LabelTag = as === "fieldset" ? "legend" : "label";
  return (
    <Tag className="space-y-1.5">
      <LabelTag htmlFor={as === "fieldset" ? undefined : htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
      </LabelTag>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </Tag>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50",
    ghost: "text-indigo-600 hover:bg-indigo-50",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}

export const categoryBadge: Record<string, string> = {
  planner: "bg-violet-100 text-violet-700",
  performer: "bg-amber-100 text-amber-800",
  crew: "bg-emerald-100 text-emerald-700",
};
