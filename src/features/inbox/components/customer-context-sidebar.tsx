"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  User,
} from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { useI18n } from "@/features/inbox/i18n";
import type { ConversationPriority, ConversationStatus, Person } from "@/features/inbox/types";

type CustomerContextSidebarProps = {
  person: Person | null;
  onUpdateStatus: (personId: string, status: ConversationStatus) => void;
  onUpdatePriority: (personId: string, priority: ConversationPriority) => void;
};

export function CustomerContextSidebar({
  person,
  onUpdateStatus,
  onUpdatePriority,
}: CustomerContextSidebarProps) {
  const { t } = useI18n();
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string[]>(["Client requested enterprise SLA confirmation."]);

  if (!person) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground border-l border-border bg-surface-alt/40">
        <User className="size-8 text-muted-foreground/40 mb-2" />
        <p className="font-semibold text-foreground">{t("No conversation selected")}</p>
        <p className="mt-1">{t("Pick a thread from the stream to inspect customer CRM metadata.")}</p>
      </div>
    );
  }

  function handleAddNote() {
    if (!internalNotes.trim()) return;
    setSavedNotes((current) => [...current, internalNotes.trim()]);
    setInternalNotes("");
  }

  return (
    <aside
      aria-label={t("Customer CRM Context")}
      className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-border bg-surface-alt/30 text-xs text-foreground p-3.5 space-y-4"
    >
      {/* Profile Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-3.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">{person.name}</h3>
            <p className="text-muted-foreground text-xs">{person.email}</p>
          </div>
          <span className="flex items-center gap-1 rounded bg-primary-soft px-2 py-0.5 font-semibold text-primary text-[11px]">
            <ChannelIcon channel={person.channel} className="size-3 text-primary" />
            <span className="capitalize">{person.channel}</span>
          </span>
        </div>

        {person.company ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Building2 className="size-3.5" />
            <span>{person.company}</span>
          </div>
        ) : null}

        {person.phone ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Phone className="size-3.5" />
            <span>{person.phone}</span>
          </div>
        ) : null}
      </div>

      {/* Ticket Operations: Status & Priority Controls */}
      <div className="space-y-2 border-b border-border pb-3.5">
        <h4 className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
          {t("Ticket Triage")}
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">
              {t("Status")}
            </label>
            <select
              value={person.status ?? "open"}
              onChange={(e) =>
                onUpdateStatus(person.id, e.target.value as ConversationStatus)
              }
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            >
              <option value="open">{t("Open")}</option>
              <option value="pending">{t("Pending")}</option>
              <option value="resolved">{t("Resolved")}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-1">
              {t("Priority")}
            </label>
            <select
              value={person.ticketPriority ?? "medium"}
              onChange={(e) =>
                onUpdatePriority(person.id, e.target.value as ConversationPriority)
              }
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            >
              <option value="low">{t("Low")}</option>
              <option value="medium">{t("Medium")}</option>
              <option value="high">{t("High")}</option>
              <option value="urgent">{t("Urgent")}</option>
            </select>
          </div>
        </div>

        <div className="pt-1">
          <label className="text-[10px] font-medium text-muted-foreground block mb-1">
            {t("Assignee")}
          </label>
          <div className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1">
            <User className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{person.assignee ?? t("Unassigned")}</span>
          </div>
        </div>
      </div>

      {/* Account & Telemetry */}
      <div className="space-y-2 border-b border-border pb-3.5">
        <h4 className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
          {t("Account Tier & SLA")}
        </h4>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">{t("Plan")}</span>
          <span className="font-semibold text-primary bg-primary-soft px-1.5 py-0.5 rounded text-[11px]">
            {person.planTier ?? t("Starter")}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">{t("Response SLA")}</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {t("Within 15 mins (Target Met)")}
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">{t("First Contact")}</span>
          <span className="text-muted-foreground">Oct 24, 2026</span>
        </div>
      </div>

      {/* Internal Team Notes */}
      <div className="space-y-2">
        <h4 className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">
          {t("Internal Team Notes (Private)")}
        </h4>

        <div className="space-y-1.5">
          {savedNotes.map((note, index) => (
            <div
              key={index}
              className="rounded bg-background border border-border p-2 text-xs text-ink-soft leading-relaxed shadow-2xs"
            >
              {note}
            </div>
          ))}
        </div>

        <div className="pt-1 flex flex-col gap-1.5">
          <textarea
            rows={2}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder={t("Add an internal note for your team...")}
            className="w-full rounded border border-border bg-background p-2 text-xs outline-none focus:border-primary resize-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!internalNotes.trim()}
            className="self-end rounded bg-surface border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-border/60 disabled:opacity-40 transition-colors"
          >
            {t("Add Note")}
          </button>
        </div>
      </div>
    </aside>
  );
}
