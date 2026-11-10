"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Languages,
  Paperclip,
  Reply as ReplyIcon,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import { Composer } from "@/features/inbox/components/composer";
import { authorById, channelById, selfAuthor } from "@/features/inbox/data";
import type {
  Attachment,
  Channel,
  ConversationStatus,
  Message,
  Person,
  QuotedMessage,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type StreamThreadProps = {
  person: Person | null;
  channel: Channel | null;
  messages: Message[];
  suggestions: string[];
  placeholder: string;
  onSend: (data: {
    body: string;
    attachment?: Attachment;
    replyTo?: QuotedMessage;
    tags?: string[];
    translation?: string;
  }) => void;
  onToggleReaction: (messageId: string, emoji: string, replyId?: string) => void;
  onUpdateStatus?: (status: ConversationStatus) => void;
  onBackMobile?: () => void;
};

export function StreamThread({
  person,
  channel,
  messages,
  suggestions,
  placeholder,
  onSend,
  onToggleReaction,
  onUpdateStatus,
  onBackMobile,
}: StreamThreadProps) {
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [replyingTo, setReplyingTo] = useState<QuotedMessage | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, person?.id]);

  function handleSendSubmit() {
    const text = draft.trim();
    if (!text && !attachment) return;

    let translation: string | undefined = undefined;
    if (targetLanguage) {
      if (targetLanguage === "es") translation = "Traducido al español";
      else if (targetLanguage === "fr") translation = "Traduit en français";
      else if (targetLanguage === "bn") translation = "অনূদিত বার্তা";
      else if (targetLanguage === "de") translation = "Ins Deutsche übersetzt";
      else if (targetLanguage === "ja") translation = "日本語に翻訳";
      else translation = "Translated to English";
    }

    onSend({
      body: text || "Shared attachment",
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
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-background">
      {/* Stream Header (Linear/Front Style: clean flush toolbar) */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackMobile ? (
            <button
              type="button"
              onClick={onBackMobile}
              className="mr-1 flex size-7 items-center justify-center rounded hover:bg-surface md:hidden"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : null}

          {person ? (
            <>
              <div
                className="flex size-6 shrink-0 items-center justify-center rounded text-white"
                style={{ backgroundColor: channelById[person.channel]?.color ?? "#4F46E5" }}
              >
                <ChannelIcon channel={person.channel} className="size-3 text-white" />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <span className="font-bold text-sm text-foreground truncate">
                  {person.name}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  via {channelById[person.channel]?.label}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                {channel ? `${channel.label} Stream` : "Unified Live Stream"}
              </span>
              <span className="text-xs text-muted-foreground">
                {channel ? `Filtered to ${channel.label}` : "All connected channels"}
              </span>
            </div>
          )}
        </div>

        {/* Quick Triage Actions */}
        {person ? (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => onUpdateStatus?.("resolved")}
              className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
            >
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Mark Resolved</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus?.("pending")}
              className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
            >
              <Clock className="size-3.5 text-amber-600" />
              <span>Snooze</span>
            </button>
          </div>
        ) : null}
      </header>

      {/* Message Stream (Linear/Front Style: Clean inline continuous list, zero card bubbles) */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3 divide-y divide-border/30 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground">
            <p>No messages in this conversation yet.</p>
          </div>
        ) : (
          messages.map((message) => {
            const author = authorById[message.authorId] ?? selfAuthor;
            const isTarget = highlightedMsgId === message.id;

            return (
              <div
                key={message.id}
                id={`msg-${message.id}`}
                className={cn(
                  "group relative flex items-start gap-3 pt-3.5 transition-colors",
                  isTarget && "bg-primary-soft/70 ring-1 ring-primary/40 rounded px-2 -mx-2",
                )}
              >
                <Avatar
                  initials={author.initials}
                  background={author.avatar.background}
                  color={author.avatar.color}
                  size="sm"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  {/* Sender meta */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      {author.name}
                    </span>
                    {message.channel ? (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ChannelIcon channel={message.channel} className="size-2.5" />
                        <span className="capitalize">{message.channel}</span>
                      </span>
                    ) : null}
                    <span className="text-[11px] text-muted-foreground">
                      {message.time}
                    </span>
                  </div>

                  {/* Quoted message reference (WhatsApp/Discord/Front style) */}
                  {message.replyTo ? (
                    <div
                      onMouseEnter={() => setHighlightedMsgId(message.replyTo?.id ?? null)}
                      onMouseLeave={() => setHighlightedMsgId(null)}
                      className="cursor-pointer border-l-2 border-primary bg-surface/80 px-2.5 py-1 text-xs text-ink-soft rounded hover:bg-primary-soft/50 transition-colors"
                    >
                      <span className="font-semibold text-primary">
                        {message.replyTo.authorName}:{" "}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {message.replyTo.body}
                      </span>
                    </div>
                  ) : null}

                  {/* Message body (Flush typography, no card frame) */}
                  <p className="text-xs text-ink-soft leading-relaxed select-text whitespace-pre-wrap">
                    {message.body}
                  </p>

                  {/* Translation */}
                  {message.translation ? (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground italic bg-surface/40 p-1.5 rounded">
                      <Languages className="size-3 shrink-0" />
                      <span>{message.translation}</span>
                    </p>
                  ) : null}

                  {/* Tags */}
                  {message.tags?.length ? (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {message.tags.map((tg) => (
                        <span
                          key={tg}
                          className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Attachment */}
                  {message.attachment ? (
                    <div className="inline-flex items-center gap-2 rounded border border-border bg-surface px-2.5 py-1 text-xs">
                      <Paperclip className="size-3 text-primary" />
                      <span className="font-medium">{message.attachment.name}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {message.attachment.size}
                      </span>
                    </div>
                  ) : null}

                  {/* Reactions */}
                  {message.reactions?.length ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {message.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          onClick={() => onToggleReaction(message.id, r.emoji)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                            r.reacted
                              ? "border-primary-border bg-primary-soft font-semibold text-primary"
                              : "border-border text-ink-soft hover:bg-surface",
                          )}
                        >
                          <span>{r.emoji}</span>
                          <span>{r.count}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Nested replies if any */}
                  {message.replies?.map((rep) => {
                    const repAuthor = authorById[rep.authorId] ?? selfAuthor;
                    return (
                      <div key={rep.id} className="mt-2.5 ml-3 border-l-2 border-border pl-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">{repAuthor.name}</span>
                          <span className="text-[11px] text-muted-foreground">{rep.time}</span>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed">{rep.body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Hover Action Toolbar */}
                <div className="absolute top-1 right-2 hidden group-hover:flex items-center gap-0.5 rounded border border-border bg-background p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => onToggleReaction(message.id, "👍")}
                    title="Thumbs up"
                    className="p-1 rounded text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleReaction(message.id, "❤️")}
                    title="Heart"
                    className="p-1 rounded text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    ❤️
                  </button>
                  <button
                    type="button"
                    title="Reply"
                    onClick={() =>
                      setReplyingTo({
                        id: message.id,
                        authorName: author.name,
                        body: message.body,
                      })
                    }
                    className="p-1 rounded text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    <ReplyIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Stream Composer */}
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
        onSubmit={handleSendSubmit}
      />
    </div>
  );
}
