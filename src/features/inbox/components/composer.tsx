"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  Bot,
  Check,
  Languages,
  Paperclip,
  Reply as ReplyIcon,
  SendHorizontal,
  Smile,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import type { Attachment, QuotedMessage, SavedReply } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const COMMON_EMOJIS = [
  "🙂", "😄", "👍", "❤️", "🔥", "🎉", "🙌", "🙏",
  "👋", "✅", "🚀", "💡", "👀", "✨", "💯", "🤝",
  "👏", "😎", "😅", "👌", "⭐", "💼", "📩", "⏰",
];

const AVAILABLE_TAGS = [
  "urgent", "invoice", "follow-up", "contract", "support",
  "client", "proposal", "bug", "feature", "delivered",
];

const TARGET_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ja", label: "Japanese (日本語)" },
];

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  attachment: Attachment | null;
  onAttachmentChange: (attachment: Attachment | null) => void;
  replyingTo: QuotedMessage | null;
  onCancelReply: () => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  targetLanguage: string | null;
  onTargetLanguageChange: (lang: string | null) => void;
  onSubmit: () => void;
  /** Saved replies surfaced when the draft starts with `/`. */
  savedReplies?: SavedReply[];
};

const toolButtonStyles =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

export function Composer({
  value,
  onChange,
  placeholder,
  suggestions,
  inputRef,
  attachment,
  onAttachmentChange,
  replyingTo,
  onCancelReply,
  tags,
  onTagsChange,
  targetLanguage,
  onTargetLanguageChange,
  onSubmit,
  savedReplies = [],
}: ComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showTranslatePicker, setShowTranslatePicker] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const slashQuery =
    value.startsWith("/") && !value.includes(" ") && !value.includes("\n")
      ? value.slice(1).toLowerCase()
      : null;
  const slashMatches =
    slashQuery === null
      ? []
      : savedReplies
          .filter(
            (reply) =>
              !reply.archived &&
              (reply.shortcut.toLowerCase().includes(slashQuery) ||
                reply.name.toLowerCase().includes(slashQuery)),
          )
          .slice(0, 6);

  const emojiContainerRef = useRef<HTMLDivElement>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const translateContainerRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        tagContainerRef.current &&
        !tagContainerRef.current.contains(target)
      ) {
        setShowTagPicker(false);
      }
      if (
        translateContainerRef.current &&
        !translateContainerRef.current.contains(target)
      ) {
        setShowTranslatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSend = value.trim().length > 0 || attachment !== null;

  function handleSelectEmoji(emoji: string) {
    onChange(`${value}${value && !value.endsWith(" ") ? " " : ""}${emoji} `);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }

  function handleToggleTag(tag: string) {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  }

  function handleAddCustomTag() {
    const cleaned = customTagInput.trim().replace(/^#/, "");
    if (cleaned && !tags.includes(cleaned)) {
      onTagsChange([...tags, cleaned]);
      setCustomTagInput("");
    }
  }

  return (
    <div className="shrink-0 px-6 pt-1 pb-5">
      {/* Suggestions */}
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-0.5">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          Suggested
        </span>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              onChange(suggestion);
              inputRef.current?.focus();
            }}
            className="h-[32px] shrink-0 rounded-full border border-primary-border bg-background px-3 text-[13px] font-medium whitespace-nowrap text-primary-strong transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="relative rounded-xl border border-border bg-surface p-1 shadow-xs"
      >
        {slashQuery !== null ? (
          <div className="absolute bottom-full left-0 z-30 mb-1.5 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              Saved replies
              <kbd className="ml-auto rounded border border-border px-1 text-[10px]">
                /{slashQuery}
              </kbd>
            </div>
            {slashMatches.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">
                No saved reply matches. Manage them in Saved replies.
              </p>
            ) : (
              slashMatches.map((reply) => (
                <button
                  key={reply.id}
                  type="button"
                  onClick={() => {
                    onChange(reply.body);
                    inputRef.current?.focus();
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-surface"
                >
                  <span className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-strong">
                    /{reply.shortcut}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {reply.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {reply.body}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
        {/* Modern Replying-To Banner (WhatsApp / Discord / Messenger style) */}
        {replyingTo ? (
          <div className="mx-1 mt-1 mb-1 flex items-center justify-between gap-2 rounded-lg border-l-4 border-primary bg-primary-soft/80 px-3 py-1.5 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <ReplyIcon className="size-3.5 text-primary shrink-0" />
              <div className="min-w-0 truncate">
                <span className="font-semibold text-primary-strong">
                  Replying to {replyingTo.authorName}:{" "}
                </span>
                <span className="text-muted-foreground">{replyingTo.body}</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={onCancelReply}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-white/80 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* Selected Tags Chips */}
        {tags.length > 0 ? (
          <div className="mx-2 mt-1.5 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className="hover:text-black"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {/* Selected Target Language Badge */}
        {targetLanguage ? (
          <div className="mx-2 mt-1.5 flex items-center gap-1.5 text-xs text-primary font-medium">
            <Languages className="size-3" />
            <span>
              Auto-translate to:{" "}
              <b>
                {TARGET_LANGUAGES.find((l) => l.code === targetLanguage)?.label}
              </b>
            </span>
            <button
              type="button"
              onClick={() => onTargetLanguageChange(null)}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}

        {/* Attached File Preview */}
        {attachment ? (
          <div className="mx-1 mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px]">
            <Paperclip
              aria-hidden="true"
              className="size-3.5 shrink-0 text-primary"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {attachment.name}
            </span>
            <span className="shrink-0 text-muted-foreground text-xs">
              {attachment.size}
            </span>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => onAttachmentChange(null)}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        <label htmlFor="composer-input" className="sr-only">
          Message
        </label>
        <input
          id="composer-input"
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full border-0 bg-transparent px-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-0.5 pb-1">
          <input
            ref={fileRef}
            type="file"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onAttachmentChange({
                  name: file.name,
                  size: formatFileSize(file.size),
                });
              }
              event.target.value = "";
            }}
          />

          <button
            type="button"
            aria-label="Attach a file"
            title="Attach a file"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              attachment && "text-primary bg-primary-soft",
            )}
          >
            <Paperclip className="size-[18px]" strokeWidth={2} />
          </button>

          {/* Emoji Picker Popover */}
          <div ref={emojiContainerRef} className="relative">
            <button
              type="button"
              aria-label="Insert emoji"
              title="Emoji"
              onClick={() => setShowEmojiPicker((v) => !v)}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                showEmojiPicker && "bg-border text-foreground",
              )}
            >
              <Smile className="size-[18px]" strokeWidth={2} />
            </button>

            {showEmojiPicker ? (
              <div className="absolute bottom-11 left-0 z-30 w-64 rounded-xl border border-border bg-background p-2.5 shadow-xl">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                  Pick an emoji
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="flex size-7 items-center justify-center rounded text-base hover:bg-surface active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

          <button
            type="button"
            aria-label="Suggest a reply"
            title="Suggest a reply"
            onClick={() => {
              onChange(suggestions[0] ?? "");
              inputRef.current?.focus();
            }}
            className={toolButtonStyles}
          >
            <Sparkles className="size-4" strokeWidth={2} />
            Suggest
          </button>

          {/* Translate Options Dropdown */}
          <div ref={translateContainerRef} className="relative">
            <button
              type="button"
              aria-label="Translate draft"
              title="Translate options"
              onClick={() => setShowTranslatePicker((v) => !v)}
              className={cn(
                toolButtonStyles,
                targetLanguage && "bg-primary-soft text-primary-strong",
              )}
            >
              <Languages className="size-4" strokeWidth={2} />
              Translate
            </button>

            {showTranslatePicker ? (
              <div className="absolute bottom-11 left-0 z-30 w-52 rounded-xl border border-border bg-background p-1.5 shadow-xl">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Translate message to:
                </p>
                {TARGET_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onTargetLanguageChange(
                        targetLanguage === lang.code ? null : lang.code,
                      );
                      setShowTranslatePicker(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface",
                      targetLanguage === lang.code &&
                        "bg-primary-soft font-semibold text-primary",
                    )}
                  >
                    <span>{lang.label}</span>
                    {targetLanguage === lang.code ? (
                      <Check className="size-3.5" />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Ask the bot"
            title="Bot assistant"
            onClick={() => {
              onChange("Bot: How can I help you today?");
            }}
            className={toolButtonStyles}
          >
            <Bot className="size-4" strokeWidth={2} />
            Bot
          </button>

          {/* Tagify Options Popover */}
          <div ref={tagContainerRef} className="relative">
            <button
              type="button"
              aria-label="Tag this reply"
              title="Tagify"
              onClick={() => setShowTagPicker((v) => !v)}
              className={cn(
                toolButtonStyles,
                tags.length > 0
                  ? "bg-warning-soft text-warning font-bold"
                  : "hover:bg-border/70",
              )}
            >
              <Tag className="size-4" strokeWidth={2} />
              Tagify {tags.length > 0 ? `(${tags.length})` : ""}
            </button>

            {showTagPicker ? (
              <div className="absolute bottom-11 left-0 z-30 w-64 rounded-xl border border-border bg-background p-3 shadow-xl">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Attach tags to message:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const active = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                          active
                            ? "bg-warning-soft text-warning font-semibold ring-1 ring-warning/30"
                            : "bg-surface text-ink-soft hover:bg-border/60",
                        )}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 border-t border-border pt-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="New tag..."
                    className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizontal className="size-4" strokeWidth={2} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
