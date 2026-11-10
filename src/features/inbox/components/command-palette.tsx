"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  Layers,
  Search,
  Settings,
  X,
} from "lucide-react";

import type { NavigationTab } from "@/features/inbox/types";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onSelectChannelFilter: (channel: string) => void;
};

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
    {
      label: "Go to Live Inbox Stream",
      category: "Navigation",
      icon: Inbox,
      run: () => onNavigate("inbox"),
    },
    {
      label: "Open Channels & Webhook Integrations",
      category: "Navigation",
      icon: Layers,
      run: () => onNavigate("channels"),
    },
    {
      label: "Open Workspace Settings & AI Config",
      category: "Navigation",
      icon: Settings,
      run: () => onNavigate("settings"),
    },
    {
      label: "Filter to Slack Messages",
      category: "Channel",
      icon: Layers,
      run: () => {
        onNavigate("inbox");
        onSelectChannelFilter("slack");
      },
    },
    {
      label: "Filter to WhatsApp Messages",
      category: "Channel",
      icon: Layers,
      run: () => {
        onNavigate("inbox");
        onSelectChannelFilter("whatsapp");
      },
    },
    {
      label: "Filter to Email Inquiries",
      category: "Channel",
      icon: Layers,
      run: () => {
        onNavigate("inbox");
        onSelectChannelFilter("email");
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center border-b border-border px-3.5 py-2.5">
          <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to module... (Esc to close)"
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-border/20 text-xs">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">No results found.</p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-surface text-ink-soft transition-colors"
                >
                  <Icon className="size-4 text-primary shrink-0" />
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
