"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  PanelRight,
  Search,
  SquarePen,
  Star,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { SourceBadge } from "@/features/inbox/components/source-badge";
import type { Person } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  people: Person[];
  selectedPersonId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onOpenChannels: () => void;
  summary: string;
};

export function ConversationList({
  people,
  selectedPersonId,
  query,
  onQueryChange,
  onSelect,
  onOpenChannels,
  summary,
}: ConversationListProps) {
  const [newestFirst, setNewestFirst] = useState(true);
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

  const rows = newestFirst ? people : [...people].reverse();

  return (
    <section
      aria-label="Conversations"
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-border bg-background"
    >
      <div className="flex items-center gap-2 px-5 pt-[18px] pb-3">
        <h2 className="flex-1 text-lg font-bold">Messages</h2>
        <button
          type="button"
          aria-label="New message"
          title="New message"
          onClick={() => searchRef.current?.focus()}
          className="flex size-9 items-center justify-center rounded-[10px] border border-border text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <SquarePen className="size-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Open channels"
          title="Channels"
          onClick={onOpenChannels}
          className="flex size-9 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:hidden"
        >
          <PanelRight className="size-[18px]" strokeWidth={2} />
        </button>
      </div>

      <div className="px-5">
        <label className="flex h-11 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-muted-foreground">
          <Search className="size-[18px] shrink-0" strokeWidth={2} />
          <span className="sr-only">Search people and messages</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search people"
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

      <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 text-[13px] font-semibold text-ink-soft">
        <button
          type="button"
          onClick={() => setNewestFirst((value) => !value)}
          aria-label={`Sort ${newestFirst ? "newest first" : "oldest first"}`}
          className="flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowUpDown className="size-4" strokeWidth={2} />
          {newestFirst ? "Newest" : "Oldest"}
        </button>
        <span className="ml-auto font-medium text-muted-foreground">
          {summary}
        </span>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto border-t border-border-subtle">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No conversations match this view.
          </p>
        ) : (
          rows.map((person) => {
            const active = person.id === selectedPersonId;

            return (
              <button
                key={person.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(person.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border-subtle px-5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
                  active ? "bg-primary-soft" : "hover:bg-surface",
                )}
              >
                <div className="relative flex-none">
                  <Avatar
                    initials={person.initials}
                    background={person.avatar.background}
                    color={person.avatar.color}
                  />
                  <SourceBadge channel={person.channel} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {person.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {person.time}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                      {person.preview}
                    </span>
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0",
                        person.priority ? "text-star" : "text-star-muted",
                      )}
                      fill="currentColor"
                      strokeWidth={0}
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
