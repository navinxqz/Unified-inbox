"use client";

import { useState } from "react";
import { ArrowLeft, Check, ExternalLink, Plus, ShieldCheck, X } from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import type { ChannelConnection, ChannelId } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const providers: Record<
  string,
  { method: string; hint: string }
> = {
  whatsapp: {
    method: "Official WhatsApp Cloud API",
    hint: "Meta Business verification · webhook verified automatically",
  },
  messenger: { method: "Facebook OAuth", hint: "Page permissions: messages, comments" },
  instagram: { method: "Instagram OAuth", hint: "Professional account · DM + comments" },
  gmail: { method: "Google OAuth", hint: "Read + send scopes, no password stored" },
  email: { method: "SMTP / IMAP", hint: "App password recommended" },
  telegram: { method: "Bot token", hint: "Create with @BotFather" },
  discord: { method: "Bot invite", hint: "Guild + message intent" },
  slack: { method: "Slack OAuth", hint: "Incoming webhook + chat:write" },
  website: { method: "Widget embed", hint: "Origin-checked, sandboxed iframe" },
};

type ChannelConnectDialogProps = {
  channels: ChannelConnection[];
  onClose: () => void;
  onConnect: (channel: ChannelConnection, accountHandle: string) => void;
};

export function ChannelConnectDialog({
  channels,
  onClose,
  onConnect,
}: ChannelConnectDialogProps) {
  const [selected, setSelected] = useState<ChannelConnection | null>(null);
  const [accountHandle, setAccountHandle] = useState("");
  const [done, setDone] = useState(false);

  const provider = selected ? providers[selected.id] : null;

  function connect() {
    if (!selected) return;
    const handle = accountHandle.trim() || `${selected.id}-desk-2`;
    onConnect(selected, handle);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect a channel"
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          {selected && !done ? (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setAccountHandle("");
              }}
              aria-label="Back to channel list"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {done ? "Channel connected" : selected ? `Connect ${selected.label}` : "Connect a channel"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {done
                ? "Inbound messages will start routing into the unified inbox."
                : selected
                  ? provider?.method
                  : "Every channel lands in the same inbox."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {done && selected ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-6" />
              </span>
              <p className="text-sm font-bold">{selected.label} is live</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {accountHandle.trim() || `${selected.id}-desk-2`} is receiving messages.
                The webhook is verified and the channel is now highest priority for new
                inbound.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          ) : selected ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-surface/50 p-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {provider?.method}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{provider?.hint}</p>
                <ol className="mt-2 space-y-1 text-[11px] text-ink-soft">
                  <li>1. Authorise with {selected.label} — credentials are exchanged, never stored in the browser.</li>
                  <li>2. We verify the webhook and run a test message.</li>
                  <li>3. The channel appears in the inbox and can be reordered by priority.</li>
                </ol>
              </div>

              <label className="block space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Account handle
                </span>
                <input
                  value={accountHandle}
                  onChange={(event) => setAccountHandle(event.target.value)}
                  placeholder={`e.g. ${selected.id}@yourbrand`}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-primary"
                />
              </label>

              <p className="inline-flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                This demo simulates the OAuth handshake locally; no network request
                leaves the browser.
              </p>

              <button
                type="button"
                onClick={connect}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-white hover:bg-primary/90"
              >
                <Plus className="size-4" />
                Authorise &amp; connect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Pick a channel type to add another account (for example a second
                WhatsApp number).
              </p>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => {
                    setSelected(channel);
                    setDone(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-surface",
                  )}
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: channel.color }}
                  >
                    <ChannelIcon channel={channel.id as ChannelId} className="size-4 text-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold">{channel.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {providers[channel.id]?.hint ?? "Additional account"}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {channel.count} connected
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
