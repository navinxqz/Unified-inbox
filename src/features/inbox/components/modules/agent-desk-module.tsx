"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  History,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  ModuleShell,
  Pill,
  SectionCard,
} from "@/features/inbox/components/module-ui";
import { initialAgentDesk } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { AgentDeskState, AgentInstructions } from "@/features/inbox/types";

const blocks: Array<{
  key: keyof AgentInstructions;
  label: string;
  limit: number;
  hint: string;
  rows: number;
}> = [
  {
    key: "about",
    label: "About the business",
    limit: 2000,
    hint: "What you sell, where you operate, which channels you cover.",
    rows: 4,
  },
  {
    key: "delivery",
    label: "Delivery & shipping policy",
    limit: 1500,
    hint: "Timelines, charges, couriers — the AI quotes these verbatim.",
    rows: 4,
  },
  {
    key: "voice",
    label: "Voice & tone",
    limit: 800,
    hint: "How replies should sound, language rules, what to avoid.",
    rows: 3,
  },
  {
    key: "exactWords",
    label: "Exact words for sensitive answers",
    limit: 300,
    hint: "Refunds, delays, cancellations — literally what to say.",
    rows: 3,
  },
  {
    key: "custom",
    label: "Custom guardrails",
    limit: 1000,
    hint: "Hard limits: never invent prices, never promise discounts.",
    rows: 4,
  },
];

type TestMessage = { id: string; role: "customer" | "agent"; body: string };

type AgentDeskProps = {
  logActivity: (action: string, subject: string) => void;
};

export function AgentDeskModule({ logActivity }: AgentDeskProps) {
  const [state, setState] = useStoredState<AgentDeskState>(
    MODULE_STORAGE_KEYS.agentDesk,
    initialAgentDesk,
  );
  const [dirty, setDirty] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);

  function updateBlock(key: keyof AgentInstructions, value: string) {
    setState({ ...state, instructions: { ...state.instructions, [key]: value } });
    setDirty(true);
  }

  function publish() {
    setState({
      ...state,
      versions: state.versions + 1,
      publishedAt: "Just now",
      lastPublished: state.instructions,
    });
    setDirty(false);
    logActivity(`published Agent Desk instructions v${state.versions + 1}`, "Agent Desk");
  }

  function restoreLastPublished() {
    if (!state.lastPublished) return;
    setState({ ...state, instructions: state.lastPublished });
    setDirty(true);
    logActivity("restored the last published Agent Desk instructions", "Agent Desk");
  }

  function runTest() {
    const question = testInput.trim();
    if (!question) return;

    const lower = question.toLowerCase();
    const delivery = state.instructions.delivery;
    const refund = state.instructions.exactWords;

    let answer =
      "I don't have that in my instructions yet — let me hand this to a human so nothing is guessed.";
    if (lower.includes("delivery") || lower.includes("ship") || lower.includes("কুরিয়ার")) {
      answer = delivery;
    } else if (lower.includes("refund") || lower.includes("return")) {
      answer = refund;
    } else if (lower.includes("hour") || lower.includes("open")) {
      answer = "We're open Sat–Thu, 10:00–19:00, and closed on Friday.";
    } else if (lower.includes("price") || lower.includes("dam") || lower.includes("দাম")) {
      answer =
        "I only quote prices from the product catalog — tell me the item name and I'll pull the exact price and stock.";
    }

    setTestMessages((current) => [
      ...current,
      { id: `t-${Date.now()}-c`, role: "customer", body: question },
      { id: `t-${Date.now()}-a`, role: "agent", body: answer },
    ]);
    setTestInput("");
  }

  return (
    <ModuleShell
      title="Agent Desk"
      subtitle="Write the instructions behind every AI reply, test them as a customer, then publish."
      actions={
        <div className="flex items-center gap-2">
          {state.lastPublished ? (
            <button
              type="button"
              onClick={restoreLastPublished}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
            >
              <RotateCcw className="size-4" />
              Restore last publish
            </button>
          ) : null}
          <button
            type="button"
            onClick={publish}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
          >
            <Check className="size-4" />
            Publish v{state.versions + 1}
          </button>
        </div>
      }
      walkthrough={{
        title: "Tune the AI agent",
        steps: [
          "Fill the five instruction blocks — business facts, delivery, voice, exact words, guardrails.",
          "Test as a customer on the right: the reply comes from exactly what you wrote.",
          "Publish bumps the version and re-indexes knowledge — the audit trail records it.",
          "Restore the last publish if a change made replies worse.",
        ],
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={dirty ? "warning" : "success"}>
          <Bot className="size-3" />
          {dirty ? "Unpublished changes" : "Published"}
        </Pill>
        <Pill tone="neutral">
          <History className="size-3" />v{state.versions} · {state.publishedAt ?? "never"}
        </Pill>
        <Pill tone="info">
          <Sparkles className="size-3" />
          Hybrid retrieval on
        </Pill>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {blocks.map((block) => {
            const value = state.instructions[block.key];
            const overLimit = value.length > block.limit;
            return (
              <SectionCard key={block.key} title={block.label} description={block.hint}>
                <textarea
                  value={value}
                  onChange={(event) => updateBlock(block.key, event.target.value)}
                  rows={block.rows}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[13px] outline-none focus:border-primary"
                />
                <p
                  className={`mt-1 text-right text-[11px] ${overLimit ? "font-semibold text-red-600" : "text-muted-foreground"}`}
                >
                  {value.length} / {block.limit}
                </p>
              </SectionCard>
            );
          })}

          <SectionCard title="Guardrail principles" description="Always applied, even if you forget to write them.">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Never invent a price that is not in the catalog",
                "Never promise a discount that is not an active code",
                "Ask one clarifying question before guessing",
                "Hand off on complaints, refunds, and chargebacks",
                "Mirror the customer's language, never mix scripts",
                "Never share another customer's data",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-[13px] text-ink-soft">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  {rule}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard
          title="Test as a customer"
          description="Nothing is sent to a real customer."
        >
          <div className="flex h-[360px] flex-col">
            <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto rounded-lg bg-surface/60 p-2.5">
              {testMessages.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Ask something a customer would ask — delivery times, refunds, prices.
                </p>
              ) : (
                testMessages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "customer"
                        ? "ml-6 rounded-lg rounded-br-sm bg-primary px-2.5 py-1.5 text-[12px] text-white"
                        : "mr-6 rounded-lg rounded-bl-sm border border-border bg-background px-2.5 py-1.5 text-[12px] whitespace-pre-line"
                    }
                  >
                    {message.body}
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={testInput}
                onChange={(event) => setTestInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    runTest();
                  }
                }}
                placeholder="What are your delivery charges?"
                className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={runTest}
                disabled={!testInput.trim()}
                aria-label="Send test message"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </ModuleShell>
  );
}
