import Link from "next/link";
import type { CreatedRequirement } from "@/lib/api";
import { formatDateRange } from "@/lib/format";
import { categoryLabel } from "@/lib/options";
import { Button, categoryBadge } from "./ui";

export function SuccessScreen({ result, onReset }: { result: CreatedRequirement; onReset: () => void }) {
  const r = result.requirement;
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
        ✓
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Requirement posted</h2>
        <p className="text-sm text-slate-600">
          Saved under{" "}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryBadge[result.category]}`}>
            {categoryLabel(result.category)}
          </span>{" "}
          requirements.
        </p>
      </div>
      <dl className="mx-auto max-w-sm divide-y divide-slate-100 rounded-xl border border-slate-200 text-left text-sm">
        {[
          ["Event", r.eventName],
          ["Date", formatDateRange(r.startDate, r.endDate)],
          ["Location", r.location],
          ["Reference ID", result.id],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-slate-500">{k}</dt>
            <dd className="truncate font-medium text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={onReset}>Post another requirement</Button>
        <Link
          href={`/requirements?category=${result.category}`}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View {categoryLabel(result.category)} requirements
        </Link>
      </div>
    </div>
  );
}
