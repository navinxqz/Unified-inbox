"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  FileText,
  Lock,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";

import { useI18n } from "@/features/inbox/i18n";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { Person, PrivateChatNote } from "@/features/inbox/types";

interface ChatPrivateNoteDrawerProps {
  person: Person | null;
  onClose: () => void;
}

export function ChatPrivateNoteDrawer({
  person,
  onClose,
}: ChatPrivateNoteDrawerProps) {
  const { t } = useI18n();

  const [notesStore, setNotesStore] = useStoredState<Record<string, PrivateChatNote>>(
    MODULE_STORAGE_KEYS.privateNotes,
    {},
  );

  const conversationKey = person ? person.id : "general_scratchpad";
  const [activeTab, setActiveTab] = useState<"conversation" | "scratchpad">("conversation");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const effectiveKey = activeTab === "conversation" ? conversationKey : "general_scratchpad";

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const content = drafts[effectiveKey] ?? notesStore[effectiveKey]?.content ?? "";

  const updateContent = (newText: string) => {
    setDrafts((prev) => ({ ...prev, [effectiveKey]: newText }));
    setSaveStatus("saving");
  };

  // Autosave handler with debounce
  useEffect(() => {
    const draftText = drafts[effectiveKey];
    if (draftText === undefined) return;
    if (draftText === notesStore[effectiveKey]?.content) return;

    const timer = setTimeout(() => {
      setNotesStore((prev) => ({
        ...prev,
        [effectiveKey]: {
          id: `note-${effectiveKey}`,
          conversationId: effectiveKey,
          content: draftText,
          updatedAt: new Date().toISOString(),
        },
      }));
      setSaveStatus("saved");
    }, 400);

    return () => clearTimeout(timer);
  }, [drafts, effectiveKey, notesStore, setNotesStore]);

  function handleClear() {
    if (!content.trim()) return;
    if (!window.confirm(t("Are you sure you want to clear this private note?"))) return;

    setDrafts((prev) => ({ ...prev, [effectiveKey]: "" }));
    setNotesStore((prev) => {
      const next = { ...prev };
      delete next[effectiveKey];
      return next;
    });
  }

  function handleCopy() {
    if (!content.trim() || typeof navigator === "undefined") return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lastUpdated = useMemo(() => {
    const ts = notesStore[effectiveKey]?.updatedAt;
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return null;
    }
  }, [notesStore, effectiveKey]);

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-white shadow-xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <StickyNote className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground">{t("Personal Note")}</h2>
              <span className="flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                <Lock className="size-2.5" />
                {t("Private")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("Only you can see this note")}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label={t("Close")}
          title={t("Close")}
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="size-4.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white px-3">
        <button
          type="button"
          onClick={() => setActiveTab("conversation")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "conversation"
              ? "border-primary text-primary bg-white"
              : "border-transparent text-muted-foreground hover:text-foreground bg-white"
          }`}
        >
          <FileText className="size-3.5" />
          {person ? person.name : t("This Chat")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scratchpad")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "scratchpad"
              ? "border-primary text-primary bg-white"
              : "border-transparent text-muted-foreground hover:text-foreground bg-white"
          }`}
        >
          <StickyNote className="size-3.5" />
          {t("General Scratchpad")}
        </button>
      </div>

      {/* Textarea Area */}
      <div className="flex-1 bg-white p-4 flex flex-col">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder={
              activeTab === "conversation"
                ? t("Write personal notes about {name} (orders, reminders, preferences, internal flags)...", {
                    name: person?.name || "this customer",
                  })
                : t("Write personal scratchpad notes, numbers, or reminders...")
            }
            className="h-full w-full resize-none rounded-xl border border-border bg-white p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Footer info & actions */}
        <div className="mt-3 flex items-center justify-between border-t border-border bg-white pt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-primary">
                <span className="size-2 animate-ping rounded-full bg-primary" />
                {t("Saving...")}
              </span>
            ) : lastUpdated ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {t("Saved at {time}", { time: lastUpdated })}
              </span>
            ) : (
              <span>{t("Autosaved locally")}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!content.trim()}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] font-semibold text-ink-soft hover:bg-surface-hover disabled:opacity-40"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              {copied ? t("Copied") : t("Copy")}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!content.trim()}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-danger/30 bg-danger/10 px-2 text-[11px] font-semibold text-danger hover:bg-danger/20 disabled:opacity-40"
            >
              <Trash2 className="size-3" />
              {t("Clear")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

