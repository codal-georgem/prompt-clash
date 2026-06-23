"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { submitPromptAction } from "@/lib/actions/submissions";
import type { Scenario } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  scenarioId: z.string().uuid("Please select a scenario"),
  promptText: z.string().min(20, "Prompt must be at least 20 characters"),
});

type FormValues = z.infer<typeof schema>;

type SubmissionFormProps = {
  scenarios: Scenario[];
  lockedScenario?: Scenario;
  onSubmitted?: () => void;
};

export function SubmissionForm({
  scenarios,
  lockedScenario,
  onSubmitted,
}: SubmissionFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scenarioId: lockedScenario?.id ?? "",
      promptText: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await submitPromptAction(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      reset();
      onSubmitted?.();
    });
  };

  const selectedScenarioId = watch("scenarioId");
  const selectedScenario =
    lockedScenario ??
    scenarios.find((scenario) => scenario.id === selectedScenarioId);
  const [area, title] = selectedScenario?.title.includes("|")
    ? selectedScenario.title.split("|").map((part) => part.trim())
    : ["General", selectedScenario?.title ?? ""];

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-7 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.45)] md:px-8">
      <header className="mb-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
          Submit Your Prompt
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Scenario and prompt are required. Prompt must be at least 20
          characters.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {lockedScenario ? (
          <input type="hidden" value={lockedScenario.id} {...register("scenarioId")} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scenarioId">Scenario</Label>
              <Select id="scenarioId" {...register("scenarioId")}>
                <option value="">Select a scenario</option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title}
                  </option>
                ))}
              </Select>
              {errors.scenarioId ? (
                <p className="text-sm text-danger">{errors.scenarioId.message}</p>
              ) : null}
            </div>

            {selectedScenario ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  Selected Scenario
                </p>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
                    Area: {area}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  <span className="text-slate-500">Title: </span>
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-slate-500">Description: </span>
                  {selectedScenario.description}
                </p>
              </article>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Select a scenario to preview it here.
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="promptText">Prompt</Label>
          <Textarea
            id="promptText"
            rows={9}
            placeholder="Write a detailed prompt with context, constraints, and expected output format"
            {...register("promptText")}
          />
          {errors.promptText ? (
            <p className="text-sm text-danger">{errors.promptText.message}</p>
          ) : null}
        </div>

        <Button
          className="w-full sm:w-auto"
          disabled={isPending}
          size="lg"
          type="submit"
        >
          {isPending ? "Submitting..." : "Submit Prompt"}
        </Button>
      </form>
    </section>
  );
}
