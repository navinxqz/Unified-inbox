"use client";

import {
  ArrowRight,
  Check,
  ClipboardList,
  Power,
  Rocket,
} from "lucide-react";

import {
  ModuleShell,
  Pill,
  SectionCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { hiddenModules } from "@/features/inbox/data";
import type { ModuleId, SetupState } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type SetupProps = {
  setup: SetupState;
  onUpdate: (setup: SetupState) => void;
  onGoLive: () => void;
  onNavigate: (module: ModuleId) => void;
};

export function SetupModule({ setup, onUpdate, onGoLive, onNavigate }: SetupProps) {
  const done = setup.steps.filter((step) => step.done).length;
  const total = setup.steps.length;
  const allDone = done === total;

  function toggleStep(stepId: string) {
    onUpdate({
      ...setup,
      steps: setup.steps.map((step) =>
        step.id === stepId ? { ...step, done: !step.done } : step,
      ),
    });
  }

  return (
    <ModuleShell
      title="Setup guide"
      subtitle="Eight steps from empty desk to live. Resumable — everything you finish stays finished."
      walkthrough={{
        title: "Get to go-live",
        steps: [
          "Work down the checklist; each step opens the page where you finish it.",
          "Practice mode keeps test chats internal — your trial starts at go-live.",
          "You can mark steps done manually if you finished them outside the app.",
          "When all eight are done, Go live leaves practice mode and starts the trial.",
        ],
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <SectionCard
          title="Checklist"
          description={`${done} of ${total} steps complete`}
        >
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>

          <div className="divide-y divide-border-subtle">
            {setup.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2.5 py-2.5">
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  aria-pressed={step.done}
                  aria-label={`Mark “${step.label}” ${step.done ? "not done" : "done"}`}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
                    step.done
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted-foreground hover:border-primary",
                  )}
                >
                  {step.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                </button>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[13px]",
                    step.done ? "text-muted-foreground line-through" : "font-medium",
                  )}
                >
                  {step.label}
                </span>
                <button
                  type="button"
                  disabled={hiddenModules.has(step.module)}
                  onClick={() => onNavigate(step.module)}
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  {hiddenModules.has(step.module) ? "Soon" : "Open"}
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Practice mode" description="Test everything without touching customers.">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Pill tone={setup.practiceMode ? "warning" : "success"}>
                  {setup.practiceMode ? "Practice" : "Live"}
                </Pill>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  In practice mode, test conversations stay internal and the AI never
                  contacts a real customer. The trial clock starts at go-live.
                </p>
              </div>
              <Toggle
                checked={setup.practiceMode}
                onChange={(checked) =>
                  onUpdate({ ...setup, practiceMode: checked })
                }
                label="Practice mode"
              />
            </div>
          </SectionCard>

          <SectionCard title="Go live" description="Leaves practice mode and starts the trial.">
            <button
              type="button"
              onClick={onGoLive}
              disabled={!allDone || !setup.practiceMode}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setup.practiceMode ? (
                <>
                  <Rocket className="size-4" />
                  Go live
                </>
              ) : (
                <>
                  <Power className="size-4" />
                  Live{setup.liveSince ? ` · ${setup.liveSince}` : ""}
                </>
              )}
            </button>
            {!allDone ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ClipboardList className="size-3.5" />
                Finish all {total} steps to unlock go-live.
              </p>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </ModuleShell>
  );
}
