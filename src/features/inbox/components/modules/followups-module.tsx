"use client";

import { Check, Clock, RefreshCw, Send, SkipForward } from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import {
  initialFollowupRules,
  initialFollowups,
} from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { FollowupItem, FollowupRules } from "@/features/inbox/types";

type FollowupsProps = {
  logActivity: (action: string, subject: string) => void;
};

export function FollowupsModule({ logActivity }: FollowupsProps) {
  const [rules, setRules] = useStoredState<FollowupRules>(
    MODULE_STORAGE_KEYS.followupRules,
    initialFollowupRules,
  );
  const [queue, setQueue] = useStoredState<FollowupItem[]>(
    MODULE_STORAGE_KEYS.followups,
    initialFollowups,
  );

  const due = queue.filter((item) => item.status === "due");

  function sendNow(item: FollowupItem) {
    setQueue(
      queue.map((row) =>
        row.id === item.id ? { ...row, status: "sent", sent: row.sent + 1 } : row,
      ),
    );
    logActivity(`sent follow-up to ${item.customer}`, "Follow-ups");
  }

  function skip(item: FollowupItem) {
    setQueue(
      queue.map((row) => (row.id === item.id ? { ...row, status: "skipped" } : row)),
    );
    logActivity(`skipped follow-up for ${item.customer} (reason recorded)`, "Follow-ups");
  }

  return (
    <ModuleShell
      title="Follow-ups"
      subtitle="Automatic nudges for conversations that went quiet, capped so nobody gets spammed."
      walkthrough={{
        title: "Tune follow-ups in 1 minute",
        steps: [
          "The AI waits the judgment delay before deciding a conversation went cold.",
          "Hot leads get up to two nudges: the first after 3 hours, the second 20 hours later.",
          "Warm leads get one nudge after 20 hours.",
          "Every follow-up is logged in the audit trail and counts against the cap.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Due now" value={String(due.length)} icon={Clock} tone="warning" />
        <StatCard
          label="Sent today"
          value={String(queue.filter((item) => item.status === "sent").length)}
          icon={Send}
          tone="success"
        />
        <StatCard
          label="Skipped"
          value={String(queue.filter((item) => item.status === "skipped").length)}
          icon={SkipForward}
        />
        <StatCard
          label="Ordered after follow-up"
          value="14"
          sub="conversions attributed"
          icon={Check}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <SectionCard
          title="Queue"
          description="Only conversations that went quiet land here."
        >
          {queue.length === 0 ? (
            <EmptyState icon={RefreshCw} title="Queue is empty" text="Follow-ups appear when a conversation goes cold." />
          ) : (
            <div className="divide-y divide-border-subtle">
              {queue.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-2.5 py-2.5">
                  <Pill tone={item.type === "hot" ? "danger" : "info"}>
                    {item.type === "hot" ? "Hot" : "Warm"}
                  </Pill>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{item.customer}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{item.reason}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ChannelIcon channel={item.channel} className="size-3" />
                    {item.dueAt}
                  </span>
                  <span className="text-[11px] text-muted-foreground">sent {item.sent}×</span>
                  {item.status === "due" ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => sendNow(item)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary/90"
                      >
                        <Send className="size-3.5" />
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => skip(item)}
                        className="h-8 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                      >
                        Skip
                      </button>
                    </div>
                  ) : (
                    <Pill tone={item.status === "sent" ? "success" : "neutral"}>
                      {item.status}
                    </Pill>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Rules" description="Applies to every channel.">
          <div className="space-y-3">
            <Field label="Judgment delay (hours)" hint="How long the AI waits before deciding a chat went cold.">
              <input
                type="number"
                min={1}
                max={48}
                value={rules.judgmentDelayH}
                onChange={(event) =>
                  setRules({ ...rules, judgmentDelayH: Number(event.target.value) || 1 })
                }
                className={inputClass}
              />
            </Field>

            <div className="rounded-lg border border-border-subtle p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">Hot leads</p>
                <Toggle
                  checked={rules.hot.enabled}
                  onChange={(checked) =>
                    setRules({ ...rules, hot: { ...rules.hot, enabled: checked } })
                  }
                  label="Hot follow-ups"
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <Field label="First (h)">
                  <input
                    type="number"
                    value={rules.hot.firstH}
                    onChange={(event) =>
                      setRules({
                        ...rules,
                        hot: { ...rules.hot, firstH: Number(event.target.value) || 1 },
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Gap (h)">
                  <input
                    type="number"
                    value={rules.hot.gapH}
                    onChange={(event) =>
                      setRules({
                        ...rules,
                        hot: { ...rules.hot, gapH: Number(event.target.value) || 1 },
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Max">
                  <input
                    type="number"
                    value={rules.hot.max}
                    onChange={(event) =>
                      setRules({
                        ...rules,
                        hot: { ...rules.hot, max: Number(event.target.value) || 1 },
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">Warm leads</p>
                <Toggle
                  checked={rules.warm.enabled}
                  onChange={(checked) =>
                    setRules({ ...rules, warm: { ...rules.warm, enabled: checked } })
                  }
                  label="Warm follow-ups"
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Field label="Gap (h)">
                  <input
                    type="number"
                    value={rules.warm.gapH}
                    onChange={(event) =>
                      setRules({
                        ...rules,
                        warm: { ...rules.warm, gapH: Number(event.target.value) || 1 },
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Max">
                  <input
                    type="number"
                    value={rules.warm.max}
                    onChange={(event) =>
                      setRules({
                        ...rules,
                        warm: { ...rules.warm, max: Number(event.target.value) || 1 },
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <Field label="Silence reason" hint="Recorded when a follow-up is skipped.">
              <select
                value={rules.silenceReason}
                onChange={(event) =>
                  setRules({ ...rules, silenceReason: event.target.value })
                }
                className={inputClass}
              >
                <option>Customer stopped replying</option>
                <option>Chose a competitor</option>
                <option>Bought elsewhere / not interested</option>
                <option>Wrong number</option>
              </select>
            </Field>
          </div>
        </SectionCard>
      </div>
    </ModuleShell>
  );
}
