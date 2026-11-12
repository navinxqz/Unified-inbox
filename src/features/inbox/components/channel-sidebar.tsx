"use client";

import { useState } from "react";
import { ArrowUpDown, GripVertical, Layers, Plus, X } from "lucide-react";

import { ChannelDot } from "@/features/inbox/components/channel-dot";
import { totalChannelCount } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
import type { Channel, ChannelFilter, ChannelId } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ChannelSidebarProps = {
  channels: Channel[];
  activeChannel: ChannelFilter;
  onSelect: (channel: ChannelFilter) => void;
  onReorderChannels?: (reordered: Channel[]) => void;
  /** Opens the channels module to add another account. */
  onConnect?: () => void;
  showClose?: boolean;
  onClose?: () => void;
};

export function ChannelSidebar({
  channels,
  activeChannel,
  onSelect,
  onReorderChannels,
  onConnect,
  showClose = false,
  onClose,
}: ChannelSidebarProps) {
  const { t } = useI18n();
  const [draggedChannelId, setDraggedChannelId] = useState<ChannelId | null>(null);
  const [dragOverChannelId, setDragOverChannelId] = useState<ChannelId | null>(null);

  function handleDragStart(channelId: ChannelId) {
    setDraggedChannelId(channelId);
  }

  function handleDragOver(e: React.DragEvent, targetId: ChannelId) {
    e.preventDefault();
    if (draggedChannelId && draggedChannelId !== targetId) {
      setDragOverChannelId(targetId);
    }
  }

  function handleDrop(targetId: ChannelId) {
    if (!draggedChannelId || draggedChannelId === targetId || !onReorderChannels) {
      setDraggedChannelId(null);
      setDragOverChannelId(null);
      return;
    }

    const currentIndex = channels.findIndex((c) => c.id === draggedChannelId);
    const targetIndex = channels.findIndex((c) => c.id === targetId);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const next = [...channels];
      const [removed] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, removed);
      onReorderChannels(next);
    }

    setDraggedChannelId(null);
    setDragOverChannelId(null);
  }

  return (
    <aside
      aria-label={t("Channels")}
      className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto bg-surface-alt p-3 pt-4 select-none"
    >
      <div className="flex items-center gap-2 px-3 pb-2">
        <h2 className="flex-1 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("Channels")}
        </h2>
        <ArrowUpDown
          aria-hidden="true"
          className="size-4 text-muted-foreground"
          strokeWidth={2}
        />
        {showClose ? (
          <button
            type="button"
            aria-label={t("Close channels")}
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
          "group flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
          activeChannel === "all"
            ? "bg-primary-soft font-semibold text-primary-strong"
            : "hover:bg-border/50",
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-xs">
          <Layers className="size-3 text-white" strokeWidth={2.5} />
        </span>
        <span className="flex-1 text-left">{t("All channels")}</span>
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

      <div className="my-1 border-t border-border/60" />

      <div className="flex flex-col gap-1">
        {channels.map((channel) => {
          const active = activeChannel === channel.id;
          const isDragging = draggedChannelId === channel.id;
          const isDragOver = dragOverChannelId === channel.id;

          return (
            <div
              key={channel.id}
              draggable
              onDragStart={() => handleDragStart(channel.id)}
              onDragOver={(e) => handleDragOver(e, channel.id)}
              onDragLeave={() => setDragOverChannelId(null)}
              onDrop={() => handleDrop(channel.id)}
              className={cn(
                "group relative flex items-center rounded-lg transition-all",
                isDragging && "opacity-40 scale-[0.98]",
                isDragOver && "ring-2 ring-primary bg-primary-soft/60",
              )}
            >
              <div
                title={t("Drag to change priority order")}
                className="flex h-11 cursor-grab items-center px-1 text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
              >
                <GripVertical className="size-3.5" />
              </div>

              <button
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(channel.id)}
                className={cn(
                  "flex h-11 flex-1 items-center gap-2.5 rounded-r-lg pr-3 pl-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
                  active ? "bg-primary-soft font-semibold text-primary-strong" : "hover:bg-border/50",
                )}
              >
                <ChannelDot channel={channel.id} color={channel.color} />
                <span className="flex-1 text-left truncate">{channel.label}</span>
                <span
                  className={cn(
                    "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold",
                    active ? "bg-primary text-white" : "bg-border text-ink-soft",
                  )}
                >
                  {channel.count}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <p className="mx-3 my-3 text-[12px] leading-relaxed text-ink-soft">
        {t("Pick a channel to filter, or drag to reorder.")}
      </p>

      <button
        type="button"
        onClick={onConnect}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#AEB3C2] text-sm font-semibold text-primary-strong transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus className="size-[18px]" strokeWidth={2} />
        {t("Connect channel")}
      </button>

      <div className="mt-auto flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
        <ChannelDot color="#1F9D55" />
        {channels.length} {t("channels connected")}
      </div>
    </aside>
  );
}
