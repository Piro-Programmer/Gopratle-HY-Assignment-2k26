export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                      ? "border-2 border-indigo-600 bg-white text-indigo-600"
                      : "border-2 border-slate-300 bg-white text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`hidden truncate text-xs font-medium md:block ${active ? "text-slate-900" : "text-slate-500"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <span className={`h-0.5 flex-1 rounded ${done ? "bg-indigo-600" : "bg-slate-200"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
