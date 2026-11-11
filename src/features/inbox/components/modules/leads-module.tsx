"use client";

import { useState } from "react";
import { Download, Plus, Target, UserRound } from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { leadStageLabels } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { Lead, LeadStage } from "@/features/inbox/types";
import { cn, downloadCsv } from "@/lib/utils";

const stages: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "won",
  "lost",
];

const stageTone: Record<LeadStage, "neutral" | "info" | "primary" | "warning" | "success" | "danger"> = {
  new: "neutral",
  contacted: "info",
  qualified: "primary",
  negotiating: "warning",
  won: "success",
  lost: "danger",
};

type LeadsSettings = {
  enabled: boolean;
  autoLeadOnHandoff: boolean;
  capturePhoneOnComments: boolean;
};

const defaultSettings: LeadsSettings = {
  enabled: true,
  autoLeadOnHandoff: true,
  capturePhoneOnComments: true,
};

type LeadsProps = {
  leads: Lead[];
  onUpdate: (leads: Lead[]) => void;
  logActivity: (action: string, subject: string) => void;
};

export function LeadsModule({ leads, onUpdate, logActivity }: LeadsProps) {
  const [settings, setSettings] = useStoredState<LeadsSettings>(
    MODULE_STORAGE_KEYS.leadsSettings,
    defaultSettings,
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", value: "" });

  function moveLead(leadId: string, stage: LeadStage) {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead || lead.stage === stage) return;
    onUpdate(leads.map((item) => (item.id === leadId ? { ...item, stage } : item)));
    logActivity(`moved ${lead.name} to ${leadStageLabels[stage]}`, "Leads pipeline");
  }

  function addLead() {
    const name = draft.name.trim();
    if (!name) return;
    onUpdate([
      {
        id: `lead-${Date.now()}`,
        name,
        phone: draft.phone.trim() || "—",
        channel: "website",
        value: Number(draft.value) || 0,
        stage: "new",
        source: "Added manually",
        createdAt: "Just now",
      },
      ...leads,
    ]);
    logActivity(`added lead ${name}`, "Leads pipeline");
    setDraft({ name: "", phone: "", value: "" });
    setCreating(false);
  }

  const wonValue = leads
    .filter((lead) => lead.stage === "won")
    .reduce((sum, lead) => sum + lead.value, 0);

  return (
    <ModuleShell
      title="Leads"
      subtitle="Every customer who showed buying intent — captured from the widget, DMs, comments, and handoffs."
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              downloadCsv("leads.csv", [
                ["Name", "Phone", "Channel", "Stage", "Value", "Source", "Created"],
                ...leads.map((lead) => [
                  lead.name,
                  lead.phone,
                  lead.channel,
                  leadStageLabels[lead.stage],
                  lead.value,
                  lead.source,
                  lead.createdAt,
                ]),
              ])
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
          >
            <Download className="size-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setCreating((value) => !value)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add lead
          </button>
        </>
      }
      walkthrough={{
        title: "Run the leads pipeline",
        steps: [
          "New leads arrive from the website widget's name + phone gate, DMs, and comment capture.",
          "Drag a card between stages as the deal moves — every move is written to the audit trail.",
          "Turn on auto-lead-on-handoff to capture intent the moment the AI escalates.",
          "Export the pipeline as CSV for your sales review.",
        ],
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <SectionCard
          title="Pipeline"
          description={`${leads.length} leads · ${wonValue.toLocaleString()} won value`}
        >
          <div className="scrollbar-thin -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
            {stages.map((stage) => {
              const items = leads.filter((lead) => lead.stage === stage);
              const isDragOver = dragOverStage === stage;
              return (
                <div
                  key={stage}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedId) moveLead(draggedId, stage);
                    setDraggedId(null);
                    setDragOverStage(null);
                  }}
                  className={cn(
                    "flex w-[212px] shrink-0 flex-col rounded-xl border bg-surface/50 p-2",
                    isDragOver ? "border-primary bg-primary-soft/50" : "border-border-subtle",
                  )}
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <p className="text-xs font-bold">{leadStageLabels[stage]}</p>
                    <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-2 py-4 text-center text-[11px] text-muted-foreground">
                        Drop here
                      </p>
                    ) : (
                      items.map((lead) => (
                        <article
                          key={lead.id}
                          draggable
                          onDragStart={() => setDraggedId(lead.id)}
                          onDragEnd={() => setDraggedId(null)}
                          className="cursor-grab rounded-lg border border-border bg-background p-2.5 active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-[13px] font-semibold">{lead.name}</p>
                            <ChannelIcon channel={lead.channel} className="size-3.5 shrink-0" />
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{lead.phone}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs font-bold">
                              {lead.value.toLocaleString()}
                            </span>
                            <Pill tone={stageTone[stage]}>{lead.createdAt}</Pill>
                          </div>
                          {lead.note ? (
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                              {lead.note}
                            </p>
                          ) : null}
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Capture" description="Where leads come from.">
            <div className="space-y-3">
              <Toggle
                checked={settings.enabled}
                onChange={(checked) => setSettings({ ...settings, enabled: checked })}
                label="Leads pipeline enabled"
              />
              <Toggle
                checked={settings.autoLeadOnHandoff}
                onChange={(checked) =>
                  setSettings({ ...settings, autoLeadOnHandoff: checked })
                }
                label="Auto-lead on human handoff"
              />
              <Toggle
                checked={settings.capturePhoneOnComments}
                onChange={(checked) =>
                  setSettings({ ...settings, capturePhoneOnComments: checked })
                }
                label="Capture phone numbers from comments"
              />
              <p className="rounded-lg bg-surface p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                If the pipeline is off, everything still works — handoffs and
                orders just don&apos;t create lead cards. Nothing is deleted.
              </p>
            </div>
          </SectionCard>

          {creating ? (
            <SectionCard title="New lead">
              <div className="space-y-2">
                <Field label="Name">
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    className={inputClass}
                    placeholder="Customer name"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                    className={inputClass}
                    placeholder="+880 …"
                  />
                </Field>
                <Field label="Deal value">
                  <input
                    value={draft.value}
                    onChange={(event) => setDraft({ ...draft, value: event.target.value })}
                    className={inputClass}
                    placeholder="1500"
                    inputMode="numeric"
                  />
                </Field>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={addLead}
                    disabled={!draft.name.trim()}
                    className="h-9 flex-1 rounded-lg bg-primary text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="h-9 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Sources" description="Last 30 days.">
              {[
                { label: "Website widget", count: 38 },
                { label: "Instagram DM", count: 24 },
                { label: "Comment capture", count: 17 },
                { label: "WhatsApp Cloud API", count: 12 },
                { label: "Gmail", count: 6 },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-border-subtle py-1.5 text-[13px] last:border-0"
                >
                  <span className="inline-flex items-center gap-1.5 text-ink-soft">
                    <UserRound className="size-3.5 text-muted-foreground" />
                    {row.label}
                  </span>
                  <b>{row.count}</b>
                </div>
              ))}
            </SectionCard>
          )}
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No leads yet"
          text="Leads appear here as soon as a customer shows buying intent."
        />
      ) : null}
    </ModuleShell>
  );
}
