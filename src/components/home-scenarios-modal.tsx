"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ScenarioCard } from "@/components/scenario-card";
import { SubmissionForm } from "@/components/submission-form";
import { Button } from "@/components/ui/button";
import type { Scenario } from "@/types/domain";

type HomeScenariosModalProps = {
  scenarios: Scenario[];
};

export function HomeScenariosModal({ scenarios }: HomeScenariosModalProps) {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (!activeScenario) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeScenario]);

  return (
    <>
      <section className="mt-10">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">Scenarios</h2>
        <p className="text-sm text-slate-600 my-4">
          Click any scenario card to open details and submit your prompt in a modal.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} onClick={() => setActiveScenario(scenario)} scenario={scenario} />
          ))}
        </div>
      </section>

      {activeScenario ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/65 p-4 backdrop-blur-[2px] md:items-center"
          onClick={() => setActiveScenario(null)}
        >
          <div
            className="relative my-4 w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:my-0 md:max-h-[90vh] md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-2xl font-bold text-slate-900">Submit Prompt For Selected Scenario</h3>
              <Button onClick={() => setActiveScenario(null)} size="sm" variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_1.6fr]">
              <ScenarioCard scenario={activeScenario} />
              <SubmissionForm
                lockedScenario={activeScenario}
                onSubmitted={() => setActiveScenario(null)}
                scenarios={scenarios}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
