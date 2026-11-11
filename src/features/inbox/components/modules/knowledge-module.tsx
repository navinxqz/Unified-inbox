"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  Globe,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
  StatCard,
  Toggle,
} from "@/features/inbox/components/module-ui";
import { initialKnowledge } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { KnowledgeSource } from "@/features/inbox/types";

type KnowledgeProps = {
  logActivity: (action: string, subject: string) => void;
};

export function KnowledgeModule({ logActivity }: KnowledgeProps) {
  const [sources, setSources] = useStoredState<KnowledgeSource[]>(
    MODULE_STORAGE_KEYS.knowledge,
    initialKnowledge,
  );
  const [hybrid, setHybrid] = useStoredState<boolean>(
    "unified_inbox_knowledge_hybrid_v1",
    true,
  );
  const [draft, setDraft] = useState({
    title: "",
    kind: "text" as KnowledgeSource["kind"],
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ body: string; source: string } | null>(null);

  function addSource() {
    const title = draft.title.trim();
    if (!title) return;
    setSources([
      {
        id: `kn-${Date.now()}`,
        title,
        kind: draft.kind,
        status: "indexing",
        words: Math.max(40, title.length * 6),
        at: "Just now",
      },
      ...sources,
    ]);
    logActivity(`added knowledge source “${title}”`, "Knowledge");
    setDraft({ title: "", kind: "text" });
  }

  function removeSource(source: KnowledgeSource) {
    setSources(sources.filter((item) => item.id !== source.id));
    logActivity(`removed knowledge source “${source.title}”`, "Knowledge");
  }

  function askTest() {
    const query = question.trim().toLowerCase();
    if (!query) return;

    const match = sources.find((source) =>
      source.title.toLowerCase().split(/[^a-z]+/).some((word) => word.length > 3 && query.includes(word)),
    );

    setAnswer({
      body: match
        ? `From “${match.title}”: inside Dhaka 1–2 days (৳60), outside Dhaka 3–5 days (৳120), free over ৳2,500. If the parcel is late we chase the courier the same day.`
        : "I couldn't ground that in a knowledge source — the AI would ask a clarifying question or hand off to a human rather than guess.",
      source: match?.title ?? "No grounded source",
    });
  }

  const totalWords = sources.reduce((sum, source) => sum + source.words, 0);

  return (
    <ModuleShell
      title="Knowledge"
      subtitle="The retrieval layer behind the AI — policies, catalog, and FAQs it is allowed to ground answers in."
      walkthrough={{
        title: "Ground the AI in your docs",
        steps: [
          "Add policies, catalog files, or URLs — each one is chunked and indexed.",
          "Hybrid retrieval searches by meaning and by words at the same time.",
          "Retrieval runs on demand per question; the AI only uses what it found.",
          "Test a real customer question to see which source grounds the answer.",
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Sources" value={String(sources.length)} icon={BookOpen} />
        <StatCard
          label="Indexed words"
          value={totalWords.toLocaleString()}
          icon={FileText}
          tone="success"
        />
        <StatCard
          label="Indexing"
          value={String(sources.filter((source) => source.status === "indexing").length)}
          tone="warning"
        />
        <StatCard label="Retrieval" value={hybrid ? "Hybrid" : "Keyword"} icon={Sparkles} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <SectionCard title="Sources" description="Everything the AI may quote.">
          <div className="flex flex-wrap items-end gap-2 pb-3">
            <Field label="Add a source" className="min-w-[180px] flex-1">
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className={inputClass}
                placeholder="Warranty policy / catalog.csv / help.example.com"
              />
            </Field>
            <Field label="Type" className="w-28">
              <select
                value={draft.kind}
                onChange={(event) =>
                  setDraft({ ...draft, kind: event.target.value as KnowledgeSource["kind"] })
                }
                className={inputClass}
              >
                <option value="text">Text</option>
                <option value="file">File</option>
                <option value="url">URL</option>
              </select>
            </Field>
            <button
              type="button"
              onClick={addSource}
              disabled={!draft.title.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add
            </button>
          </div>

          {sources.length === 0 ? (
            <EmptyState icon={BookOpen} title="No sources" text="Add your first policy or catalog file." />
          ) : (
            <div className="divide-y divide-border-subtle">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
                    {source.kind === "url" ? (
                      <Globe className="size-3.5" />
                    ) : source.kind === "file" ? (
                      <FileText className="size-3.5" />
                    ) : (
                      <BookOpen className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{source.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {source.words.toLocaleString()} words · {source.at}
                    </p>
                  </div>
                  <Pill tone={source.status === "ready" ? "success" : "warning"}>
                    {source.status}
                  </Pill>
                  <button
                    type="button"
                    onClick={() => removeSource(source)}
                    aria-label={`Remove ${source.title}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Retrieval mode">
            <Toggle
              checked={hybrid}
              onChange={setHybrid}
              label={hybrid ? "Hybrid — meaning + words" : "Keyword only"}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Retrieval runs on demand: the AI searches this knowledge base for
              each question, then answers only from what it found.
            </p>
          </SectionCard>

          <SectionCard title="Test a question" description="See which source grounds the answer.">
            <div className="space-y-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-border px-2.5">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only">Test question</span>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      askTest();
                    }
                  }}
                  placeholder="How long is delivery outside Dhaka?"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="button"
                onClick={askTest}
                disabled={!question.trim()}
                className="h-9 w-full rounded-lg bg-primary text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Run retrieval test
              </button>
              {answer ? (
                <div className="rounded-lg bg-surface p-2.5">
                  <p className="text-[12px] leading-relaxed">{answer.body}</p>
                  <p className="mt-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Source · {answer.source}
                  </p>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </ModuleShell>
  );
}
