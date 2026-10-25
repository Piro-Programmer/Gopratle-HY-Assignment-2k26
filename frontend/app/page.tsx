import { RequirementWizard } from "@/components/RequirementWizard";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Post a requirement</h1>
        <p className="text-slate-600">Find the right event planner, performer or crew for your event in four quick steps.</p>
      </div>
      <RequirementWizard />
    </div>
  );
}
