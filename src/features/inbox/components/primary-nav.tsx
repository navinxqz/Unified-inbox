"use client";

import { useEffect, useState } from "react";
import type {
  ComponentType,
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Command,
  CreditCard,
  Globe,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  Languages,
  ListChecks,
  MessageCircle,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
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
import { hiddenModules } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
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

const visibleGroups = groups
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => !hiddenModules.has(item.id)),
  }))
  .filter((group) => group.items.length > 0);

type PrimaryNavProps = {
  activeModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
  openConversations: number;
  notificationsWaiting: number;
  setupDone: number;
  setupTotal: number;
  practiceMode: boolean;
  onOpenPalette: () => void;
  /** Desktop only — the mobile drawer always renders expanded. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
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
  collapsed = false,
  onToggleCollapsed,
}: PrimaryNavProps) {
  const { language, setLanguage, toggleLanguage, t } = useI18n();
  const [syncedSeconds, setSyncedSeconds] = useState(2);
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(
    null,
  );

  // Realtime heartbeat — stands in for the SSE connection pill.
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncedSeconds((value) => (value >= 14 ? 0 : value + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function showTip(label: string, element: HTMLElement, always = false) {
    if (!collapsed && !always) return;
    const rect = element.getBoundingClientRect();
    const top = Math.min(Math.max(rect.top + rect.height / 2, 24), window.innerHeight - 24);
    setTip({ label, top, left: rect.right + 10 });
  }

  /** Instant label on hover/focus — native title tooltips are too slow here. */
  function tipProps(label: string, always = false) {
    return {
      onMouseEnter: (event: ReactMouseEvent<HTMLElement>) =>
        showTip(label, event.currentTarget, always),
      onMouseLeave: () => setTip(null),
      onFocus: (event: ReactFocusEvent<HTMLElement>) =>
        showTip(label, event.currentTarget, always),
      onBlur: () => setTip(null),
    };
  }

  function badgeFor(id: ModuleId): number | null {
    if (id === "inbox") return openConversations;
    if (id === "notifications") return notificationsWaiting;
    return null;
  }

  function progressFor(id: ModuleId): string | null {
    return id === "setup" ? `${setupDone}/${setupTotal}` : null;
  }

  const statusLabel = practiceMode ? t("Practice mode") : t("Live");

  return (
    <aside
      aria-label="Primary navigation"
      onMouseLeave={() => setTip(null)}
      className={cn(
        "group flex h-full shrink-0 flex-col border-r border-border bg-surface",
        collapsed ? "w-[68px]" : "w-[236px]",
      )}
    >
      {collapsed ? (
        <div className="relative mx-auto mt-4 size-9 shrink-0">
          <div
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-white transition-opacity duration-150 group-hover:opacity-0"
          >
            <Inbox className="size-[18px]" strokeWidth={2} />
          </div>
          {onToggleCollapsed ? (
            <button
              type="button"
              onClick={() => {
                setTip(null);
                onToggleCollapsed();
              }}
              aria-label={t("Expand sidebar")}
              {...tipProps(t("Expand sidebar"), true)}
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[10px] border border-border bg-background text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 hover:border-primary-border hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <PanelLeftOpen className="size-[18px]" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      ) : (
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
          {onToggleCollapsed ? (
            <button
              type="button"
              onClick={() => {
                setTip(null);
                onToggleCollapsed();
              }}
              aria-label={t("Collapse sidebar")}
              {...tipProps(t("Collapse sidebar"), true)}
              className="pointer-events-none flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 hover:bg-border/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <PanelLeftClose className="size-[18px]" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      )}

      <nav
        onScroll={() => setTip(null)}
        className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3"
      >
        {visibleGroups.map((group) => (
          <div
            key={group.label}
            role="group"
            aria-label={group.label}
            className="pb-2"
          >
            {collapsed ? (
              <div aria-hidden="true" className="mx-auto my-2 h-px w-6 bg-border" />
            ) : (
              <p className="px-2 pt-2 pb-1 text-[10px] font-bold tracking-[0.09em] text-muted-foreground uppercase">
                {t(group.label)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = id === activeModule;
                const badge = badgeFor(id);
                const progress = progressFor(id);
                const translatedLabel = t(label);
                const suffix = progress ? ` ${progress}` : badge ? ` ${badge}` : "";

                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? `${translatedLabel}${suffix}` : undefined}
                    {...tipProps(`${translatedLabel}${suffix}`)}
                    onClick={() => onNavigate(id)}
                    className={cn(
                      "relative flex rounded-lg text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                      collapsed
                        ? "mx-auto size-9 items-center justify-center"
                        : "w-full items-center gap-2.5 px-2.5 py-1.5",
                      active
                        ? "bg-primary font-semibold text-white"
                        : "font-medium text-ink-soft hover:bg-border/70",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                    {collapsed ? (
                      <span className="sr-only">{translatedLabel}</span>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-left">{translatedLabel}</span>
                        {progress ? (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              active ? "bg-white/20 text-white" : "bg-border text-ink-soft",
                            )}
                          >
                            {progress}
                          </span>
                        ) : badge ? (
                          <span
                            className={cn(
                              "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums",
                              active ? "bg-white/20 text-white" : "bg-border text-ink-soft",
                            )}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </>
                    )}
                    {collapsed && badge ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -top-0.5 -right-0.5 flex min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums",
                          active
                            ? "bg-white text-primary-strong"
                            : "bg-primary text-white",
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
        {collapsed ? (
          <div className="flex justify-center pb-1.5">
            <span
              {...tipProps(
                language === "bn"
                  ? `${statusLabel} · ${syncedSeconds} সেকেন্ড আগে সিঙ্ক`
                  : `${statusLabel} · synced ${syncedSeconds}s ago`,
              )}
              className={cn(
                "relative flex size-2",
                practiceMode ? "text-amber-500" : "text-emerald-500",
              )}
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-current" />
              <span className="sr-only">{statusLabel}</span>
            </span>
          </div>
        ) : (
          <div className="mb-1.5 flex items-center justify-between gap-2 px-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold whitespace-nowrap",
                practiceMode ? "text-warning" : "text-emerald-700",
              )}
            >
              <span className="relative flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
              {statusLabel}
            </span>
            <span
              title="Realtime connection is active (SSE)"
              className="text-[10px] font-medium whitespace-nowrap text-muted-foreground tabular-nums"
            >
              {language === "bn" ? (
                <span>{syncedSeconds} সেকেন্ড আগে সিঙ্ক</span>
              ) : (
                <>
                  synced{" "}
                  <span className="inline-block w-[2ch] text-right tabular-nums">
                    {syncedSeconds}
                  </span>
                  s ago
                </>
              )}
            </span>
          </div>
        )}

        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={language === "en" ? "Switch to বাংলা" : "Switch to English"}
              {...tipProps(language === "en" ? "Switch to বাংলা" : "Switch to English")}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Languages className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label={t("Quick actions")}
              {...tipProps(`${t("Quick actions")} (⌘K)`)}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Command className="size-4" strokeWidth={2} />
            </button>
            <span {...tipProps(`${t("You")} · Owner`)} className="py-0.5">
              <Avatar initials="YN" background="#E8E9FB" color="#3730A3" size="sm" />
            </span>
          </div>
        ) : (
          <>
            <div className="mb-1.5 flex items-center justify-between rounded-lg px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Languages className="size-3.5" />
                {language === "bn" ? "ভাষা" : "Language"}
              </span>
              <div className="inline-flex rounded-md border border-border bg-background p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "rounded px-1.5 py-0.5 transition-colors",
                    language === "en"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("bn")}
                  className={cn(
                    "rounded px-1.5 py-0.5 transition-colors",
                    language === "bn"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  বাংলা
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPalette}
              className="mb-1.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-border/70 hover:text-foreground"
            >
              {t("Quick actions")}
              <kbd className="rounded border border-border bg-background px-1.5 py-px text-[10px] font-semibold">
                ⌘K
              </kbd>
            </button>
            <div className="flex items-center gap-2 px-2.5 py-1">
              <Avatar initials="YN" background="#E8E9FB" color="#3730A3" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{t("You")}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {t("Owner · Manager group")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {tip ? (
        <span
          role="tooltip"
          style={{ top: tip.top, left: tip.left }}
          className="pointer-events-none fixed z-[70] -translate-y-1/2 rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-background shadow-lg"
        >
          {tip.label}
        </span>
      ) : null}
    </aside>
  );
}
