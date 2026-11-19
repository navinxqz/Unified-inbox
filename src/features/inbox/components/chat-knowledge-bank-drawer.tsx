"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  CornerDownLeft,
  ExternalLink,
  Eye,
  Search,
  Users,
  X,
} from "lucide-react";

import { initialKnowledgeTopics } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { KnowledgeTopic } from "@/features/inbox/types";

interface ChatKnowledgeBankDrawerProps {
  onClose: () => void;
  onInsert: (text: string) => void;
  onOpenKnowledgeModule?: () => void;
}

export function ChatKnowledgeBankDrawer({
  onClose,
  onInsert,
  onOpenKnowledgeModule,
}: ChatKnowledgeBankDrawerProps) {
  const { t } = useI18n();

  const [topics] = useStoredState<KnowledgeTopic[]>(
    MODULE_STORAGE_KEYS.knowledgeTopics,
    initialKnowledgeTopics,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<KnowledgeTopic | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [topics]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.content.toLowerCase().includes(q) ||
        topic.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (topic.category && topic.category.toLowerCase().includes(q));

      const matchesTag = !selectedTag || topic.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [topics, searchQuery, selectedTag]);

  function handleInsert(topic: KnowledgeTopic) {
    // Strip HTML to clean formatted plain text suitable for customer chat
    const div = document.createElement("div");
    div.innerHTML = topic.content;
    const plain = (div.textContent || div.innerText || "").trim();

    onInsert(plain);
    setInsertedId(topic.id);
    setTimeout(() => setInsertedId(null), 1500);
  }

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-white shadow-xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <BookOpen className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground">{t("Knowledge Bank")}</h2>
              <span className="flex items-center gap-0.5 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary-border">
                <Users className="size-2.5" />
                {t("Team Shared")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("Search and insert canned answers")}
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

      {/* Search Input */}
      <div className="border-b border-border bg-white p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search knowledge articles...")}
            className="h-8 w-full rounded-lg border border-border bg-white pl-8 pr-8 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:bg-surface"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {allTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-ink-soft hover:bg-surface-hover"
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[10px] text-danger hover:underline ml-1"
              >
                {t("Clear")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Topics List or Preview */}
      <div className="flex-1 bg-white overflow-y-auto p-3 space-y-2.5">
        {previewTopic ? (
          /* Single Article Preview */
          <div className="space-y-3 rounded-lg border border-border bg-white p-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setPreviewTopic(null)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                ← {t("Back to list")}
              </button>
              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {previewTopic.call_type_name || "General"}
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground">{previewTopic.title}</h3>

            <div
              className="prose prose-xs max-w-none text-xs text-foreground leading-relaxed max-h-[220px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: previewTopic.content }}
            />

            {previewTopic.file_name && (
              <div className="flex items-center justify-between rounded border border-border bg-surface p-2 text-xs">
                <span className="truncate font-medium">{previewTopic.file_name}</span>
                <span className="text-[10px] text-muted-foreground">{t("Attached")}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => handleInsert(previewTopic)}
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {insertedId === previewTopic.id ? (
                  <>
                    <Check className="size-3.5" />
                    {t("Inserted into Reply!")}
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="size-3.5" />
                    {t("Insert into Reply")}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <BookOpen className="size-8 stroke-1 mb-2 opacity-50" />
            <p className="text-xs font-semibold">{t("No topics found")}</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
              {t("Try another keyword or add a new topic from the Knowledge Bank page.")}
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="group rounded-xl border border-border bg-white p-3 transition-colors hover:border-primary/40 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-xs font-bold text-foreground group-hover:text-primary">
                  {topic.title}
                </h4>
                <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                  {topic.call_type_name || "General"}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                {topic.content.replace(/<[^>]+>/g, " ").slice(0, 100)}...
              </p>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2">
                <div className="flex items-center gap-1">
                  {topic.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[9px] text-muted-foreground font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={t("Preview article")}
                    onClick={() => setPreviewTopic(topic)}
                    className="inline-flex h-6 items-center gap-1 rounded border border-border px-1.5 text-[10px] font-semibold text-ink-soft hover:bg-surface"
                  >
                    <Eye className="size-3" />
                    {t("Preview")}
                  </button>
                  <button
                    type="button"
                    title={t("Insert into chat reply")}
                    onClick={() => handleInsert(topic)}
                    className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 shadow-2xs"
                  >
                    {insertedId === topic.id ? (
                      <Check className="size-3" />
                    ) : (
                      <CornerDownLeft className="size-3" />
                    )}
                    {insertedId === topic.id ? t("Inserted") : t("Insert")}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to Knowledge Bank Page */}
      {onOpenKnowledgeModule && (
        <div className="border-t border-border p-3 bg-white">
          <button
            type="button"
            onClick={onOpenKnowledgeModule}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("Open Knowledge Bank Dashboard")}</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

