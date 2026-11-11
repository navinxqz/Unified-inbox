"use client";

import {
  AlarmClock,
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Inbox,
  MessageSquare,
  Send,
  UserPlus,
  Zap,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import {
  DataBar,
  EmptyState,
  ModeBadge,
  ModuleShell,
  Pill,
  SectionCard,
  SlaBadge,
  StatCard,
} from "@/features/inbox/components/module-ui";
import { channelById, activitySourceLabels } from "@/features/inbox/data";
import type {
  ActivityEntry,
  ChannelConnection,
  NotificationItem,
  Person,
} from "@/features/inbox/types";
import { useNowMs } from "@/features/inbox/use-now";
import { cn, timeAgo } from "@/lib/utils";

type OverviewProps = {
  people: Person[];
  channels: ChannelConnection[];
  notifications: NotificationItem[];
  activity: ActivityEntry[];
  setupDone: number;
  setupTotal: number;
  practiceMode: boolean;
  slaTargetMin: number;
  onNavigate: (module: "setup" | "inbox" | "notifications" | "activity" | "broadcasts" | "products" | "team" | "channels" | "comments") => void;
  onSelectPerson: (personId: string) => void;
};

export function OverviewModule({
  people,
  channels,
  notifications,
  activity,
  setupDone,
  setupTotal,
  practiceMode,
  slaTargetMin,
  onNavigate,
  onSelectPerson,
}: OverviewProps) {
  const now = useNowMs();
  const open = people.filter((person) => person.status === "open");
  const waiting = open.filter((person) => person.waitingSinceMs);
  const aiHandled = open.filter((person) => (person.mode ?? "ai") === "ai");
  const breached = waiting.filter(
    (person) =>
      now !== null &&
      (person.waitingSinceMs ?? 0) > 0 &&
      now - (person.waitingSinceMs ?? 0) > slaTargetMin * 60_000,
  );
  const longestWaiting = [...waiting]
    .sort((a, b) => (a.waitingSinceMs ?? 0) - (b.waitingSinceMs ?? 0))
    .slice(0, 5);
  const attention = notifications.filter((item) => !item.done).slice(0, 4);
  const healthyChannels = channels.filter((channel) => channel.status === "connected").length;

  const setupPercent = Math.round((setupDone / Math.max(1, setupTotal)) * 100);

  return (
    <ModuleShell
      title="Overview"
      subtitle="Your desk at a glance — waiting conversations, AI handoffs, and channel health."
      walkthrough={{
        title: "Read the Overview in 60 seconds",
        steps: [
          "The four stat cards show open conversations, who is waiting, the AI share, and SLA breaches.",
          "Longest waiting is sorted oldest-first so nothing slips past the reply target.",
          "Needs attention never auto-closes — items stay until somebody marks them done.",
          "Channel health shows every connected channel and whether its sync is healthy.",
        ],
      }}
    >
      {practiceMode ? (
        <div className="rounded-xl border border-primary-border bg-primary-soft/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary-strong">
                Practice mode — {setupDone} of {setupTotal} setup steps done
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Test chats stay internal. Your trial starts when you go live.
              </p>
              <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${setupPercent}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("setup")}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Continue setup
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Open conversations"
          value={String(open.length)}
          sub={`${people.length} total`}
          icon={Inbox}
        />
        <StatCard
          label="Waiting on a reply"
          value={String(waiting.length)}
          sub={`target ${slaTargetMin}m`}
          icon={AlarmClock}
          tone="warning"
        />
        <StatCard
          label="AI is handling"
          value={`${Math.round((aiHandled.length / Math.max(1, open.length)) * 100)}%`}
          sub={`${aiHandled.length} of ${open.length} open`}
          icon={Bot}
          tone="success"
        />
        <StatCard
          label="Past SLA target"
          value={String(breached.length)}
          sub={breached.length > 0 ? "needs a human now" : "all within target"}
          icon={CheckCircle2}
          tone={breached.length > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Longest waiting"
          description="Oldest first — the default inbox order."
          action={
            <button
              type="button"
              onClick={() => onNavigate("inbox")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open inbox
            </button>
          }
        >
          {longestWaiting.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing waiting"
              text="Every open conversation has been answered."
            />
          ) : (
            <div className="-mx-1 divide-y divide-border-subtle">
              {longestWaiting.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => onSelectPerson(person.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left transition-colors hover:bg-surface"
                >
                  <Avatar
                    initials={person.initials}
                    background={person.avatar.background}
                    color={person.avatar.color}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold">{person.name}</span>
                      <ModeBadge mode={person.mode ?? "ai"} compact />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {channelById[person.channel]?.label} · {person.preview}
                    </p>
                  </div>
                  <SlaBadge waitingSinceMs={person.waitingSinceMs} targetMin={slaTargetMin} />
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Needs attention"
          description="Never auto-closes — items stay until marked done."
          action={
            <button
              type="button"
              onClick={() => onNavigate("notifications")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View queue
            </button>
          }
        >
          {attention.length === 0 ? (
            <EmptyState icon={Bell} title="All clear" text="Every notification has been handled." />
          ) : (
            <div className="-mx-1 divide-y divide-border-subtle">
              {attention.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 px-1 py-2">
                  <Pill
                    tone={
                      item.kind === "past-target" || item.kind === "never-answered"
                        ? "danger"
                        : item.kind === "order"
                          ? "warning"
                          : "info"
                    }
                  >
                    {item.kind.replace("-", " ")}
                  </Pill>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.body}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(item.atMs)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          title="Channel health"
          description={`${healthyChannels} of ${channels.length} channels connected.`}
          className="lg:col-span-3"
          action={
            <button
              type="button"
              onClick={() => onNavigate("channels")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage
            </button>
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-2 rounded-lg border border-border-subtle px-2.5 py-2"
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  <ChannelIcon channel={channel.id} className="size-3.5 text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{channel.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {channel.provider}
                  </p>
                </div>
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    channel.enabled && channel.status === "connected"
                      ? channel.health === "degraded"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                      : "bg-border",
                  )}
                  title={
                    channel.enabled
                      ? channel.health === "degraded"
                        ? "Degraded"
                        : "Healthy"
                      : "Paused"
                  }
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Every mode change, answer, and publish."
          className="lg:col-span-2"
          action={
            <button
              type="button"
              onClick={() => onNavigate("activity")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Audit trail
            </button>
          }
        >
          <div className="space-y-2.5">
            {activity.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug">
                    <b className="font-semibold">{entry.actor}</b> {entry.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activitySourceLabels[entry.source]} · {timeAgo(entry.atMs)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Quick actions"
        description="The shortcuts we use most at this desk."
      >
        <div className="flex flex-wrap gap-2">
          {[
            { label: "New broadcast", icon: Send, module: "broadcasts" as const },
            { label: "Add product", icon: Zap, module: "products" as const },
            { label: "Invite teammate", icon: UserPlus, module: "team" as const },
            { label: "Review comments", icon: MessageSquare, module: "comments" as const },
            { label: "Connect a channel", icon: Inbox, module: "channels" as const },
          ].map(({ label, icon: Icon, module }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(module)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary-strong"
            >
              <Icon className="size-4" strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Today’s mix"
        description="Where your conversations came from today."
      >
        <DataBar
          segments={channels.slice(0, 6).map((channel) => ({
            label: channel.label,
            value: channel.count,
            color: channel.color,
          }))}
        />
      </SectionCard>
    </ModuleShell>
  );
}
