"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  History,
  Plus,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import {
  ModuleShell,
  Pill,
  SectionCard,
} from "@/features/inbox/components/module-ui";
import {
  InstructionUploadDialog,
  type ParsedInstructions,
} from "@/features/inbox/components/agent-instructions-upload";
import { initialAgentDesk } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
import {
  MODULE_STORAGE_KEYS,
  parseAgentDesk,
  useStoredState,
} from "@/features/inbox/storage";
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
    key: "catalog",
    label: "Estimated Product Catalog",
    limit: 2000,
    hint: "Rough catalog the AI may quote — name, SKU, price, stock, one line each. Empty saves as NULL so the AI never guesses a price.",
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
  const { t } = useI18n();
  const [state, setState] = useStoredState<AgentDeskState>(
    MODULE_STORAGE_KEYS.agentDesk,
    initialAgentDesk,
    parseAgentDesk,
  );
  const [dirty, setDirty] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  function updateBlock(key: keyof AgentInstructions, value: string) {
    setState({ ...state, instructions: { ...state.instructions, [key]: value } });
    setDirty(true);
  }

  function updatePrinciple(index: number, value: string) {
    const principles = state.principles.map((rule, position) =>
      position === index ? value : rule,
    );
    setState({ ...state, principles });
    setDirty(true);
  }

  function addPrinciple() {
    setState({ ...state, principles: [...state.principles, ""] });
    setDirty(true);
  }

  function removePrinciple(index: number) {
    setState({
      ...state,
      principles: state.principles.filter((_, position) => position !== index),
    });
    setDirty(true);
  }

  function applyUpload(result: ParsedInstructions, fileName: string) {
    const instructions: AgentInstructions = {
      ...state.instructions,
      ...result.instructions,
    };
    if (!instructions.catalog.trim()) instructions.catalog = "NULL";
    setState({
      ...state,
      instructions,
      principles:
        result.principles.length > 0 ? result.principles : state.principles,
    });
    setDirty(true);
    setUploadOpen(false);
    logActivity(`imported Agent Desk instructions from ${fileName}`, "Agent Desk");
  }

  function publish() {
    const instructions: AgentInstructions = {
      ...state.instructions,
      catalog: state.instructions.catalog.trim() || "NULL",
    };
    const principles = state.principles.map((rule) => rule.trim()).filter(Boolean);
    setState({
      ...state,
      instructions,
      principles,
      versions: state.versions + 1,
      publishedAt: "Just now",
      lastPublished: instructions,
      lastPublishedPrinciples: principles,
    });
    setDirty(false);
    logActivity(`published Agent Desk instructions v${state.versions + 1}`, "Agent Desk");
  }

  function restoreLastPublished() {
    if (!state.lastPublished) return;
    setState({
      ...state,
      instructions: state.lastPublished,
      principles: state.lastPublishedPrinciples ?? state.principles,
    });
    setDirty(true);
    logActivity("restored the last published Agent Desk instructions", "Agent Desk");
  }

  function runTest() {
    const question = testInput.trim();
    if (!question) return;

    const lower = question.toLowerCase();
    const delivery = state.instructions.delivery;
    const refund = state.instructions.exactWords;
    const catalog = state.instructions.catalog.trim();

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
        catalog && catalog.toUpperCase() !== "NULL"
          ? `Here is what I have in the catalog:\n${catalog}`
          : "I don't have a product catalog on file, so I won't guess a price — let me hand this to a human.";
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
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">{t("Upload instructions")}</span>
          </button>
          {state.lastPublished ? (
            <button
              type="button"
              onClick={restoreLastPublished}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface"
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">{t("Restore last publish")}</span>
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
          "Fill the six instruction blocks — business facts, product catalog, delivery, voice, exact words, guardrails.",
          "No catalog? Leave it blank — it saves as NULL so the AI never guesses a price.",
          "Upload a .md or .pdf to fill every block at once, following the guideline.",
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
                  onBlur={
                    block.key === "catalog"
                      ? () => {
                          if (!state.instructions.catalog.trim()) {
                            updateBlock("catalog", "NULL");
                          }
                        }
                      : undefined
                  }
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

          <SectionCard
            title="Guardrail principles"
            description="Always applied, even if you forget to write them. Click a rule to edit it."
            action={
              <button
                type="button"
                onClick={addPrinciple}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
              >
                <Plus className="size-3.5" />
                {t("Add principle")}
              </button>
            }
          >
            {state.principles.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                {t("No custom principles yet — add one to constrain the AI.")}
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {state.principles.map((rule, index) => (
                  <li key={index} className="group flex items-start gap-2">
                    <ShieldAlert className="mt-1 size-3.5 shrink-0 text-warning" />
                    <input
                      value={rule}
                      onChange={(event) => updatePrinciple(index, event.target.value)}
                      aria-label={t("Guardrail principle {n}", { n: index + 1 })}
                      placeholder={t("Write a principle or constraint")}
                      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13px] text-ink-soft outline-none hover:border-border focus:border-primary focus:bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => removePrinciple(index)}
                      aria-label={t("Remove principle {n}", { n: index + 1 })}
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface hover:text-foreground focus-visible:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-4 lg:z-20 lg:self-start">
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
      </div>

      {uploadOpen ? (
        <InstructionUploadDialog
          onApply={applyUpload}
          onClose={() => setUploadOpen(false)}
        />
      ) : null}
    </ModuleShell>
  );
}
