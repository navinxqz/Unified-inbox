import {
  Languages,
  MoreHorizontal,
  Paperclip,
  Reply as ReplyIcon,
  SmilePlus,
  Tag,
} from "lucide-react";

import { Avatar } from "@/features/inbox/components/avatar";
import { authorById, channelById, selfAuthor } from "@/features/inbox/data";
import type { ChannelId, Message, Reaction } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";

function ChannelTag({ channel }: { channel: ChannelId }) {
  const source = channelById[channel];

  return (
    <span
      className="inline-flex h-5 items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
      style={{ backgroundColor: source.soft, color: source.softForeground }}
    >
      <ChannelIcon channel={channel} className="size-3" />
      {source.label}
    </span>
  );
}

const toolbarButtonStyles =
  "flex size-8 items-center justify-center rounded-lg text-[15px] text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

function ReactionPills({
  reactions,
  onToggle,
}: {
  reactions?: Reaction[];
  onToggle: (emoji: string) => void;
}) {
  if (!reactions?.length) {
    return null;
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          aria-pressed={reaction.reacted}
          aria-label={`${reaction.emoji} reaction, ${reaction.count}`}
          onClick={() => onToggle(reaction.emoji)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
            reaction.reacted
              ? "border-primary-border bg-primary-soft font-semibold text-primary-strong"
              : "border-border text-ink-soft hover:bg-surface",
          )}
        >
          <span aria-hidden="true">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}

      <button
        type="button"
        aria-label="Add reaction"
        title="Add reaction"
        onClick={() => onToggle("❤️")}
        className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-border hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      >
        <SmilePlus className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

type MessageCardProps = {
  message: Message;
  highlightedMessageId?: string | null;
  onHoverReply?: (messageId: string | null) => void;
  onToggleReaction: (messageId: string, emoji: string, replyId?: string) => void;
  onReply: (replyData: { id: string; authorName: string; body: string }) => void;
};

export function MessageCard({
  message,
  highlightedMessageId,
  onHoverReply,
  onToggleReaction,
  onReply,
}: MessageCardProps) {
  const author = authorById[message.authorId] ?? selfAuthor;
  const channel = message.channel ? channelById[message.channel] : undefined;
  const isTargeted = highlightedMessageId === message.id;

  return (
    <article
      id={`msg-${message.id}`}
      className={cn(
        "group relative flex gap-3.5 px-6 py-2.5 transition-all duration-200",
        isTargeted ? "bg-primary-soft/90 ring-2 ring-primary/40 rounded-xl" : "hover:bg-surface/70",
      )}
    >
      <Avatar
        initials={author.initials}
        background={author.avatar.background}
        color={author.avatar.color}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold">{author.name}</span>
          {channel ? <ChannelTag channel={channel.id} /> : null}
          <span className="text-xs text-muted-foreground">{message.time}</span>
        </div>

        {/* Quoted message reference (WhatsApp / Discord / Messenger style) */}
        {message.replyTo ? (
          <div
            onMouseEnter={() => onHoverReply?.(message.replyTo?.id ?? null)}
            onMouseLeave={() => onHoverReply?.(null)}
            className="my-1.5 flex max-w-lg cursor-pointer items-center gap-2 rounded-lg border-l-4 border-primary bg-primary-soft/50 px-3 py-1.5 text-xs text-ink-soft transition-colors hover:bg-primary-soft"
          >
            <ReplyIcon className="size-3 text-primary-strong shrink-0" />
            <div className="min-w-0 flex-1 truncate">
              <span className="font-semibold text-primary-strong">
                {message.replyTo.authorName}:{" "}
              </span>
              <span className="text-muted-foreground">{message.replyTo.body}</span>
            </div>
          </div>
        ) : null}

        <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">
          {message.body}
        </p>

        {message.translation ? (
          <p className="mt-1 flex items-start gap-1.5 text-[13px] leading-relaxed text-muted-foreground">
            <Languages
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0"
              strokeWidth={2}
            />
            <span>
              Translated: &ldquo;{message.translation}&rdquo;
            </span>
          </p>
        ) : null}

        {message.tags?.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-5 items-center rounded-md bg-warning-soft px-2 text-xs font-semibold text-warning"
              >
                # {tag}
              </span>
            ))}
          </div>
        ) : null}

        {message.attachment ? (
          <div className="mt-2 inline-flex items-center gap-2.5 rounded-[10px] border border-border bg-background px-3 py-2 text-[13px]">
            <Paperclip
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            <b className="font-semibold">{message.attachment.name}</b>
            <span className="text-muted-foreground">
              {message.attachment.size}
            </span>
          </div>
        ) : null}

        <ReactionPills
          reactions={message.reactions}
          onToggle={(emoji) => onToggleReaction(message.id, emoji)}
        />

        {message.replies?.length ? (
          <div className="mt-2 ml-2 space-y-3 border-l-2 border-thread pl-5">
            {message.replies.map((reply) => {
              const replyAuthor = authorById[reply.authorId] ?? selfAuthor;

              return (
                <div
                  key={reply.id}
                  id={`msg-${reply.id}`}
                  className="relative flex gap-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-3.5 -left-[22px] h-0.5 w-[18px] bg-thread"
                  />
                  <Avatar
                    initials={replyAuthor.initials}
                    background={replyAuthor.avatar.background}
                    color={replyAuthor.avatar.color}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {replyAuthor.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {reply.time}
                      </span>
                    </div>

                    {/* Quoted preview on reply */}
                    {reply.replyTo ? (
                      <div
                        onMouseEnter={() => onHoverReply?.(reply.replyTo?.id ?? null)}
                        onMouseLeave={() => onHoverReply?.(null)}
                        className="my-1 flex max-w-md cursor-pointer items-center gap-1.5 rounded border-l-2 border-primary bg-primary-soft/40 px-2 py-1 text-xs text-ink-soft hover:bg-primary-soft"
                      >
                        <span className="font-semibold text-primary-strong">
                          {reply.replyTo.authorName}:
                        </span>
                        <span className="truncate text-muted-foreground">
                          {reply.replyTo.body}
                        </span>
                      </div>
                    ) : null}

                    <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">
                      {reply.body}
                    </p>
                    <ReactionPills
                      reactions={reply.reactions}
                      onToggle={(emoji) =>
                        onToggleReaction(message.id, emoji, reply.id)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute -top-4 right-6 z-10 flex items-center gap-0.5 rounded-[10px] border border-border bg-background p-0.5 opacity-0 shadow-[0_2px_8px_rgba(20,23,31,0.12)] transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          type="button"
          aria-label={`React to ${author.name}`}
          title="React"
          onClick={() => onToggleReaction(message.id, "👍")}
          className={toolbarButtonStyles}
        >
          <SmilePlus className="size-[18px]" strokeWidth={2} />
        </button>
        {["👍", "❤️", "✅"].map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React with ${emoji}`}
            onClick={() => onToggleReaction(message.id, emoji)}
            className={toolbarButtonStyles}
          >
            {emoji}
          </button>
        ))}

        <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />

        <button
          type="button"
          aria-label={`Reply to ${author.name}`}
          title="Reply"
          onClick={() =>
            onReply({
              id: message.id,
              authorName: author.name,
              body: message.body,
            })
          }
          className={toolbarButtonStyles}
        >
          <ReplyIcon className="size-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Add tag"
          title="Tag"
          className={toolbarButtonStyles}
        >
          <Tag className="size-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="More actions"
          title="More"
          className={toolbarButtonStyles}
        >
          <MoreHorizontal className="size-[18px]" strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}
