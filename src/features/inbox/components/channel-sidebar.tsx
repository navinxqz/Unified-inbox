"use client";

import { useState } from "react";
import { ArrowUpDown, Plus, X } from "lucide-react";

import { ChannelDot } from "@/features/inbox/components/channel-dot";
import { channels, totalChannelCount } from "@/features/inbox/data";
import type { ChannelFilter } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ChannelSidebarProps = {
  activeChannel: ChannelFilter;
  onSelect: (channel: ChannelFilter) => void;
  showClose?: boolean;
  onClose?: () => void;
};

export function ChannelSidebar({
  activeChannel,
  onSelect,
  showClose = false,
  onClose,
}: ChannelSidebarProps) {
  const [showConnectHint, setShowConnectHint] = useState(false);

  return (
    <aside
      aria-label="Channels"
      className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto bg-surface-alt p-3 pt-4"
    >
      <div className="flex items-center gap-2 px-3 pb-2">
        <h2 className="flex-1 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Channels
        </h2>
        <ArrowUpDown
          aria-hidden="true"
          className="size-4 text-muted-foreground"
          strokeWidth={2}
        />
        {showClose ? (
          <button
            type="button"
            aria-label="Close channels"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-ink-soft hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        aria-current={activeChannel === "all" ? "true" : undefined}
        onClick={() => onSelect("all")}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
          activeChannel === "all"
            ? "bg-primary-soft font-semibold"
            : "hover:bg-border/50",
        )}
      >
        <ChannelDot color="#4F46E5" />
        <span className="flex-1 text-left">All channels</span>
        <span
          className={cn(
            "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold",
            activeChannel === "all"
              ? "bg-primary text-white"
              : "bg-border text-ink-soft",
          )}
        >
          {totalChannelCount}
        </span>
      </button>

      {channels.map((channel) => {
        const active = activeChannel === channel.id;

        return (
          <button
            key={channel.id}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(channel.id)}
            className={cn(
              "flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
              active ? "bg-primary-soft font-semibold" : "hover:bg-border/50",
            )}
          >
            <ChannelDot color={channel.color} />
            <span className="flex-1 text-left">{channel.label}</span>
            <span
              className={cn(
                "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold",
                active ? "bg-primary text-white" : "bg-border text-ink-soft",
              )}
            >
              {channel.count}
            </span>
          </button>
        );
      })}

      <p className="mx-3 my-3 text-[13px] leading-relaxed text-ink-soft">
        Pick a channel to show only its messages. Mute one to ignore it without
        disconnecting.
      </p>

      <button
        type="button"
        onClick={() => setShowConnectHint((value) => !value)}
        aria-expanded={showConnectHint}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#AEB3C2] text-sm font-semibold text-primary-strong transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus className="size-[18px]" strokeWidth={2} />
        Connect channel
      </button>

      {showConnectHint ? (
        <p
          role="status"
          className="mx-3 mt-2 rounded-lg bg-background px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          Channel connections are coming soon. For now, this demo uses sample
          data.
        </p>
      ) : null}

      <div className="mt-auto flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
        <ChannelDot color="#1F9D55" />
        5 channels connected
      </div>
    </aside>
  );
}
