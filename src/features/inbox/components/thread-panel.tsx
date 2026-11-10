"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Inbox,
  PanelRight,
  Pin,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { ChannelDot } from "@/features/inbox/components/channel-dot";
import { Composer } from "@/features/inbox/components/composer";
import { MessageCard } from "@/features/inbox/components/message-card";
import type {
  Attachment,
  Channel,
  Message,
  Person,
  QuotedMessage,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type ThreadPanelProps = {
  title: string;
  subtitle: string;
  person: Person | null;
  channel: Channel | null;
  messages: Message[];
  suggestions: string[];
  banner: { title: string; text: string } | null;
  placeholder: string;
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
};

export function ThreadPanel({
  title,
  subtitle,
  person,
  channel,
  messages,
  suggestions,
  banner,
  placeholder,
  onDismissBanner,
  onViewBanner,
  onToggleReaction,
  onSend,
  onOpenChannels,
  onOpenUserDetails,
  onBack,
}: ThreadPanelProps) {
  const [pinned, setPinned] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [replyingTo, setReplyingTo] = useState<QuotedMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, title]);

  function handleSend() {
    const body = draft.trim();
    if (!body && !attachment) return;

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
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
        <button
          type="button"
          aria-label="Back to conversations"
          title="Back to conversations"
          onClick={onBack}
          className="-ml-1 flex size-9 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>

        {person ? (
          <button
            type="button"
            onClick={onOpenUserDetails}
            title="Click to view customer details"
            className="flex items-center gap-2.5 text-left group hover:opacity-80 transition-opacity"
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
                  View Info
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

        <button
          type="button"
          aria-label={pinned ? "Unpin conversation" : "Pin conversation"}
          title={pinned ? "Unpin" : "Pin"}
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
          aria-label="Open channels"
          title="Channels"
          onClick={onOpenChannels}
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:hidden"
        >
          <PanelRight className="size-5" strokeWidth={2} />
        </button>
      </header>

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
            View
          </button>
          <button
            type="button"
            onClick={onDismissBanner}
            className="h-9 shrink-0 rounded-lg border border-banner-border px-3.5 text-[13px] text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ignore
          </button>
        </div>
      ) : null}

      <div className="scrollbar-thin flex-1 overflow-y-auto pt-1">
        <div className="flex items-center gap-3 px-6 py-2 text-xs font-semibold text-muted-foreground">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          Today
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 pb-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
              <Inbox className="size-5" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold">No messages here</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Try another view or connect a channel to bring conversations in.
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
