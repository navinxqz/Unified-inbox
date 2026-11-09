"use client";

import {
  Bot,
  EyeOff,
  Inbox,
  MessageSquare,
  Star,
  Tags,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import type { RailView } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const navItems: {
  id: RailView;
  label: string;
  icon: typeof MessageSquare;
}[] = [
  { id: "all", label: "All messages", icon: MessageSquare },
  { id: "priority", label: "Priority", icon: Star },
  { id: "tagify", label: "Tagify", icon: Tags },
  { id: "ignored", label: "Ignored", icon: EyeOff },
  { id: "bots", label: "Bots", icon: Bot },
];

type AppRailProps = {
  activeView: RailView;
  onSelect: (view: RailView) => void;
};

export function AppRail({ activeView, onSelect }: AppRailProps) {
  return (
    <nav
      aria-label="Inbox views"
      className="flex min-h-0 flex-col items-center gap-1.5 border-r border-border bg-surface py-4"
    >
      <div
        aria-hidden="true"
        className="mb-2.5 flex size-9 items-center justify-center rounded-[10px] bg-primary text-white"
      >
        <Inbox className="size-[18px]" strokeWidth={2} />
      </div>

      {navItems.map(({ id, label, icon: Icon }) => {
        const active = id === activeView;

        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              active
                ? "bg-primary text-white"
                : "text-ink-soft hover:bg-border/70",
            )}
          >
            <Icon className="size-[22px]" strokeWidth={2} />
          </button>
        );
      })}

      <div className="mt-auto" title="You">
        <Avatar
          initials="YN"
          background="#E8E9FB"
          color="#3730A3"
          size="md"
        />
      </div>
    </nav>
  );
}
