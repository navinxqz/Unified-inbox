"use client";

import { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Globe,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { initialWebsiteChat } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { WebsiteChatState } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const modes: Array<{
  id: WebsiteChatState["mode"];
  label: string;
  description: string;
}> = [
  {
    id: "off",
    label: "Off",
    description: "Widget hidden everywhere. No chats are accepted.",
  },
  {
    id: "test",
    label: "Test",
    description: "Live only on the domains you list, capped per visitor — safe for rehearsal.",
  },
  {
    id: "on",
    label: "On",
    description: "Live for every visitor on the allowed domains.",
  },
];

type WebsiteChatProps = {
  logActivity: (action: string, subject: string) => void;
};

export function WebsiteChatModule({ logActivity }: WebsiteChatProps) {
  const [state, setState] = useStoredState<WebsiteChatState>(
    MODULE_STORAGE_KEYS.websiteChat,
    initialWebsiteChat,
  );
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState(false);

  function update(next: Partial<WebsiteChatState>) {
    setState({ ...state, ...next });
  }

  function addDomain() {
    const clean = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
    if (!clean || state.sites.some((site) => site.domain === clean)) return;

    update({
      sites: [
        ...state.sites,
        {
          id: `site_${Math.random().toString(16).slice(2, 18)}`,
          domain: clean,
          dailyCap: 200,
          leadGate: true,
        },
      ],
    });
    logActivity(`allowed website chat on ${clean}`, "Website chat");
    setDomain("");
  }

  const embedCode = `<script src="https://cdn.unifiedinbox.io/embed.js"\n  data-site="${state.sites[0]?.id ?? "site_demo"}" async></script>`;

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <ModuleShell
      title="Website chat"
      subtitle="One-line widget, origin-checked, with a per-visitor AI cap and an optional name + phone lead gate."
      walkthrough={{
        title: "Ship the widget",
        steps: [
          "Start in Test mode — only your allow-listed domains get the widget.",
          "Paste the one-line embed script before </body> on your site.",
          "Add a domain to the allowlist; requests from unknown origins are rejected.",
          "Turn on the lead gate to require a name and phone before the chat starts.",
        ],
      }}
    >
      <SectionCard title="Deployment mode" description="Test is the safe default for new sites.">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {modes.map((mode) => {
            const active = state.mode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  update({ mode: mode.id });
                  logActivity(`set website chat to ${mode.label}`, "Website chat");
                }}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary-soft/50"
                    : "border-border hover:bg-surface/60",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-bold">{mode.label}</span>
                  {active ? <Check className="size-4 text-primary" /> : null}
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
                  {mode.description}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <SectionCard title="Allowed domains" description="Origin-checked: unknown domains are refused.">
            <div className="flex flex-wrap items-end gap-2 pb-3">
              <Field label="Add a domain" className="min-w-[200px] flex-1">
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  className={inputClass}
                  placeholder="shop.example.com"
                />
              </Field>
              <button
                type="button"
                onClick={addDomain}
                disabled={!domain.trim()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="size-4" />
                Allow
              </button>
            </div>

            {state.sites.length === 0 ? (
              <EmptyState icon={Globe} title="No domains allowed" text="Add the domain you embed the widget on." />
            ) : (
              <div className="divide-y divide-border-subtle">
                {state.sites.map((site) => (
                  <div key={site.id} className="flex flex-wrap items-center gap-2 py-2.5">
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{site.domain}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{site.id}</p>
                    </div>
                    <Pill tone="neutral">{site.dailyCap}/day AI cap</Pill>
                    <Toggle
                      checked={site.leadGate}
                      onChange={(checked) =>
                        update({
                          sites: state.sites.map((item) =>
                            item.id === site.id ? { ...item, leadGate: checked } : item,
                          ),
                        })
                      }
                      label={`Lead gate for ${site.domain}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        update({ sites: state.sites.filter((item) => item.id !== site.id) });
                        logActivity(`removed website chat domain ${site.domain}`, "Website chat");
                      }}
                      aria-label={`Remove ${site.domain}`}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 inline-flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Every widget request is origin-checked and the widget is rendered in a
              sandboxed iframe — the host page never gets direct script access.
            </p>
          </SectionCard>

          <SectionCard title="Embed code" description="One line, before </body>.">
            <pre className="scrollbar-thin overflow-x-auto rounded-lg bg-foreground p-3 text-[11px] leading-relaxed text-white">
              {embedCode}
            </pre>
            <button
              type="button"
              onClick={copyEmbed}
              className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy embed code"}
            </button>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Branding">
            <div className="space-y-2.5">
              <Field label="Widget name">
                <input
                  value={state.widgetName}
                  onChange={(event) => update({ widgetName: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Greeting">
                <textarea
                  value={state.greeting}
                  onChange={(event) => update({ greeting: event.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </Field>
              <Field label="Accent colour">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.accent}
                    onChange={(event) => update({ accent: event.target.value })}
                    aria-label="Accent colour"
                    className="h-9 w-12 cursor-pointer rounded border border-border bg-background"
                  />
                  <input
                    value={state.accent}
                    onChange={(event) => update({ accent: event.target.value })}
                    className={inputClass}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Preview">
            <div className="rounded-xl bg-surface p-3">
              <div className="ml-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                <div
                  className="flex items-center gap-2 px-3 py-2 text-white"
                  style={{ backgroundColor: state.accent }}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                    <MessageSquare className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold">{state.widgetName}</p>
                    <p className="text-[9px] opacity-90">
                      {state.mode === "off" ? "widget hidden" : "online now"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="mr-6 rounded-lg rounded-bl-sm bg-surface px-2 py-1.5 text-[10px]">
                    {state.greeting}
                  </p>
                  {state.sites.some((site) => site.leadGate) ? (
                    <p className="mr-6 rounded-lg rounded-bl-sm border border-dashed border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                      Name + phone gate shown before the first message.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Code2 className="size-3.5" />
              Mode: <b className="text-foreground">{state.mode}</b>
            </p>
          </SectionCard>
        </div>
      </div>
    </ModuleShell>
  );
}
