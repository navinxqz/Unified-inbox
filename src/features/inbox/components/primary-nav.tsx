"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CreditCard,
  Globe,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  ListChecks,
  MessageCircle,
  Package,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import type { ModuleId } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type NavItem = {
  id: ModuleId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "Work",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "inbox", label: "Inbox", icon: Inbox },
      { id: "saved-replies", label: "Saved replies", icon: Zap },
      { id: "comments", label: "Comments", icon: MessageCircle },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "activity", label: "Activity", icon: History },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Grow",
    items: [
      { id: "leads", label: "Leads", icon: Target },
      { id: "orders", label: "Orders", icon: ShoppingBag },
      { id: "followups", label: "Follow-ups", icon: RefreshCw },
      { id: "broadcasts", label: "Broadcasts", icon: Send },
      { id: "products", label: "Products", icon: Package },
      { id: "posts", label: "Posts", icon: ImageIcon },
    ],
  },
  {
    label: "AI",
    items: [
      { id: "agent-desk", label: "Agent Desk", icon: Bot },
      { id: "knowledge", label: "Knowledge", icon: BookOpen },
    ],
  },
  {
    label: "Set up",
    items: [
      { id: "setup", label: "Setup guide", icon: ListChecks },
      { id: "channels", label: "Channels", icon: Layers },
      { id: "website", label: "Website chat", icon: Globe },
      { id: "business", label: "Business", icon: Briefcase },
      { id: "team", label: "Team", icon: Users },
      { id: "groups", label: "Groups", icon: ShieldCheck },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "settings", label: "Workspace settings", icon: Settings },
    ],
  },
];

type PrimaryNavProps = {
  activeModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
  openConversations: number;
  notificationsWaiting: number;
  setupDone: number;
  setupTotal: number;
  practiceMode: boolean;
  onOpenPalette: () => void;
};

export function PrimaryNav({
  activeModule,
  onNavigate,
  openConversations,
  notificationsWaiting,
  setupDone,
  setupTotal,
  practiceMode,
  onOpenPalette,
}: PrimaryNavProps) {
  const [syncedSeconds, setSyncedSeconds] = useState(2);

  // Realtime heartbeat — stands in for the SSE connection pill.
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncedSeconds((value) => (value >= 14 ? 0 : value + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function badgeFor(id: ModuleId): number | null {
    if (id === "inbox") return openConversations;
    if (id === "notifications") return notificationsWaiting;
    if (id === "setup") return null;
    return null;
  }

  return (
    <aside
      aria-label="Primary navigation"
      className="flex h-full w-[236px] shrink-0 flex-col border-r border-border bg-surface"
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white"
        >
          <Inbox className="size-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Unified Inbox</p>
          <p className="truncate text-[11px] text-muted-foreground">
            ws_1794374612651_f3d05g
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
        {practiceMode ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
            Practice mode
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
        <span
          title="Realtime connection is active (SSE)"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-sky-500" />
          </span>
          Live · synced {syncedSeconds}s
        </span>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3">
        {groups.map((group) => (
          <div key={group.label} className="pb-2">
            <p className="px-2 pt-2 pb-1 text-[10px] font-bold tracking-[0.09em] text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = id === activeModule;
                const badge = badgeFor(id);

                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => onNavigate(id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                      active
                        ? "bg-primary font-semibold text-white"
                        : "font-medium text-ink-soft hover:bg-border/70",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                    <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                    {id === "setup" ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-border text-ink-soft",
                        )}
                      >
                        {setupDone}/{setupTotal}
                      </span>
                    ) : badge ? (
                      <span
                        className={cn(
                          "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-border text-ink-soft",
                        )}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-2 py-2.5">
        <button
          type="button"
          onClick={onOpenPalette}
          className="mb-1.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground"
        >
          Quick actions
          <kbd className="rounded border border-border bg-background px-1.5 py-px text-[10px] font-semibold">
            ⌘K
          </kbd>
        </button>
        <div className="flex items-center gap-2 px-2.5 py-1">
          <Avatar initials="YN" background="#E8E9FB" color="#3730A3" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">You</p>
            <p className="truncate text-[10px] text-muted-foreground">
              Owner · Manager group
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
