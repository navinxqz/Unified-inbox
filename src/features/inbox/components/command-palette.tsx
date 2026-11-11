"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  CreditCard,
  Inbox,
  Layers,
  Search,
  Settings,
  ShoppingBag,
  Target,
  X,
} from "lucide-react";

import type { ModuleId } from "@/features/inbox/types";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ModuleId) => void;
  onSelectChannelFilter: (channel: string) => void;
};

const moduleJumps: Array<{
  label: string;
  module: ModuleId;
  icon: typeof Inbox;
}> = [
  { label: "Go to Inbox", module: "inbox", icon: Inbox },
  { label: "Go to Overview", module: "overview", icon: Layers },
  { label: "Open Leads pipeline", module: "leads", icon: Target },
  { label: "Open Orders", module: "orders", icon: ShoppingBag },
  { label: "Open Agent Desk", module: "agent-desk", icon: Bot },
  { label: "Open Notifications", module: "notifications", icon: Bell },
  { label: "Open Billing", module: "billing", icon: CreditCard },
  { label: "Open Channels & webhooks", module: "channels", icon: Layers },
  { label: "Open Workspace settings", module: "settings", icon: Settings },
];

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectChannelFilter,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    ...moduleJumps.map((item) => ({
      label: item.label,
      category: "Navigation",
      icon: item.icon,
      run: () => onNavigate(item.module),
    })),
    ...[
      { label: "Slack", id: "slack" },
      { label: "WhatsApp", id: "whatsapp" },
      { label: "Email", id: "email" },
      { label: "Instagram", id: "instagram" },
      { label: "Website chat", id: "website" },
    ].map((channel) => ({
      label: `Filter inbox to ${channel.label}`,
      category: "Channel",
      icon: Layers,
      run: () => {
        onNavigate("inbox");
        onSelectChannelFilter(channel.id);
      },
    })),
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 backdrop-blur-xs">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl duration-100">
        <div className="flex items-center border-b border-border px-3.5 py-2.5">
          <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a module or channel… (Esc to close)"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick actions"
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="scrollbar-thin max-h-72 divide-y divide-border/20 overflow-y-auto p-1.5 text-xs">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">No results found.</p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-ink-soft transition-colors hover:bg-surface"
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span className="flex-1 font-medium text-foreground">{item.label}</span>
                  <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
