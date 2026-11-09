"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import {
  Bot,
  Languages,
  Paperclip,
  SendHorizontal,
  Smile,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import type { Attachment } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  attachment: Attachment | null;
  onAttachmentChange: (attachment: Attachment | null) => void;
  onSubmit: () => void;
};

const toolButtonStyles =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

export function Composer({
  value,
  onChange,
  placeholder,
  suggestions,
  inputRef,
  attachment,
  onAttachmentChange,
  onSubmit,
}: ComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = value.trim().length > 0 || attachment !== null;

  return (
    <div className="shrink-0 px-6 pt-1 pb-5">
      <div className="mb-2.5 flex items-center gap-2 overflow-x-auto pb-0.5">
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
            className="h-[34px] shrink-0 rounded-full border border-primary-border bg-background px-3.5 text-[13px] font-medium whitespace-nowrap text-primary-strong transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
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
        className="rounded-xl border border-border bg-surface p-1"
      >
        {attachment ? (
          <div className="mx-1 mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px]">
            <Paperclip
              aria-hidden="true"
              className="size-3.5 shrink-0"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {attachment.name}
            </span>
            <span className="shrink-0 text-muted-foreground">
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
          className="h-11 w-full border-0 bg-transparent px-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
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
            )}
          >
            <Paperclip className="size-[18px]" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Insert emoji"
            title="Emoji"
            onClick={() => onChange(`${value} 🙂`)}
            className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-border/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <Smile className="size-[18px]" strokeWidth={2} />
          </button>

          <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-border" />

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
          <button
            type="button"
            aria-label="Translate draft"
            title="Translate (coming soon)"
            className={toolButtonStyles}
          >
            <Languages className="size-4" strokeWidth={2} />
            Translate
          </button>
          <button
            type="button"
            aria-label="Ask the bot"
            title="Bot (coming soon)"
            className={toolButtonStyles}
          >
            <Bot className="size-4" strokeWidth={2} />
            Bot
          </button>
          <button
            type="button"
            aria-label="Tag this reply"
            title="Tagify"
            className={cn(toolButtonStyles, "bg-warning-soft text-warning")}
          >
            <Tag className="size-4" strokeWidth={2} />
            Tagify
          </button>

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
