"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  GripVertical,
  Key,
  Layers,
  Play,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import type {
  ApiKeyItem,
  ChannelConnection,
  ChannelId,
  WebhookEventItem,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ChannelsManagerProps = {
  channels: ChannelConnection[];
  apiKeys: ApiKeyItem[];
  webhookEvents: WebhookEventItem[];
  onUpdateChannels: (channels: ChannelConnection[]) => void;
  onUpdateApiKeys: (keys: ApiKeyItem[]) => void;
  onSimulateWebhook: (channel: ChannelId) => void;
};

export function ChannelsManager({
  channels,
  apiKeys,
  webhookEvents,
  onUpdateChannels,
  onUpdateApiKeys,
  onSimulateWebhook,
}: ChannelsManagerProps) {
  const [activeTab, setActiveTab] = useState<"channels" | "webhooks" | "apikeys">("channels");
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<ChannelId | null>(null);

  function handleCopy(text: string, id: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function handleToggleChannel(id: ChannelId) {
    const updated = channels.map((ch) =>
      ch.id === id ? { ...ch, enabled: !ch.enabled } : ch,
    );
    onUpdateChannels(updated);
  }

  function handleDragStart(id: ChannelId) {
    setDraggedId(id);
  }

  function handleDrop(targetId: ChannelId) {
    if (!draggedId || draggedId === targetId) return;
    const curIdx = channels.findIndex((c) => c.id === draggedId);
    const tarIdx = channels.findIndex((c) => c.id === targetId);
    if (curIdx !== -1 && tarIdx !== -1) {
      const list = [...channels];
      const [removed] = list.splice(curIdx, 1);
      list.splice(tarIdx, 0, removed);
      onUpdateChannels(list);
    }
    setDraggedId(null);
  }

  function handleCreateApiKey() {
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `pk_live_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsedAt: "Never",
    };
    onUpdateApiKeys([newKey, ...apiKeys]);
    setNewKeyName("");
  }

  function handleDeleteApiKey(id: string) {
    onUpdateApiKeys(apiKeys.filter((k) => k.id !== id));
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-background p-6 space-y-6">
      {/* Top Banner & Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Channel Connections & API Integrations
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your incoming omnichannel pipelines, webhook endpoints, and API authentication credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors",
            activeTab === "channels"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Layers className="size-3.5" />
          <span>Connected Channels ({channels.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("webhooks")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors",
            activeTab === "webhooks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Webhook className="size-3.5" />
          <span>Webhooks & Live Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apikeys")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors",
            activeTab === "apikeys"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Key className="size-3.5" />
          <span>API Access Keys ({apiKeys.length})</span>
        </button>
      </div>

      {/* Tab 1: Channels Manager */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-alt/40 p-3 text-xs text-muted-foreground">
            <b>Channel Priority:</b> Drag channels using the vertical grip handle to prioritize which incoming channels get first-response routing in your inbox.
          </div>

          <div className="divide-y divide-border border border-border rounded-lg bg-surface/30">
            {channels.map((channel, idx) => (
              <div
                key={channel.id}
                draggable
                onDragStart={() => handleDragStart(channel.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(channel.id)}
                className="flex items-center justify-between p-3.5 hover:bg-surface/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="cursor-grab text-muted-foreground/60 hover:text-foreground">
                    <GripVertical className="size-4" />
                  </div>

                  <span
                    className="flex size-7 items-center justify-center rounded text-white shadow-2xs"
                    style={{ backgroundColor: channel.color }}
                  >
                    <ChannelIcon channel={channel.id} className="size-4 text-white" />
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {channel.label}
                      </span>
                      <span className="rounded bg-primary-soft px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                        Priority #{idx + 1}
                      </span>
                      {channel.enabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          Live Connected
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Account: <span className="font-mono text-ink-soft">{channel.accountHandle}</span> · Synced {channel.lastSyncedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleChannel(channel.id)}
                    className={cn(
                      "rounded border px-2.5 py-1 text-xs font-semibold transition-colors",
                      channel.enabled
                        ? "border-border bg-background text-foreground hover:bg-surface"
                        : "border-primary bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    {channel.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Webhooks Simulator & Endpoints */}
      {activeTab === "webhooks" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4 bg-surface/20 space-y-3">
            <h3 className="font-bold text-sm text-foreground">
              Live Inbound Webhook Endpoints
            </h3>
            <p className="text-xs text-muted-foreground">
              Point your third-party provider webhooks (e.g. Twilio, Meta Cloud API, SendGrid Event Webhooks) to these endpoints:
            </p>

            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between rounded border border-border bg-background p-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChannelIcon channel={channel.id} className="size-3.5 shrink-0" />
                    <span className="font-semibold text-foreground shrink-0">{channel.label}:</span>
                    <span className="font-mono text-muted-foreground truncate">{channel.webhookUrl}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(channel.webhookUrl, channel.id)}
                      className="rounded border border-border p-1 hover:bg-surface text-ink-soft"
                      title={copiedId === channel.id ? "Copied!" : "Copy URL"}
                    >
                      {copiedId === channel.id ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateWebhook(channel.id)}
                      className="inline-flex items-center gap-1 rounded bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary-soft/80"
                    >
                      <Play className="size-3" />
                      Simulate Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Delivery Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Recent Webhook Ingestion Log</h3>
              <span className="text-xs text-muted-foreground">{webhookEvents.length} events logged</span>
            </div>

            <div className="rounded-lg border border-border bg-background divide-y divide-border">
              {webhookEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-bold uppercase text-[10px] text-muted-foreground">
                      {evt.channel}
                    </span>
                    <span className="font-semibold text-foreground">{evt.event}</span>
                    <span className="font-mono text-muted-foreground text-[11px]">{evt.payload}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Keys */}
      {activeTab === "apikeys" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Staging Ingestion Key"
              className="h-8 rounded border border-border bg-background px-3 text-xs outline-none focus:border-primary min-w-[280px]"
            />
            <button
              type="button"
              onClick={handleCreateApiKey}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Generate API Key
            </button>
          </div>

          <div className="rounded-lg border border-border bg-background divide-y divide-border">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <p className="font-bold text-foreground">{k.name}</p>
                  <p className="font-mono text-muted-foreground text-[11px] mt-0.5">
                    {k.keyPrefix}••••••••••••••••
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>Created: {k.createdAt}</p>
                    <p>Last active: {k.lastUsedAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteApiKey(k.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
