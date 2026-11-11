"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  ModuleTabs,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import {
  initialComments,
  initialModerationRules,
} from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type {
  CommentAction,
  CommentItem,
  CommentVerdict,
  ModerationRules,
} from "@/features/inbox/types";
import { useNowMs } from "@/features/inbox/use-now";
import { cn, timeAgo } from "@/lib/utils";

const verdictTone: Record<CommentVerdict, "neutral" | "info" | "warning" | "danger" | "success"> = {
  normal: "success",
  junk: "neutral",
  unsure: "warning",
  attack: "danger",
  complaint: "warning",
  "phone-lead": "info",
};

const verdictLabel: Record<CommentVerdict, string> = {
  normal: "Normal",
  junk: "Junk",
  unsure: "Unsure",
  attack: "Attack",
  complaint: "Complaint",
  "phone-lead": "Phone lead",
};

const actionLabel: Record<CommentAction, string> = {
  none: "Publish reply",
  delete: "Delete comment",
  hide: "Hide comment",
  "hide-notify": "Hide + notify owner",
  "hide-never-engage": "Hide, never engage",
  human: "Send to human",
  "ai-policy": "AI replies with policy",
  "capture-lead": "Capture phone into leads",
};

type Tab = "queue" | "rules";

type CommentsProps = {
  logActivity: (action: string, subject: string) => void;
};

export function CommentsModule({ logActivity }: CommentsProps) {
  const [comments, setComments] = useStoredState<CommentItem[]>(
    MODULE_STORAGE_KEYS.comments,
    initialComments,
  );
  const [rules, setRules] = useStoredState<ModerationRules>(
    MODULE_STORAGE_KEYS.moderationRules,
    initialModerationRules,
  );
  const [tab, setTab] = useState<Tab>("queue");
  const now = useNowMs();
  const [filter, setFilter] = useState<CommentVerdict | "all">("all");
  const [blockWord, setBlockWord] = useState("");

  const pending = comments.filter((comment) => comment.status === "pending");
  const visible = comments
    .filter((comment) => filter === "all" || comment.verdict === filter)
    .sort((a, b) => b.atMs - a.atMs);

  function handle(comment: CommentItem, action: CommentAction) {
    setComments(
      comments.map((item) =>
        item.id === comment.id ? { ...item, status: "handled", suggestedAction: action } : item,
      ),
    );
    logActivity(
      `${actionLabel[action].toLowerCase()} on ${comment.platform} comment by ${comment.author}`,
      "Comments",
    );
  }

  function addBlockWord() {
    const word = blockWord.trim().toLowerCase();
    if (!word || rules.blocklist.length >= 50) return;
    setRules({ ...rules, blocklist: [...rules.blocklist, word] });
    setBlockWord("");
    logActivity(`blocked the word “${word}” in comments`, "Comments · Moderation");
  }

  return (
    <ModuleShell
      title="Comments"
      subtitle="Every public comment is classified before anyone answers — delete, hide, or capture the lead."
      walkthrough={{
        title: "Moderate without reading everything",
        steps: [
          "The classifier labels each comment junk, unsure, attack, complaint, or a phone lead.",
          "The suggested action follows your rules — delete junk, hide attacks, and never engage them.",
          "Approve or change the action per comment; every decision is written to the audit trail.",
          "Phone numbers in public comments are captured into Leads instead of being replied to publicly.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={String(pending.length)} icon={MessageCircle} tone="warning" />
        <StatCard
          label="Attack / junk"
          value={String(
            comments.filter((item) => item.verdict === "attack" || item.verdict === "junk").length,
          )}
          icon={ShieldCheck}
          tone="danger"
        />
        <StatCard
          label="Phone leads"
          value={String(comments.filter((item) => item.verdict === "phone-lead").length)}
          icon={Phone}
          tone="primary"
        />
        <StatCard
          label="Handled"
          value={String(comments.filter((item) => item.status === "handled").length)}
          icon={Check}
          tone="success"
        />
      </div>

      <ModuleTabs
        tabs={[
          { id: "queue", label: "Moderation queue", count: pending.length },
          { id: "rules", label: "Rules" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "queue" ? (
        <SectionCard
          title="All comments"
          description="Newest first — the suggested action is pre-selected."
          action={
            <label className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="sr-only">Filter by verdict</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as CommentVerdict | "all")}
                className="bg-transparent text-xs font-semibold text-ink-soft outline-none"
              >
                <option value="all">All verdicts</option>
                <option value="normal">Normal</option>
                <option value="junk">Junk</option>
                <option value="unsure">Unsure</option>
                <option value="attack">Attack</option>
                <option value="complaint">Complaint</option>
                <option value="phone-lead">Phone lead</option>
              </select>
            </label>
          }
        >
          {visible.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No comments"
              text="Comments from Instagram, Facebook, and Discord appear here."
            />
          ) : (
            <div className="divide-y divide-border-subtle">
              {visible.map((comment) => (
                <article key={comment.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ChannelIcon
                      channel={
                        comment.platform === "discord"
                          ? "discord"
                          : comment.platform === "facebook"
                            ? "messenger"
                            : "instagram"
                      }
                      className="size-4"
                    />
                    <span className="text-[13px] font-semibold">{comment.author}</span>
                    <Pill tone={verdictTone[comment.verdict]}>{verdictLabel[comment.verdict]}</Pill>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(comment.atMs)}</span>
                    <span className="text-[11px] text-muted-foreground">· {comment.postContext}</span>
                  </div>
                  <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-[13px]">{comment.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {comment.status === "handled" ? (
                      <Pill tone="success">
                        <Check className="size-3" />
                        {actionLabel[comment.suggestedAction]}
                      </Pill>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handle(comment, comment.suggestedAction)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary/90"
                        >
                          <Check className="size-3.5" />
                          {actionLabel[comment.suggestedAction]}
                        </button>
                        <button
                          type="button"
                          onClick={() => handle(comment, "human")}
                          className="h-8 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                        >
                          Send to human
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setComments(
                              comments.map((item) =>
                                item.id === comment.id ? { ...item, status: "handled" } : item,
                              ),
                            )
                          }
                          aria-label="Dismiss comment"
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Default actions" description="What happens without asking you.">
            <div className="space-y-3">
              <Field label="Junk comments">
                <select
                  value={rules.junk}
                  onChange={(event) =>
                    setRules({ ...rules, junk: event.target.value as ModerationRules["junk"] })
                  }
                  className={inputClass}
                >
                  <option value="delete">Delete</option>
                  <option value="hide">Hide</option>
                </select>
              </Field>
              <Field label="Unsure comments">
                <select
                  value={rules.unsure}
                  onChange={(event) =>
                    setRules({
                      ...rules,
                      unsure: event.target.value as ModerationRules["unsure"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="hide-notify">Hide + notify owner</option>
                  <option value="hide">Hide silently</option>
                </select>
              </Field>
              <Field label="Attacks">
                <select
                  value={rules.attack}
                  onChange={(event) =>
                    setRules({
                      ...rules,
                      attack: event.target.value as ModerationRules["attack"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="hide-never-engage">Hide, never engage</option>
                  <option value="delete">Delete</option>
                </select>
              </Field>
              <Field label="Complaints">
                <select
                  value={rules.complaint}
                  onChange={(event) =>
                    setRules({
                      ...rules,
                      complaint: event.target.value as ModerationRules["complaint"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="human">Always send to a human</option>
                  <option value="ai-policy">AI replies with policy</option>
                </select>
              </Field>
              <Toggle
                checked={rules.phoneGuard}
                onChange={(checked) => setRules({ ...rules, phoneGuard: checked })}
                label="Capture phone numbers instead of replying publicly"
              />
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard
              title="Blocklist"
              description={`${rules.blocklist.length} / 50 words — matched as whole words, case-insensitive.`}
            >
              <div className="flex gap-2 pb-3">
                <label className="flex h-9 min-w-0 flex-1 items-center rounded-lg border border-border px-2.5">
                  <span className="sr-only">Add blocked word</span>
                  <input
                    value={blockWord}
                    onChange={(event) => setBlockWord(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addBlockWord();
                      }
                    }}
                    placeholder="Add a word"
                    className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <button
                  type="button"
                  onClick={addBlockWord}
                  disabled={!blockWord.trim() || rules.blocklist.length >= 50}
                  className="h-9 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  Block
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rules.blocklist.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold"
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() =>
                        setRules({
                          ...rules,
                          blocklist: rules.blocklist.filter((item) => item !== word),
                        })
                      }
                      aria-label={`Unblock ${word}`}
                      className="rounded-full text-muted-foreground hover:text-red-600"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {rules.blocklist.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No blocked words yet.</p>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard title="Blocked people" description="Their comments are hidden, never deleted.">
              <div className="divide-y divide-border-subtle">
                {rules.blockedPeople.map((person) => (
                  <div key={person} className="flex items-center gap-2 py-2">
                    <span className="min-w-0 flex-1 truncate text-[13px]">{person}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setRules({
                          ...rules,
                          blockedPeople: rules.blockedPeople.filter((item) => item !== person),
                        })
                      }
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                    >
                      <Trash2 className="size-3.5" />
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div
              className={cn(
                "flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-[11px] leading-relaxed text-muted-foreground",
              )}
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
              Hiding keeps the comment recoverable and invisible to the public. Deleting is
              permanent — the rules above are the only place deletion can happen.
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Oldest pending comment
        {now !== null && pending.length > 0
          ? ` has waited ${Math.round(
              (now - Math.min(...pending.map((item) => item.atMs))) / 60_000,
            )}m.`
          : " queue is empty."}
      </p>
    </ModuleShell>
  );
}
