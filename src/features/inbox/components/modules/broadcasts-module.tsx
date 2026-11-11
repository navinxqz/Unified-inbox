"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Info,
  Megaphone,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { initialBroadcasts, broadcastFormatLabels } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type {
  Broadcast,
  BroadcastAudience,
  BroadcastFormat,
  ChannelId,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const formats: BroadcastFormat[] = [
  "text",
  "card",
  "image",
  "template",
  "video",
  "audio",
  "poll",
];

const channels: Array<{ id: ChannelId; note: string }> = [
  { id: "whatsapp", note: "Official Cloud API · template messages allowed" },
  { id: "messenger", note: "24h window · only to recent conversations" },
  { id: "instagram", note: "24h window · DM broadcasts" },
  { id: "email", note: "No window limit" },
  { id: "telegram", note: "Bot broadcast · no window limit" },
  { id: "discord", note: "Guild announcement channels" },
];

type BroadcastsProps = {
  logActivity: (action: string, subject: string) => void;
  pushNotification: (input: {
    kind: "waiting" | "past-target" | "never-answered" | "order" | "system";
    title: string;
    body: string;
  }) => void;
};

export function BroadcastsModule({ logActivity, pushNotification }: BroadcastsProps) {
  const [broadcasts, setBroadcasts] = useStoredState<Broadcast[]>(
    MODULE_STORAGE_KEYS.broadcasts,
    initialBroadcasts,
  );
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ChannelId>("whatsapp");
  const [format, setFormat] = useState<BroadcastFormat>("template");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>({
    lastActiveDays: 30,
    interestTag: "restock",
    purchased: true,
    skipRecentBroadcast: true,
  });
  const [testSent, setTestSent] = useState(false);

  const selectedChannel = channels.find((item) => item.id === channel);
  const windowCompliant = channel !== "messenger" && channel !== "instagram";
  const canSend = name.trim().length > 0 && body.trim().length > 0 && testSent;

  function send() {
    if (!canSend) return;
    const recipients =
      200 + Math.round(audience.lastActiveDays * 4.2) + (audience.purchased ? 60 : 0);

    setBroadcasts([
      {
        id: `bc-${Date.now()}`,
        name: name.trim(),
        channel,
        audience,
        recipients,
        format,
        status: "sent",
        sentAt: "Just now",
        windowCompliant,
      },
      ...broadcasts,
    ]);
    logActivity(`sent broadcast “${name.trim()}” to ${recipients} customers`, `Broadcasts · ${channel}`);
    pushNotification({
      kind: "system",
      title: `Broadcast “${name.trim()}” sent`,
      body: `${recipients} recipients on ${selectedChannel ? channel : channel}. Delivery starts immediately.`,
    });
    setName("");
    setBody("");
    setTestSent(false);
  }

  return (
    <ModuleShell
      title="Broadcasts"
      subtitle="Send to a filtered audience — with the 23-hour window rules made explicit."
      walkthrough={{
        title: "Send your first broadcast",
        steps: [
          "Pick the channel — WhatsApp Cloud API is official, so template messages are allowed.",
          "Filter the audience by recency, interest, and purchase history.",
          "Send a test to your own phone first — the Send button stays locked until you do.",
          "Check the window badge: Messenger and Instagram only reach conversations active in the last 23 hours.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Sent broadcasts"
          value={String(broadcasts.filter((item) => item.status === "sent").length)}
          icon={Megaphone}
        />
        <StatCard
          label="Recipients reached"
          value={String(
            broadcasts
              .filter((item) => item.status === "sent")
              .reduce((sum, item) => sum + item.recipients, 0),
          )}
          icon={Users}
        />
        <StatCard label="Drafts" value={String(broadcasts.filter((item) => item.status === "draft").length)} icon={Send} tone="warning" />
        <StatCard label="Window compliant" value="All sends" sub="checked before dispatch" icon={ShieldCheck} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <SectionCard title="New broadcast" description="Compose, filter, test, send.">
          <div className="grid gap-3">
            <Field label="Broadcast name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder="Eid restock alert"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Channel">
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as ChannelId)}
                  className={inputClass}
                >
                  {channels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Format">
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value as BroadcastFormat)}
                  className={inputClass}
                >
                  {formats.map((item) => (
                    <option key={item} value={item}>
                      {broadcastFormatLabels[item]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <p className="rounded-lg bg-surface px-3 py-2 text-[11px] text-muted-foreground">
              <span className="font-semibold text-ink-soft">{selectedChannel?.id}</span> ·{" "}
              {selectedChannel?.note}
            </p>

            <Field label="Message">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Hi {{name}} — the Trail Jacket is back in stock in every size. Use EID20 for 20% off today."
              />
            </Field>

            <div className="rounded-lg border border-border-subtle p-3">
              <p className="mb-2 text-xs font-bold">Audience</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Active within (days)">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={audience.lastActiveDays}
                    onChange={(event) =>
                      setAudience({
                        ...audience,
                        lastActiveDays: Number(event.target.value) || 1,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Interest tag">
                  <input
                    value={audience.interestTag ?? ""}
                    onChange={(event) =>
                      setAudience({ ...audience, interestTag: event.target.value })
                    }
                    className={inputClass}
                    placeholder="restock"
                  />
                </Field>
              </div>
              <div className="mt-2 space-y-2">
                <Toggle
                  checked={audience.purchased}
                  onChange={(checked) => setAudience({ ...audience, purchased: checked })}
                  label="Only customers who bought before"
                />
                <Toggle
                  checked={audience.skipRecentBroadcast}
                  onChange={(checked) =>
                    setAudience({ ...audience, skipRecentBroadcast: checked })
                  }
                  label="Skip anyone who got a broadcast in the last 7 days"
                />
              </div>
            </div>

            <div
              className={cn(
                "flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] leading-relaxed",
                windowCompliant
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-warning-soft text-warning",
              )}
            >
              {windowCompliant ? (
                <Check className="mt-0.5 size-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              )}
              <span>
                {windowCompliant
                  ? "Window check passed for this channel. Audience is filtered before dispatch."
                  : "23-hour window: this channel can only reach customers who messaged in the last 23 hours. Everyone else is skipped automatically."}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
              <button
                type="button"
                onClick={() => setTestSent(true)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold",
                  testSent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-border text-ink-soft hover:bg-surface",
                )}
              >
                {testSent ? <Check className="size-4" /> : <Send className="size-4" />}
                {testSent ? "Test sent to your phone" : "Send test to my phone"}
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Megaphone className="size-4" />
                Send broadcast
              </button>
              {!testSent ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Info className="size-3.5" />
                  Send stays locked until you test first.
                </span>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="History" description="Every send is auditable.">
          {broadcasts.length === 0 ? (
            <EmptyState icon={Megaphone} title="No broadcasts yet" text="Your first broadcast will appear here." />
          ) : (
            <div className="divide-y divide-border-subtle">
              {broadcasts.map((item) => (
                <div key={item.id} className="py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold">{item.name}</p>
                    <Pill tone={item.status === "sent" ? "success" : "neutral"}>
                      {item.status}
                    </Pill>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ChannelIcon channel={item.channel} className="size-3" />
                      {item.channel}
                    </span>
                    <span>{broadcastFormatLabels[item.format]}</span>
                    <span>{item.recipients} recipients</span>
                    {item.sentAt ? <span>{item.sentAt}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </ModuleShell>
  );
}
