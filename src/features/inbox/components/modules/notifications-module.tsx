"use client";

import { useMemo, useState } from "react";
import { Bell, Check, Clock, Inbox, ShieldAlert, UserCheck } from "lucide-react";

import {
  EmptyState,
  ModuleShell,
  ModuleTabs,
  Pill,
  StatCard,
} from "@/features/inbox/components/module-ui";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { channelById } from "@/features/inbox/data";
import type { NotificationItem } from "@/features/inbox/types";
import { cn, timeAgo } from "@/lib/utils";

type Filter = "all" | "mine" | "done";

type NotificationsProps = {
  notifications: NotificationItem[];
  onMarkDone: (id: string) => void;
  onReopen: (id: string) => void;
  onSelectPerson: (personId: string) => void;
};

export function NotificationsModule({
  notifications,
  onMarkDone,
  onReopen,
  onSelectPerson,
}: NotificationsProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const waiting = notifications.filter(
    (item) => !item.done && item.kind === "waiting",
  ).length;
  const pastTarget = notifications.filter(
    (item) => !item.done && item.kind === "past-target",
  ).length;
  const neverAnswered = notifications.filter(
    (item) => !item.done && item.kind === "never-answered",
  ).length;

  const visible = useMemo(() => {
    switch (filter) {
      case "mine":
        return notifications.filter(
          (item) => !item.done && item.assignedTo === "You",
        );
      case "done":
        return notifications.filter((item) => item.done);
      default:
        return notifications.filter((item) => !item.done);
    }
  }, [notifications, filter]);

  return (
    <ModuleShell
      title="Notifications"
      subtitle="Needs-attention queue that never auto-closes — an item stays until somebody marks it done."
      walkthrough={{
        title: "Work the notifications queue",
        steps: [
          "Waiting means a customer is still owed a reply.",
          "Past target means the SLA window has already been crossed.",
          "Never answered means the conversation reverted to AI before a human replied.",
          "Mark done only when the item is genuinely resolved — nothing clears itself.",
        ],
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Waiting" value={String(waiting)} icon={Clock} tone="warning" />
        <StatCard label="Past target" value={String(pastTarget)} icon={Inbox} tone="danger" />
        <StatCard
          label="Never answered"
          value={String(neverAnswered)}
          icon={ShieldAlert}
          tone="danger"
        />
      </div>

      <ModuleTabs
        tabs={[
          { id: "all", label: "Needs attention", count: notifications.filter((item) => !item.done).length },
          { id: "mine", label: "Given to me" },
          { id: "done", label: "Done", count: notifications.filter((item) => item.done).length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing here"
          text={
            filter === "done"
              ? "No notifications have been completed yet."
              : "Everything in this queue has been handled."
          }
        />
      ) : (
        <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border">
          {visible.map((item) => (
            <div key={item.id} className={cn("flex items-start gap-3 px-4 py-3", item.done && "bg-surface/40")}>
              <Pill
                tone={
                  item.kind === "past-target" || item.kind === "never-answered"
                    ? "danger"
                    : item.kind === "order"
                      ? "warning"
                      : item.kind === "system"
                        ? "neutral"
                        : "info"
                }
              >
                {item.kind.replace("-", " ")}
              </Pill>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.body}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{timeAgo(item.atMs)}</span>
                  {item.channel ? (
                    <span className="inline-flex items-center gap-1">
                      <ChannelIcon channel={item.channel} className="size-3" />
                      {channelById[item.channel]?.label}
                    </span>
                  ) : null}
                  {item.assignedTo ? (
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="size-3" />
                      {item.assignedTo}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {item.personId ? (
                  <button
                    type="button"
                    onClick={() => onSelectPerson(item.personId!)}
                    className="h-8 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                  >
                    Open chat
                  </button>
                ) : null}
                {item.done ? (
                  <button
                    type="button"
                    onClick={() => onReopen(item.id)}
                    className="h-8 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                  >
                    Reopen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkDone(item.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    <Check className="size-3.5" />
                    Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleShell>
  );
}
