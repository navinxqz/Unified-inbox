"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Copy,
  FileSpreadsheet,
  FileText,
  Globe,
  NotebookText,
  Pencil,
  Plus,
  Search,
  SearchCheck,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
} from "@/features/inbox/components/module-ui";
import { TinyMceEditor } from "@/features/inbox/components/tinymce-editor";
import { initialKnowledge, initialKnowledgeTopics } from "@/features/inbox/data";
import { useI18n } from "@/features/inbox/i18n";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { KnowledgeSource, KnowledgeTopic } from "@/features/inbox/types";

type KnowledgeBankModuleProps = {
  logActivity: (action: string, subject: string) => void;
};

type ViewMode = "dashboard" | "view" | "add" | "edit";

const CALL_TYPES = ["Inquiry", "Support", "Billing", "Product", "Feedback", "General"];
const CATEGORIES = ["General", "Logistics", "After Sales", "Payments", "Sizing", "Policy"];
const SUB_CATEGORIES = ["Shipping", "Refunds", "MFS & Gateway", "Clothing", "Warranty", "Account"];

export function KnowledgeBankModule({ logActivity }: KnowledgeBankModuleProps) {
  const { t } = useI18n();

  // Storage
  const [topics, setTopics] = useStoredState<KnowledgeTopic[]>(
    MODULE_STORAGE_KEYS.knowledgeTopics,
    initialKnowledgeTopics,
  );
  const [sources, setSources] = useStoredState<KnowledgeSource[]>(
    MODULE_STORAGE_KEYS.knowledge,
    initialKnowledge,
  );

  // Active view state
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "sources">("articles");

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Form state for Add / Edit
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCallType, setFormCallType] = useState("Inquiry");
  const [formCategory, setFormCategory] = useState("General");
  const [formSubCategory, setFormSubCategory] = useState("Shipping");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState("");
  const [formFileName, setFormFileName] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string; tag?: string }>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Legacy AI source draft
  const [sourceDraft, setSourceDraft] = useState({
    title: "",
    kind: "text" as KnowledgeSource["kind"],
  });

  // Selected topic object
  const currentTopic = useMemo(
    () => topics.find((t) => t.id === selectedTopicId || t.uuid === selectedTopicId) || null,
    [topics, selectedTopicId],
  );

  // Filtered topics based on search & tag
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.content.toLowerCase().includes(q) ||
        topic.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (topic.category && topic.category.toLowerCase().includes(q));

      const matchesTag =
        !selectedTagFilter ||
        topic.tags.some((tag) => tag.toLowerCase() === selectedTagFilter.toLowerCase());

      return matchesQuery && matchesTag;
    });
  }, [topics, searchQuery, selectedTagFilter]);

  // Sorted topic lists for dashboard cards
  const newAddedTopics = useMemo(() => {
    return [...topics].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ).slice(0, 5);
  }, [topics]);

  const mostResearchedTopics = useMemo(() => {
    return [...topics].sort((a, b) => b.views_count - a.views_count).slice(0, 5);
  }, [topics]);

  // Unique tags for quick filters
  const allTags = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [topics]);

  // Navigation handlers
  function handleOpenTopic(idOrUuid: string) {
    setSelectedTopicId(idOrUuid);
    setViewMode("view");
    // Increment view counter
    setTopics((prev) =>
      prev.map((t) =>
        t.id === idOrUuid || t.uuid === idOrUuid ? { ...t, views_count: t.views_count + 1 } : t,
      ),
    );
  }

  function handleStartAdd() {
    setFormTitle("");
    setFormContent("");
    setFormCallType("Inquiry");
    setFormCategory("General");
    setFormSubCategory("Shipping");
    setFormTags(["Policy"]);
    setTagInputText("");
    setFormFileName(null);
    setFormErrors({});
    setViewMode("add");
  }

  function handleStartEdit(topic: KnowledgeTopic) {
    setSelectedTopicId(topic.id);
    setFormTitle(topic.title);
    setFormContent(topic.content);
    setFormCallType(topic.call_type_name || "Inquiry");
    setFormCategory(topic.category || "General");
    setFormSubCategory(topic.sub_category || "Shipping");
    setFormTags(topic.tags || []);
    setTagInputText("");
    setFormFileName(topic.file_name || null);
    setFormErrors({});
    setViewMode("edit");
  }

  function handleDeleteTopic(id: string) {
    const topic = topics.find((t) => t.id === id);
    if (!window.confirm(t("Are you sure you want to delete this topic?"))) return;

    setTopics((prev) => prev.filter((t) => t.id !== id));
    logActivity(`deleted topic "${topic?.title || id}"`, "Knowledge Bank");
    setViewMode("dashboard");
    setSelectedTopicId(null);
  }

  function handleSaveTopic() {
    const errors: { title?: string; content?: string; tag?: string } = {};
    if (!formTitle.trim()) errors.title = t("Title is required");
    if (!formContent.trim() || formContent === "<p></p>") errors.content = t("Content is required");
    if (formTags.length === 0) errors.tag = t("At least one tag is required");

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (viewMode === "add") {
      const newTopic: KnowledgeTopic = {
        id: `topic-${Date.now()}`,
        uuid: crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`,
        title: formTitle.trim(),
        content: formContent,
        call_type_name: formCallType,
        category: formCategory,
        sub_category: formSubCategory,
        tags: formTags,
        file_name: formFileName,
        file_url: formFileName ? "#" : null,
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 1,
      };

      setTopics((prev) => [newTopic, ...prev]);
      logActivity(`created knowledge topic "${newTopic.title}"`, "Knowledge Bank");
      handleOpenTopic(newTopic.id);
    } else if (viewMode === "edit" && currentTopic) {
      const updated: KnowledgeTopic = {
        ...currentTopic,
        title: formTitle.trim(),
        content: formContent,
        call_type_name: formCallType,
        category: formCategory,
        sub_category: formSubCategory,
        tags: formTags,
        file_name: formFileName,
        updated_at: new Date().toISOString(),
      };

      setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      logActivity(`updated knowledge topic "${updated.title}"`, "Knowledge Bank");
      setViewMode("view");
    }
  }

  function handleAddTagOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInputText.trim();
      if (val && !formTags.includes(val)) {
        setFormTags([...formTags, val]);
        setTagInputText("");
        setFormErrors((prev) => ({ ...prev, tag: undefined }));
      }
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setFormTags((prev) => prev.filter((t) => t !== tagToRemove));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFormFileName(file.name);
    }
  }

  function handleCopyContent(text: string) {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  }

  // Format date helper
  function formatFriendlyDate(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch {
      return isoString;
    }
  }

  return (
    <ModuleShell
      title="Knowledge Bank"
      subtitle="Publish, search, and manage rich canned knowledge topics and AI indexed sources"
      walkthrough={{
        title: "How to use Knowledge Bank",
        steps: [
          "1. Search Topics: Use the top search bar to find answers by keywords, categories, or tags.",
          "2. Create Articles with TinyMCE: Click + Add Topic to launch the TinyMCE editor with full formatting and tables.",
          "3. Quick Insert in Chat: Access your shared Knowledge Bank directly in every conversation top bar.",
        ],
      }}
      actions={
        <div className="flex items-center gap-2">
          {viewMode !== "dashboard" ? (
            <button
              type="button"
              onClick={() => setViewMode("dashboard")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground hover:bg-surface"
            >
              <ArrowLeft className="size-3.5" />
              {t("Back to Dashboard")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="size-4" />
              {t("Add Topic")}
            </button>
          )}
        </div>
      }
    >
      {/* Module Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "articles"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" />
          {t("Articles & Dashboard")} ({topics.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "sources"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          {t("AI Indexing Sources")} ({sources.length})
        </button>
      </div>

      {activeTab === "sources" ? (
        /* Legacy AI sources management */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t("Indexed sources")} value={String(sources.length)} />
            <StatCard
              label={t("Ready for retrieval")}
              value={String(sources.filter((s) => s.status === "ready").length)}
              tone="success"
            />
            <StatCard
              label={t("Total words indexed")}
              value={sources.reduce((sum, s) => sum + s.words, 0).toLocaleString()}
            />
          </div>

          <SectionCard title={t("Add indexing source")} description={t("Provide text, files, or URLs for AI grounding")}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label={t("Source Title")}>
                <input
                  type="text"
                  value={sourceDraft.title}
                  onChange={(e) => setSourceDraft({ ...sourceDraft, title: e.target.value })}
                  placeholder={t("e.g. Return Policy 2026")}
                  className={inputClass}
                />
              </Field>
              <Field label={t("Type")}>
                <select
                  value={sourceDraft.kind}
                  onChange={(e) =>
                    setSourceDraft({ ...sourceDraft, kind: e.target.value as KnowledgeSource["kind"] })
                  }
                  className={inputClass}
                >
                  <option value="text">{t("Plain Text Document")}</option>
                  <option value="file">{t("CSV / PDF File")}</option>
                  <option value="url">{t("Web URL")}</option>
                </select>
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!sourceDraft.title.trim()) return;
                    setSources([
                      {
                        id: `kn-${Date.now()}`,
                        title: sourceDraft.title.trim(),
                        kind: sourceDraft.kind,
                        status: "indexing",
                        words: Math.max(50, sourceDraft.title.length * 8),
                        at: "Just now",
                      },
                      ...sources,
                    ]);
                    setSourceDraft({ title: "", kind: "text" });
                    logActivity(`added AI source "${sourceDraft.title}"`, "Knowledge");
                  }}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  {t("Add to Index")}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t("Configured Sources")}>
            <div className="divide-y divide-border rounded-lg border border-border bg-white">
              {sources.map((src) => (
                <div key={src.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                      {src.kind === "file" ? <FileSpreadsheet className="size-4" /> : src.kind === "url" ? <Globe className="size-4" /> : <FileText className="size-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{src.title}</p>
                      <p className="text-[11px] text-muted-foreground">{src.words} {t("words")} · {src.at}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={src.status === "ready" ? "success" : "neutral"}>
                      {src.status === "ready" ? t("Ready") : t("Indexing")}
                    </Pill>
                    <button
                      type="button"
                      onClick={() => setSources(sources.filter((s) => s.id !== src.id))}
                      className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : viewMode === "dashboard" ? (
        /* ═══════════════════════════════════════════════════════════════
           1. DASHBOARD VIEW (Replicating NewDashboard.tsx)
           ═══════════════════════════════════════════════════════════════ */
        <div className="space-y-8">
          {/* Hero Banner Section */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-primary/10 via-surface to-background px-6 py-10 text-center shadow-xs">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {t("How can we help you?")}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
              {t("Search through internal policies, answers, guidelines, and canned procedures.")}
            </p>

            <div className="mx-auto mt-6 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Search by keyword, topic title, or tag...")}
                  className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 rounded p-1 text-muted-foreground hover:bg-surface"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              {/* Tag Quick Filters */}
              {allTags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t("Popular tags:")}
                  </span>
                  {allTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTagFilter(selectedTagFilter === tag ? null : tag)
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        selectedTagFilter === tag
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-ink-soft hover:bg-surface-hover"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedTagFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedTagFilter(null)}
                      className="text-[11px] font-semibold text-danger hover:underline"
                    >
                      {t("Clear filter")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label={t("Total Topics")} value={String(topics.length)} />
            <StatCard
              label={t("Total Views")}
              value={String(topics.reduce((acc, t) => acc + (t.views_count || 0), 0))}
              tone="success"
            />
            <StatCard label={t("Categories")} value={String(CATEGORIES.length)} />
            <StatCard label={t("Tagged Keywords")} value={String(allTags.length)} />
          </div>

          {/* Main Dashboard Columns: New Added Topics & Most Researched Topics */}
          {!searchQuery && !selectedTagFilter && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* New Added Topics */}
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <NotebookText className="size-4 text-primary" />
                    {t("New Added Topics")}
                  </h2>
                  <span className="rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {newAddedTopics.length} {t("recent")}
                  </span>
                </div>

                {newAddedTopics.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">{t("No topics available")}</p>
                ) : (
                  <ul className="space-y-3">
                    {newAddedTopics.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => handleOpenTopic(topic.id)}
                          className="group flex w-full flex-col items-start rounded-lg p-2 text-left transition-colors hover:bg-surface"
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                              {topic.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatFriendlyDate(topic.created_at)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="rounded bg-surface px-1.5 py-0.2 font-medium">
                              {topic.call_type_name || "General"}
                            </span>
                            <span>•</span>
                            <span>{topic.created_by}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Most Researched Topics */}
              <div className="rounded-xl border border-border bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <SearchCheck className="size-4 text-emerald-500" />
                    {t("Most Researched Topics")}
                  </h2>
                  <span className="rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {t("Top viewed")}
                  </span>
                </div>

                {mostResearchedTopics.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">{t("No topics available")}</p>
                ) : (
                  <ul className="space-y-3">
                    {mostResearchedTopics.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => handleOpenTopic(topic.id)}
                          className="group flex w-full flex-col items-start rounded-lg p-2 text-left transition-colors hover:bg-surface"
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                              {topic.title}
                            </span>
                            <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                              {topic.views_count} {t("views")}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="rounded bg-surface px-1.5 py-0.2 font-medium">
                              {topic.category || "General"}
                            </span>
                            <span>•</span>
                            <span>{topic.call_type_name || "Inquiry"}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Topic Cards List (TopicCard.tsx replica) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-bold text-foreground">
                {searchQuery || selectedTagFilter
                  ? `${t("Search Results")} (${filteredTopics.length})`
                  : `${t("All Knowledge Topics")} (${topics.length})`}
              </h2>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="space-y-3">
                <EmptyState
                  icon={BookOpen}
                  title="No knowledge topics found"
                  text="Try changing your search query or filter, or click + Add Topic to publish one."
                />
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="size-3.5" />
                    {t("Add Topic")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleOpenTopic(topic.id)}
                    className="group cursor-pointer rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
                        {topic.title}
                      </h3>
                      <span className="shrink-0 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {topic.call_type_name || "General"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{topic.created_by || "Admin"}</span>
                      <span>·</span>
                      <span>{formatFriendlyDate(topic.created_at)}</span>
                      <span>·</span>
                      <span>{topic.views_count} {t("views")}</span>
                    </div>

                    {/* Excerpt */}
                    <div
                      className="mt-2 line-clamp-2 text-xs text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: topic.content.replace(/<[^>]+>/g, " ").slice(0, 140) + "...",
                      }}
                    />

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-soft"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "view" && currentTopic ? (
        /* ═══════════════════════════════════════════════════════════════
           2. TOPIC VIEW (Replicating TopicView.tsx)
           ═══════════════════════════════════════════════════════════════ */
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-xl border border-border bg-white shadow-xs">
            {/* Header info */}
            <div className="border-b border-border p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                      {currentTopic.call_type_name || "Inquiry"}
                    </span>
                    {currentTopic.category && (
                      <span className="rounded bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {currentTopic.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {currentTopic.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyContent(currentTopic.content.replace(/<[^>]+>/g, " "))}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                  >
                    {copiedNotification ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copiedNotification ? t("Copied") : t("Copy")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(currentTopic)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
                  >
                    <Pencil className="size-3.5" />
                    {t("Edit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTopic(currentTopic.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-danger/30 bg-danger/10 px-2.5 text-xs font-semibold text-danger hover:bg-danger/20"
                  >
                    <Trash2 className="size-3.5" />
                    {t("Delete")}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {currentTopic.created_by}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatFriendlyDate(currentTopic.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <SearchCheck className="size-3.5" />
                  {currentTopic.views_count} {t("reads")}
                </span>
              </div>
            </div>

            {/* Rich HTML Content Viewer */}
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentTopic.content }}
              />
            </div>

            {/* Tags and Attachment Footer */}
            <div className="border-t border-border bg-surface/30 p-5 space-y-4">
              {currentTopic.tags && currentTopic.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <TagIcon className="size-3.5 text-muted-foreground mr-1" />
                  {currentTopic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {currentTopic.file_name && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{currentTopic.file_name}</p>
                      <p className="text-[11px] text-muted-foreground">{t("Attached resource document")}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`${t("Downloading file:")} ${currentTopic.file_name}`);
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <ArrowDownToLine className="size-3.5" />
                    {t("Download")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           3. ADD / EDIT TOPIC FORM (Replicating AddTopic.tsx with TinyMCE)
           ═══════════════════════════════════════════════════════════════ */
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {viewMode === "add" ? t("Create New Topic") : t("Edit Topic")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("Use the rich text editor below to format text, add tables, and upload images.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode(selectedTopicId ? "view" : "dashboard")}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface"
              >
                {t("Cancel")}
              </button>
            </div>

            <div className="space-y-5">
              {/* Title Field */}
              <Field label={`${t("Topic Title")} *`}>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (formErrors.title) setFormErrors({ ...formErrors, title: undefined });
                  }}
                  placeholder={t("Write a clear, descriptive title...")}
                  className={inputClass}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs font-semibold text-danger">{formErrors.title}</p>
                )}
              </Field>

              {/* Wrap-Up Section: Call Type, Category, Sub-category */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("Wrap Up & Classification")}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label={t("Call Type")}>
                    <select
                      value={formCallType}
                      onChange={(e) => setFormCallType(e.target.value)}
                      className={inputClass}
                    >
                      {CALL_TYPES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("Category")}>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("Sub-category")}>
                    <select
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      className={inputClass}
                    >
                      {SUB_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Description Rich Text Editor (TinyMCE Replica) */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    {t("Description / Body")} <span className="text-danger">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    TinyMCE 8.9.3 · {t("Full tables, alignment & images supported")}
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <TinyMceEditor
                    value={formContent}
                    onChange={(newVal) => {
                      setFormContent(newVal);
                      if (formErrors.content) setFormErrors({ ...formErrors, content: undefined });
                    }}
                    placeholder={t("Start writing topic content, policies, instructions or tables...")}
                    height={420}
                  />
                </div>
                {formErrors.content && (
                  <p className="mt-1 text-xs font-semibold text-danger">{formErrors.content}</p>
                )}
              </div>

              {/* Tags Section (Replicating TagInput.tsx & Tag.tsx) */}
              <Field label={`${t("Tags")} *`}>
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInputText}
                      onChange={(e) => setTagInputText(e.target.value)}
                      onKeyDown={handleAddTagOnKeyDown}
                      placeholder={t("Write tag name and press Enter")}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = tagInputText.trim();
                        if (val && !formTags.includes(val)) {
                          setFormTags([...formTags, val]);
                          setTagInputText("");
                        }
                      }}
                      className="shrink-0 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink-soft hover:bg-surface-hover"
                    >
                      {t("Add")}
                    </button>
                  </div>

                  {formTags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {formTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-2xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="rounded-full hover:bg-background/20 text-background px-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {formErrors.tag && (
                    <p className="mt-1 text-xs font-semibold text-danger">{formErrors.tag}</p>
                  )}
                </div>
              </Field>

              {/* File Attachment Input (Replicating FileInput.tsx) */}
              <Field label={t("Attach File / Document")}>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-2.5 text-xs font-semibold text-ink-soft hover:border-primary">
                    <Upload className="size-4 text-primary" />
                    <span>{t("Browse file")}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {formFileName ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs">
                      <FileText className="size-4 text-primary" />
                      <span className="font-semibold text-foreground">{formFileName}</span>
                      <button
                        type="button"
                        onClick={() => setFormFileName(null)}
                        className="rounded p-0.5 text-muted-foreground hover:text-danger"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("Optional PDF, CSV, or document file")}
                    </span>
                  )}
                </div>
              </Field>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setViewMode(selectedTopicId ? "view" : "dashboard")}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveTopic}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Check className="size-4" />
                  {viewMode === "add" ? t("Create Topic") : t("Save Changes")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleShell>
  );
}
