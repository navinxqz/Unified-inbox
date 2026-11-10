"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
} from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import type { ConversationPriority, ConversationStatus, Person } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status?: ConversationStatus }) {
  switch (status) {
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3" />
          Resolved
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <Clock className="size-3" />
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Open
        </span>
      );
  }
}

function PriorityTag({ priority }: { priority?: ConversationPriority }) {
  if (!priority) return null;
  const colors: Record<ConversationPriority, string> = {
    urgent: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50",
    high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50",
    medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50",
    low: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  };

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border",
        colors[priority],
      )}
    >
      {priority}
    </span>
  );
}

type RowConversationListProps = {
  people: Person[];
  selectedPersonId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (personId: string) => void;
  statusFilter: "all" | ConversationStatus;
  onStatusFilterChange: (status: "all" | ConversationStatus) => void;
  onNewTicket: () => void;
};

export function RowConversationList({
  people,
  selectedPersonId,
  query,
  onQueryChange,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  onNewTicket,
}: RowConversationListProps) {
  const [newestFirst, setNewestFirst] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = people
    .filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });

  const sorted = newestFirst ? filtered : [...filtered].reverse();

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-background border-r border-border">
      {/* Top action bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Inbox Stream
          </span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink-soft">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewTicket}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-2 border-b border-border p-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Filter conversations... (/ to focus)"
            className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <kbd className="absolute right-2 pointer-events-none rounded border border-border px-1 py-0.2 text-[10px] text-muted-foreground">
            /
          </kbd>
        </div>

        {/* Status Filters */}
        <div className="flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            {(["all", "open", "pending", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusFilterChange(st)}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium transition-colors capitalize",
                  statusFilter === st
                    ? "bg-primary-soft font-semibold text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground",
                )}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            title="Toggle sort direction"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <ArrowUpDown className="size-3" />
            <span>{newestFirst ? "Newest" : "Oldest"}</span>
          </button>
        </div>
      </div>

      {/* Dense Row Stream (Front / Linear style: pure rows, no card box shadows) */}
      <div className="scrollbar-thin flex-1 overflow-y-auto divide-y divide-border-subtle">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
            <Filter className="size-6 text-muted-foreground/40 mb-2" />
            <p className="font-medium">No matching conversations</p>
            <p className="mt-1">Try resetting your status filter or search query.</p>
          </div>
        ) : (
          sorted.map((person) => {
            const isSelected = selectedPersonId === person.id;

            return (
              <div
                key={person.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(person.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(person.id);
                }}
                className={cn(
                  "group relative flex cursor-pointer flex-col gap-1 px-3 py-2.5 transition-colors border-l-2 outline-none",
                  isSelected
                    ? "border-l-primary bg-primary-soft/50 font-medium"
                    : "border-l-transparent hover:bg-surface/60",
                )}
              >
                {/* Row Header: Channel icon, Author name, Plan tier, Timestamp */}
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded text-white"
                    style={{
                      backgroundColor:
                        person.channel === "slack"
                          ? "#6D5BD0"
                          : person.channel === "whatsapp"
                            ? "#1F9D55"
                            : person.channel === "email"
                              ? "#2563EB"
                              : person.channel === "messenger"
                                ? "#B8399A"
                                : "#0E7FB8",
                    }}
                  >
                    <ChannelIcon channel={person.channel} className="size-2.5 text-white" />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                    {person.name}
                  </span>

                  {person.planTier ? (
                    <span className="rounded bg-surface px-1.5 py-0.2 text-[10px] text-muted-foreground">
                      {person.planTier}
                    </span>
                  ) : null}

                  <span className="text-[11px] text-muted-foreground shrink-0 font-normal">
                    {person.time}
                  </span>
                </div>

                {/* Message preview snippet */}
                <p className="line-clamp-1 text-xs text-muted-foreground leading-normal font-normal">
                  {person.preview}
                </p>

                {/* Row Footer: Status & Priority metadata */}
                <div className="mt-0.5 flex items-center justify-between text-[11px]">
                  <StatusBadge status={person.status} />

                  <div className="flex items-center gap-1.5">
                    {person.unreadCount ? (
                      <span className="size-2 rounded-full bg-primary" />
                    ) : null}
                    <PriorityTag priority={person.ticketPriority} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
