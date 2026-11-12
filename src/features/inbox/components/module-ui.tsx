"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Bot,
  CheckCircle2,
  Clock,
  Info,
  PlayCircle,
  RotateCcw,
  UserCheck,
  X,
} from "lucide-react";

import type { ConversationMode } from "@/features/inbox/types";
import { useI18n } from "@/features/inbox/i18n";
import { useNowMs } from "@/features/inbox/use-now";
import { cn } from "@/lib/utils";

/* ── Page shell ────────────────────────────────────────────────────────── */

type ModuleShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Annotated "Watch how" walkthrough — real content, opened in a dialog. */
  walkthrough?: { title: string; steps: string[] };
  children: ReactNode;
};

export function ModuleShell({
  title,
  subtitle,
  actions,
  walkthrough,
  children,
}: ModuleShellProps) {
  const { t } = useI18n();
  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{t(title)}</h1>
          {subtitle ? (
            <p className="hidden truncate text-[13px] text-muted-foreground sm:block">
              {t(subtitle)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {walkthrough ? <WatchHowButton walkthrough={walkthrough} /> : null}
        </div>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function WatchHowButton({
  walkthrough,
}: {
  walkthrough: { title: string; steps: string[] };
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        title={t("Watch how · 1 min")}
      >
        <PlayCircle className="size-4 text-primary" strokeWidth={2} />
        <span className="hidden sm:inline">{t("Watch how · 1 min")}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(walkthrough.title)}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl"
          >
            <button
              type="button"
              aria-label={t("Close walkthrough")}
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
              {t("Watch how · 1 min")}
            </p>
            <h2 className="mt-1 text-lg font-bold">{t(walkthrough.title)}</h2>
            <ol className="mt-4 space-y-3">
              {walkthrough.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
                    {index + 1}
                  </span>
                  <span className="text-ink-soft">{t(step)}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
            >
              {t("Got it")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

export function ModuleTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  active: T;
  onChange: (id: T) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
              isActive
                ? "border-primary text-primary-strong"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.label)}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive
                    ? "bg-primary-soft text-primary-strong"
                    : "bg-surface text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── Cards & stats ─────────────────────────────────────────────────────── */

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-background",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-start gap-3 border-b border-border-subtle px-4 py-3">
          <div className="min-w-0 flex-1">
            {title ? <h2 className="text-sm font-bold">{t(title)}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{t(description)}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const { t } = useI18n();
  const toneClass = {
    primary: "bg-primary-soft text-primary-strong",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-warning-soft text-warning",
    danger: "bg-red-50 text-red-700",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{t(label)}</p>
        {Icon ? (
          <span className={cn("flex size-7 items-center justify-center rounded-lg", toneClass)}>
            <Icon className="size-4" strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{t(sub)}</p> : null}
    </div>
  );
}

/* ── Pills & badges ────────────────────────────────────────────────────── */

export type PillTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

const pillTones: Record<PillTone, string> = {
  neutral: "bg-surface text-ink-soft border-border",
  primary: "bg-primary-soft text-primary-strong border-primary-border",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-warning-soft text-warning border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        pillTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ModeBadge({
  mode,
  compact = false,
}: {
  mode: ConversationMode;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const config = {
    ai: { label: t("AI"), icon: Bot, tone: "info" as PillTone },
    human: { label: t("Human"), icon: UserCheck, tone: "success" as PillTone },
    reverting: { label: t("Reverting"), icon: RotateCcw, tone: "warning" as PillTone },
  }[mode];
  const Icon = config.icon;

  if (compact) {
    const dotColor = {
      ai: "bg-sky-500",
      human: "bg-emerald-500",
      reverting: "bg-amber-500",
    }[mode];
    return (
      <span
        title={t("{label} is answering", { label: config.label })}
        aria-label={t("{label} is answering", { label: config.label })}
        className={cn("size-2 shrink-0 rounded-full", dotColor)}
      />
    );
  }

  return (
    <Pill tone={config.tone}>
      <Icon className="size-3" strokeWidth={2.5} />
      {config.label}
    </Pill>
  );
}

export function SlaBadge({
  waitingSinceMs,
  targetMin,
  compact = false,
}: {
  waitingSinceMs?: number;
  targetMin: number;
  compact?: boolean;
}) {
  const now = useNowMs();
  if (!waitingSinceMs || now === null) return null;
  const waited = Math.max(0, Math.round((now - waitingSinceMs) / 60_000));
  const breached = waited > targetMin;

  if (!breached) return null;

  if (compact) {
    return (
      <span
        title={`Waiting ${waited}m · SLA ${targetMin}m`}
        className="inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap text-red-600 tabular-nums"
      >
        <Clock className="size-3" strokeWidth={2.5} />
        {waited}m
      </span>
    );
  }

  return (
    <Pill tone="danger">
      <Clock className="size-3" strokeWidth={2.5} />
      {waited}m · SLA {targetMin}m
    </Pill>
  );
}

/* ── Toggle ────────────────────────────────────────────────────────────── */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? t(label) : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
      {label ? <span className="text-xs font-medium text-ink-soft">{t(label)}</span> : null}
    </label>
  );
}

/* ── Form field ────────────────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="text-[11px] font-semibold text-muted-foreground">{t(label)}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-foreground">{t(hint)}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none transition-colors focus:border-primary";

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon = Info,
  title,
  text,
}: {
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  text: string;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-surface text-muted-foreground">
        <Icon className="size-5" strokeWidth={2} />
      </div>
      <p className="text-sm font-semibold">{t(title)}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{t(text)}</p>
    </div>
  );
}

/* ── Stacked data bar ──────────────────────────────────────────────────── */

export function DataBar({
  segments,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const { t } = useI18n();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
        {segments.map((segment) => (
          <span
            key={segment.label}
            title={`${t(segment.label)}: ${segment.value}`}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {t(segment.label)}
            <b className="text-foreground">{segment.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Success flash ─────────────────────────────────────────────────────── */

export function SavedFlash({ show, label = "Saved" }: { show: boolean; label?: string }) {
  const { t } = useI18n();
  if (!show) return null;
  return (
    <Pill tone="success">
      <CheckCircle2 className="size-3" strokeWidth={2.5} />
      {t(label)}
    </Pill>
  );
}
