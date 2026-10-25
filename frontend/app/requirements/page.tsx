import { RequirementsList } from "@/components/RequirementsList";
import type { Category } from "@/lib/options";

const VALID = ["planner", "performer", "crew"];

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initial = category && VALID.includes(category) ? (category as Category) : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Posted requirements</h1>
        <p className="text-slate-600">Every requirement is stored under its category.</p>
      </div>
      <RequirementsList initialCategory={initial} />
    </div>
  );
}
