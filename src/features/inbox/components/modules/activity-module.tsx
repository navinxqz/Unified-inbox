"use client";

import { useMemo, useState } from "react";
import { Download, History } from "lucide-react";

import {
  EmptyState,
  ModuleShell,
  Pill,
} from "@/features/inbox/components/module-ui";
import { activitySourceLabels } from "@/features/inbox/data";
import type { ActivityEntry, ActivitySource } from "@/features/inbox/types";
import { cn, downloadCsv, timeAgo } from "@/lib/utils";

const sources: Array<ActivitySource | "all"> = [
  "all",
  "dashboard",
  "ai",
  "auto-revert",
  "answered",
  "bulk",
  "broadcast",
  "channel",
];

type ActivityProps = {
  entries: ActivityEntry[];
};

export function ActivityModule({ entries }: ActivityProps) {
  const [source, setSource] = useState<ActivitySource | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries
      .filter((entry) => source === "all" || entry.source === source)
      .filter(
        (entry) =>
          !normalized ||
          entry.action.toLowerCase().includes(normalized) ||
          entry.subject.toLowerCase().includes(normalized) ||
          entry.actor.toLowerCase().includes(normalized),
      )
      .sort((a, b) => b.atMs - a.atMs);
  }, [entries, source, query]);

  function exportCsv() {
    downloadCsv("activity-audit-trail.csv", [
      ["Time", "Actor", "Action", "Subject", "Source"],
      ...visible.map((entry) => [
        new Date(entry.atMs).toISOString(),
        entry.actor,
        entry.action,
        entry.subject,
        activitySourceLabels[entry.source],
      ]),
    ]);
  }

  return (
    <ModuleShell
      title="Activity"
      subtitle="Audit trail of every mode change, handoff, answer, publish, and broadcast."
      actions={
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      }
      walkthrough={{
        title: "Use the audit trail",
        steps: [
          "Every AI handoff, claim, auto-revert, and dashboard answer is recorded here.",
          "Filter by source — dashboard, AI, auto-revert, answered, bulk, broadcast, channel.",
          "Search by person, action, or subject to trace one conversation's history.",
          "Export CSV for compliance or team reviews.",
        ],
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5">
          <span className="sr-only">Search activity</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actor, action, or subject"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {sources.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSource(item)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                source === item
                  ? "border-primary bg-primary-soft text-primary-strong"
                  : "border-border text-muted-foreground hover:bg-surface",
              )}
            >
              {item === "all" ? "All sources" : activitySourceLabels[item]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity matches"
          text="Try another source or clear the search box."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-border bg-surface/60 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Subject</th>
                <th className="px-4 py-2.5">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {visible.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface/50">
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap text-muted-foreground">
                    {timeAgo(entry.atMs)}
                  </td>
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{entry.actor}</td>
                  <td className="px-4 py-2.5">{entry.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{entry.subject}</td>
                  <td className="px-4 py-2.5">
                    <Pill
                      tone={
                        entry.source === "auto-revert"
                          ? "warning"
                          : entry.source === "ai"
                            ? "info"
                            : entry.source === "broadcast"
                              ? "primary"
                              : "neutral"
                      }
                    >
                      {activitySourceLabels[entry.source]}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {visible.length} of {entries.length} entries · newest first · streamed as
        actions happen.
      </p>
    </ModuleShell>
  );
}
