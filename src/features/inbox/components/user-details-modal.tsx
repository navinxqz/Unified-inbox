"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Phone,
  Shield,
  X,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { channelById } from "@/features/inbox/data";
import type { ConversationPriority, ConversationStatus, Person } from "@/features/inbox/types";

type UserDetailsModalProps = {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (personId: string, status: ConversationStatus) => void;
  onUpdatePriority?: (personId: string, priority: ConversationPriority) => void;
};

export function UserDetailsModal({
  person,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
}: UserDetailsModalProps) {
  const [internalNotes, setInternalNotes] = useState("");
  const [notes, setNotes] = useState<string[]>([
    "Client requested confirmation on delivery timeline.",
    "Verified account tier and SLA response window.",
  ]);

  if (!isOpen || !person) return null;

  const channel = channelById[person.channel];

  function handleAddNote() {
    if (!internalNotes.trim()) return;
    setNotes((prev) => [...prev, internalNotes.trim()]);
    setInternalNotes("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User Details"
        className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Avatar
              initials={person.initials}
              background={person.avatar.background}
              color={person.avatar.color}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  {person.name}
                </h3>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  <ChannelIcon channel={person.channel} className="size-3 text-white" />
                  <span>{channel.label}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{person.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Contact & Company Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-surface/30 p-2.5">
            <span className="text-[11px] text-muted-foreground block mb-1">Company</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-muted-foreground" />
              {person.company ?? "Individual Customer"}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-surface/30 p-2.5">
            <span className="text-[11px] text-muted-foreground block mb-1">Account Tier</span>
            <span className="font-semibold text-primary flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              {person.planTier ?? "Starter Plan"}
            </span>
          </div>

          {person.phone ? (
            <div className="rounded-lg border border-border bg-surface/30 p-2.5">
              <span className="text-[11px] text-muted-foreground block mb-1">Phone</span>
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" />
                {person.phone}
              </span>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-surface/30 p-2.5">
            <span className="text-[11px] text-muted-foreground block mb-1">Response SLA</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Target Met (&lt;15m)
            </span>
          </div>
        </div>

        {/* Ticket Status & Priority Triage */}
        <div className="rounded-lg border border-border p-3 bg-surface/20 space-y-2 text-xs">
          <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Ticket Triage
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Status</label>
              <select
                value={person.status ?? "open"}
                onChange={(e) =>
                  onUpdateStatus?.(person.id, e.target.value as ConversationStatus)
                }
                className="w-full rounded border border-border bg-background p-1.5 text-xs outline-none focus:border-primary"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Priority</label>
              <select
                value={person.ticketPriority ?? "medium"}
                onChange={(e) =>
                  onUpdatePriority?.(person.id, e.target.value as ConversationPriority)
                }
                className="w-full rounded border border-border bg-background p-1.5 text-xs outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Private Team Notes */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Internal Team Notes
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {notes.map((n, i) => (
              <div key={i} className="rounded bg-surface p-2 text-ink-soft leading-relaxed">
                {n}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add team note..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              className="flex-1 rounded border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddNote}
              className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
