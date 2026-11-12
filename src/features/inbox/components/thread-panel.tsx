"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Clock,
  Inbox,
  PanelRight,
  Pin,
  Sparkles,
  Undo2,
  UserCheck,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { ChannelDot } from "@/features/inbox/components/channel-dot";
import { Composer } from "@/features/inbox/components/composer";
import { MessageCard } from "@/features/inbox/components/message-card";
import { ModeBadge } from "@/features/inbox/components/module-ui";
import { handoffReasonLabels } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
import { useNowMs } from "@/features/inbox/use-now";
import type {
  Attachment,
  Channel,
  ConversationMode,
  HandoffReason,
  Message,
  Person,
  QuotedMessage,
  SavedReply,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ThreadPanelProps = {
  title: string;
  subtitle: string;
  person: Person | null;
  channel: Channel | null;
  messages: Message[];
  suggestions: string[];
  savedReplies?: SavedReply[];
  banner: { title: string; text: string } | null;
  placeholder: string;
  mode?: ConversationMode;
  handoffReason?: HandoffReason;
  revertAtMs?: number;
  onDismissBanner: () => void;
  onViewBanner: () => void;
  onToggleReaction: (messageId: string, emoji: string, replyId?: string) => void;
  onSend: (data: {
    body: string;
    attachment?: Attachment;
    replyTo?: QuotedMessage;
    tags?: string[];
    translation?: string;
  }) => void;
  onOpenChannels: () => void;
  onOpenUserDetails?: () => void;
  onBack: () => void;
  onHandoff?: (reason: HandoffReason) => void;
  onClaim?: () => void;
  onReturnToAi?: () => void;
  onTakeover?: () => void;
  onOpenCopilot?: () => void;
  /** Text pushed into the composer by the copilot (nonce triggers re-insert). */
  insertion?: { text: string; nonce: number };
};

const handoffReasons: HandoffReason[] = [
  "complaint",
  "refund",
  "special-request",
  "asked-for-human",
  "low-confidence",
];

export function ThreadPanel({
  title,
  subtitle,
  person,
  channel,
  messages,
  suggestions,
  savedReplies = [],
  banner,
  placeholder,
  mode = "ai",
  handoffReason,
  revertAtMs,
  onDismissBanner,
  onViewBanner,
  onToggleReaction,
  onSend,
  onOpenChannels,
  onOpenUserDetails,
  onBack,
  onHandoff,
  onClaim,
  onReturnToAi,
  onTakeover,
  onOpenCopilot,
  insertion,
}: ThreadPanelProps) {
  const { t } = useI18n();
  const [pinned, setPinned] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [replyingTo, setReplyingTo] = useState<QuotedMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [handoffMenuOpen, setHandoffMenuOpen] = useState(false);
  const now = useNowMs();

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, title]);

  // Render-phase sync: copilot pushes text into the composer without an effect.
  const [lastInsertionNonce, setLastInsertionNonce] = useState<number | undefined>();
  if (insertion && insertion.nonce !== lastInsertionNonce) {
    setLastInsertionNonce(insertion.nonce);
    setDraft(insertion.text);
  }

  const revertInSec =
    revertAtMs && now !== null ? Math.max(0, Math.round((revertAtMs - now) / 1000)) : 0;
  const revertLabel =
    revertInSec >= 60
      ? `${Math.floor(revertInSec / 60)}m ${String(revertInSec % 60).padStart(2, "0")}s`
      : `${revertInSec}s`;

  function handleSend() {
    const body = draft.trim();
    if (!body && !attachment) return;

    // "." is the operator takeover shortcut from the AiPraktor inbox.
    if (body === "." && person && mode !== "human" && onTakeover) {
      onTakeover();
      setDraft("");
      return;
    }

    let translation: string | undefined = undefined;
    if (targetLanguage) {
      if (targetLanguage === "es") translation = "Traducido al español";
      else if (targetLanguage === "fr") translation = "Traduit en français";
      else if (targetLanguage === "bn") translation = "অনূদিত বার্তা";
      else if (targetLanguage === "de") translation = "Ins Deutsche übersetzt";
      else if (targetLanguage === "ja") translation = "日本語に翻訳されました";
      else translation = "Translated to English";
    }

    onSend({
      body: body || "Shared a file",
      attachment: attachment ?? undefined,
      replyTo: replyingTo ?? undefined,
      tags: tags.length > 0 ? tags : undefined,
      translation,
    });

    setDraft("");
    setAttachment(null);
    setReplyingTo(null);
    setTags([]);
    setTargetLanguage(null);
    inputRef.current?.focus();
  }

  function handleReply(replyData: { id: string; authorName: string; body: string }) {
    setReplyingTo(replyData);
    inputRef.current?.focus();
  }

  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-background">
      <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border px-4 md:px-6">
        <button
          type="button"
          aria-label={t("Back to conversations")}
          title={t("Back to conversations")}
          onClick={onBack}
          className="-ml-1 flex size-9 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center">
        {person ? (
          <button
            type="button"
            onClick={onOpenUserDetails}
            title={t("Click to view customer details")}
            className="group flex min-w-0 items-center gap-2.5 text-left transition-opacity hover:opacity-80"
          >
            <Avatar
              initials={person.initials}
              background={person.avatar.background}
              color={person.avatar.color}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                  {title}
                </h1>
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary">
                  {t("View Info")}
                </span>
              </div>
              <p className="truncate text-[13px] text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </button>
        ) : channel ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <ChannelDot channel={channel.id} color={channel.color} className="size-7 rounded-lg" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">{title}</h1>
              <p className="truncate text-[13px] text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              initials="#"
              background="#FDE7D3"
              color="#8A3B0B"
              size="sm"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">{title}</h1>
              <p className="truncate text-[13px] text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
        )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onOpenCopilot ? (
            <button
              type="button"
              aria-label={t("Open AI copilot")}
              title={t("Open AI copilot")}
              onClick={onOpenCopilot}
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Sparkles className="size-5" strokeWidth={2} />
            </button>
          ) : null}

          <button
            type="button"
            aria-label={pinned ? t("Unpin conversation") : t("Pin conversation")}
            title={pinned ? t("Unpin") : t("Pin")}
            aria-pressed={pinned}
            onClick={() => setPinned((value) => !value)}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              pinned
                ? "bg-primary-soft text-primary-strong"
                : "text-ink-soft hover:bg-surface",
            )}
          >
            <Pin
              className="size-5"
              strokeWidth={2}
              fill={pinned ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            aria-label={t("Open channels")}
            title={t("Channels")}
            onClick={onOpenChannels}
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:hidden"
          >
            <PanelRight className="size-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      {person ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface/50 px-4 py-1.5 md:px-6">
          <ModeBadge mode={mode} />
          {mode === "human" && handoffReason ? (
            <span className="text-[11px] font-semibold text-muted-foreground">
              {t(handoffReasonLabels[handoffReason])}
            </span>
          ) : null}
          {mode === "human" && revertAtMs && now !== null ? (
            <span
              title="Unanswered human conversations revert to the AI automatically"
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning"
            >
              <Clock className="size-3" />
              {t("Reverts to AI in {time}", { time: revertLabel })}
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            {mode === "ai" ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setHandoffMenuOpen((value) => !value)}
                  aria-expanded={handoffMenuOpen}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-warning-soft px-2 text-[11px] font-bold text-warning hover:bg-warning-soft/80"
                >
                  <UserCheck className="size-3.5" />
                  {t("Take over")}
                </button>
                {handoffMenuOpen ? (
                  <div className="absolute top-full right-0 z-30 mt-1 w-52 rounded-xl border border-border bg-background p-1.5 shadow-xl">
                    <p className="px-2 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      {t("Handoff reason")}
                    </p>
                    {handoffReasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          onHandoff?.(reason);
                          setHandoffMenuOpen(false);
                        }}
                        className="w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface"
                      >
                        {t(handoffReasonLabels[reason])}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                {!person.claimedBy ? (
                  <button
                    type="button"
                    onClick={onClaim}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-ink-soft hover:bg-surface"
                  >
                    <UserCheck className="size-3.5" />
                    {t("Claim")}
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t("Claimed by {name}", { name: person.claimedBy })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onReturnToAi}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-ink-soft hover:bg-surface"
                >
                  <Undo2 className="size-3.5" />
                  {t("Return to AI")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {banner ? (
        <div className="mx-4 mt-3 flex shrink-0 items-center gap-3 rounded-[10px] bg-banner py-2 pr-2 pl-4 text-white md:mx-6">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full bg-banner-dot"
          />
          <p className="min-w-0 flex-1 truncate text-sm">
            <b className="font-semibold">{banner.title}</b>
            <span aria-hidden="true"> — </span>
            {banner.text}
          </p>
          <button
            type="button"
            onClick={onViewBanner}
            className="h-9 shrink-0 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-banner transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("View")}
          </button>
          <button
            type="button"
            onClick={onDismissBanner}
            className="h-9 shrink-0 rounded-lg border border-banner-border px-3.5 text-[13px] text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("Ignore")}
          </button>
        </div>
      ) : null}

      <div className="scrollbar-thin flex-1 overflow-y-auto pt-1">
        <div className="flex items-center gap-3 px-6 py-2 text-xs font-semibold text-muted-foreground">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          {t("Today")}
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 pb-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
              <Inbox className="size-5" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold">{t("No messages here")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("Try another view or connect a channel to bring conversations in.")}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              highlightedMessageId={highlightedMessageId}
              onHoverReply={(targetId) => setHighlightedMessageId(targetId)}
              onToggleReaction={onToggleReaction}
              onReply={handleReply}
            />
          ))
        )}

        <div ref={endRef} />
      </div>

      {messages.length > 0 ? (
        <Composer
          value={draft}
          onChange={setDraft}
          placeholder={placeholder}
          suggestions={suggestions}
          savedReplies={savedReplies}
          inputRef={inputRef}
          attachment={attachment}
          onAttachmentChange={setAttachment}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          tags={tags}
          onTagsChange={setTags}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          onSubmit={handleSend}
        />
      ) : null}
    </main>
  );
}
