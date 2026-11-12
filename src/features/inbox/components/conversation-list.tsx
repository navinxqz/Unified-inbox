"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  Menu,
  PanelRight,
  Search,
  SquarePen,
  Star,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { SlaBadge } from "@/features/inbox/components/module-ui";
import { SourceBadge } from "@/features/inbox/components/source-badge";
import { useI18n } from "@/features/inbox/i18n";
import type { ConversationMode, Person, RailView } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const views: Array<{ id: RailView; label: string }> = [
  { id: "all", label: "All" },
  { id: "priority", label: "Priority" },
  { id: "tagify", label: "Tagify" },
  { id: "ignored", label: "Ignored" },
  { id: "bots", label: "Bots" },
];

const modeMeta: Record<
  ConversationMode,
  { label: string; className: string }
> = {
  ai: { label: "AI", className: "text-muted-foreground" },
  human: { label: "Human", className: "text-emerald-700" },
  reverting: { label: "Reverting", className: "text-amber-700" },
};

function ModeTag({ mode }: { mode: ConversationMode }) {
  const { t } = useI18n();
  const meta = modeMeta[mode];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap",
        meta.className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t(meta.label)}
    </span>
  );
}

type ConversationListProps = {
  people: Person[];
  selectedPersonId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onOpenChannels: () => void;
  onOpenNav?: () => void;
  view: RailView;
  onViewChange: (view: RailView) => void;
  slaTargetMin: number;
  summary: string;
};

export function ConversationList({
  people,
  selectedPersonId,
  query,
  onQueryChange,
  onSelect,
  onOpenChannels,
  onOpenNav,
  view,
  onViewChange,
  slaTargetMin,
  summary,
}: ConversationListProps) {
  const { t } = useI18n();
  const [newestFirst, setNewestFirst] = useState(true);
  const [waitingFirst, setWaitingFirst] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const ordered = newestFirst ? people : [...people].reverse();
  // Waiting threads surface first without disturbing the newest/oldest order
  // inside each bucket.
  const rows = waitingFirst
    ? [...ordered].sort(
        (a, b) => Number(Boolean(b.waitingSinceMs)) - Number(Boolean(a.waitingSinceMs)),
      )
    : ordered;

  const waitingCount = people.filter((person) => person.waitingSinceMs).length;

  return (
    <section
      aria-label="Conversations"
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-border bg-background"
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        {onOpenNav ? (
          <button
            type="button"
            aria-label="Open navigation"
            title="Menu"
            onClick={onOpenNav}
            className="-ml-1 flex size-9 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          >
            <Menu className="size-[18px]" strokeWidth={2} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg leading-tight font-bold">{t("Messages")}</h2>
          <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
            {summary}
          </p>
        </div>
        <button
          type="button"
          aria-label={t("New message")}
          title={t("New message")}
          onClick={() => searchRef.current?.focus()}
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <SquarePen className="size-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label={t("Open channels")}
          title={t("Open channels")}
          onClick={onOpenChannels}
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:hidden"
        >
          <PanelRight className="size-[18px]" strokeWidth={2} />
        </button>
      </div>

      <div className="px-4">
        <label className="flex h-10 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-muted-foreground">
          <Search className="size-[17px] shrink-0" strokeWidth={2} />
          <span className="sr-only">{t("Search people and messages")}</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("Search people and messages")}
            type="search"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span
            aria-hidden="true"
            className="rounded-md border border-border bg-background px-[7px] py-px text-xs"
          >
            /
          </span>
        </label>
      </div>

      <div className="scrollbar-thin mt-2 flex gap-1 overflow-x-auto px-4 pb-1">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={view === item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              view === item.id
                ? "bg-primary-soft text-primary-strong"
                : "text-muted-foreground hover:bg-surface",
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5 border-y border-border-subtle bg-surface/40 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setWaitingFirst((value) => !value)}
          aria-pressed={waitingFirst}
          title={t("Show customers waiting longest first")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            waitingFirst
              ? "bg-primary-soft text-primary-strong"
              : "text-muted-foreground hover:bg-surface",
          )}
        >
          <ArrowUpDown className="size-3.5" strokeWidth={2.5} />
          {t("Waiting")}
          <span className="tabular-nums">· {waitingCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setNewestFirst((value) => !value)}
          aria-label={newestFirst ? t("Sort oldest first") : t("Sort newest first")}
          title={newestFirst ? t("Sort oldest first") : t("Sort newest first")}
          className="ml-auto rounded-full px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {newestFirst ? t("Newest") : t("Oldest")}
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t("No conversations match this view.")}
          </p>
        ) : (
          rows.map((person) => {
            const active = person.id === selectedPersonId;
            const mode = person.mode ?? "ai";
            const unread = person.unreadCount ?? 0;

            return (
              <button
                key={person.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(person.id)}
                className={cn(
                  "relative flex w-full items-start gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
                  active
                    ? "bg-primary-soft/70"
                    : "hover:bg-surface focus-visible:bg-surface",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-primary"
                  />
                ) : null}

                <div className="relative mt-0.5 flex-none">
                  <Avatar
                    initials={person.initials}
                    background={person.avatar.background}
                    color={person.avatar.color}
                  />
                  <SourceBadge channel={person.channel} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "min-w-0 truncate text-[13px] leading-5",
                        unread > 0
                          ? "font-bold text-foreground"
                          : "font-semibold text-ink-soft",
                      )}
                    >
                      {person.name}
                    </span>
                    {person.priority ? (
                      <Star
                        aria-label={t("Priority")}
                        className="size-3 shrink-0 text-star"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ) : null}
                    <span className="ml-auto shrink-0 pl-2 text-[11px] font-medium text-muted-foreground tabular-nums">
                      {person.time}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] leading-4 text-muted-foreground">
                      {person.preview}
                    </span>
                    {unread > 0 ? (
                      <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white tabular-nums">
                        {unread}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <ModeTag mode={mode} />
                    <SlaBadge
                      waitingSinceMs={person.waitingSinceMs}
                      targetMin={slaTargetMin}
                      compact
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
