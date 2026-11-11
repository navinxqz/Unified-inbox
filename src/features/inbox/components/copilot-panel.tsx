"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Lightbulb,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";

import { ModeBadge, Pill, SectionCard } from "@/features/inbox/components/module-ui";
import { channelById } from "@/features/inbox/data";
import type { Message, Person, SavedReply } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type CopilotPanelProps = {
  person: Person | null;
  messages: Message[];
  savedReplies: SavedReply[];
  onClose: () => void;
  onInsert: (text: string) => void;
  onCreateLead: () => void;
  onCreateOrder: () => void;
};

const cannedSuggestions: Array<{ label: string; intent: string; body: string }> = [
  {
    label: "Stock + price",
    intent: "Product question",
    body: "It's in stock right now. Which size would you like — I'll reserve it and share the exact price with delivery.",
  },
  {
    label: "Delivery timeline",
    intent: "Delivery",
    body: "Inside Dhaka it arrives in 1–2 days (৳60), outside Dhaka 3–5 days (৳120). Free delivery over ৳2,500.",
  },
  {
    label: "Payment options",
    intent: "Payment",
    body: "You can pay cash on delivery, or with bKash, Nagad, or card. Which one is easiest for you?",
  },
  {
    label: "Order status",
    intent: "Order tracking",
    body: "I've checked with the courier — your parcel is on the way and should reach you tomorrow. I'll flag it if the rider runs late.",
  },
];

function detectIntent(person: Person | null, messages: Message[]): string {
  const lastCustomer = [...messages]
    .reverse()
    .find((message) => (message.authorType ?? "customer") === "customer");
  const text = `${lastCustomer?.body ?? ""} ${person?.preview ?? ""}`.toLowerCase();

  if (/stock|price|দাম|size|কালার|color/.test(text)) return "Product question";
  if (/deliver|ship|কুরিয়ার|কবে|when/.test(text)) return "Delivery";
  if (/pay|bkash|nagad|card|টাকা/.test(text)) return "Payment";
  if (/order|parcel|track|অর্ডার/.test(text)) return "Order tracking";
  if (/refund|return|broken|নষ্ট/.test(text)) return "After-sales";
  return "General enquiry";
}

export function CopilotPanel({
  person,
  messages,
  savedReplies,
  onClose,
  onInsert,
  onCreateLead,
  onCreateOrder,
}: CopilotPanelProps) {
  const [usedSuggestion, setUsedSuggestion] = useState<string | null>(null);

  const intent = useMemo(() => detectIntent(person, messages), [person, messages]);
  const customerMessages = messages.filter(
    (message) => (message.authorType ?? "customer") === "customer",
  );
  const lastCustomer = customerMessages[customerMessages.length - 1];

  const savedSuggestions = savedReplies
    .filter((reply) => !reply.archived && reply.autoTrigger)
    .slice(0, 2)
    .map((reply) => ({
      label: reply.name,
      intent: `Saved · /${reply.shortcut}`,
      body: reply.body,
    }));

  const suggestions = [...savedSuggestions, ...cannedSuggestions].slice(0, 4);

  return (
    <aside
      aria-label="AI copilot"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-border bg-surface-alt"
    >
      <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">AI copilot</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {person ? `${person.name} · ${channelById[person.channel]?.label ?? "Chat"}` : "No conversation selected"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close copilot"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-border/70 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {person ? (
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <ModeBadge mode={person.mode ?? "ai"} />
            <Pill tone="info">{intent}</Pill>
            {person.priority ? <Pill tone="warning">Priority</Pill> : null}
          </div>

          <SectionCard title="Summary">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              {lastCustomer
                ? `${person.name} last asked: “${lastCustomer.body}”. ${
                    customerMessages.length
                  } customer message${customerMessages.length === 1 ? "" : "s"} in this thread.`
                : "No customer message in this thread yet — the AI is waiting for the first inbound."}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Bot className="size-3.5" />
              Grounded in Agent Desk instructions, Knowledge, and the product catalog.
            </p>
          </SectionCard>

          <SectionCard title="Suggested replies" description="Tap to drop into the composer.">
            <div className="space-y-1.5">
              {suggestions.map((suggestion) => {
                const used = usedSuggestion === suggestion.label;
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => {
                      onInsert(suggestion.body);
                      setUsedSuggestion(suggestion.label);
                    }}
                    className={cn(
                      "w-full rounded-lg border p-2 text-left transition-colors",
                      used
                        ? "border-primary bg-primary-soft/60"
                        : "border-border bg-background hover:bg-surface",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Wand2 className="size-3.5 shrink-0 text-primary" />
                      <span className="text-[12px] font-semibold">{suggestion.label}</span>
                      <span className="ml-auto truncate text-[10px] text-muted-foreground">
                        {suggestion.intent}
                      </span>
                    </span>
                    <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {suggestion.body}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Next actions" description="Run without leaving the thread.">
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={onCreateLead}
                className="inline-flex h-8 w-full items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[12px] font-semibold text-ink-soft hover:bg-surface"
              >
                <Target className="size-3.5" />
                Capture as lead
              </button>
              <button
                type="button"
                onClick={onCreateOrder}
                className="inline-flex h-8 w-full items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[12px] font-semibold text-ink-soft hover:bg-surface"
              >
                <Lightbulb className="size-3.5" />
                Draft an order
              </button>
            </div>
          </SectionCard>

          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
            The copilot never sends on its own — every suggestion waits for a human
            keystroke.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface text-muted-foreground">
            <Sparkles className="size-5" />
          </span>
          <p className="text-sm font-semibold">Pick a conversation</p>
          <p className="text-xs text-muted-foreground">
            The copilot summarises the thread and drafts replies from your saved
            knowledge.
          </p>
        </div>
      )}
    </aside>
  );
}
