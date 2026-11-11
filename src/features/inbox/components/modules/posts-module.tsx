"use client";

import { useState } from "react";
import { Camera, Check, Image as ImageIcon } from "lucide-react";

import { ChannelIcon } from "@/features/inbox/components/channel-icon";
import {
  EmptyState,
  ModuleShell,
  Pill,
  SectionCard,
} from "@/features/inbox/components/module-ui";
import { initialPosts } from "@/features/inbox/data";
import { MODULE_STORAGE_KEYS, useStoredState } from "@/features/inbox/storage";
import type { PostItem } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

type PostsProps = {
  logActivity: (action: string, subject: string) => void;
};

export function PostsModule({ logActivity }: PostsProps) {
  const [posts, setPosts] = useStoredState<PostItem[]>(
    MODULE_STORAGE_KEYS.posts,
    initialPosts,
  );
  const [selectedId, setSelectedId] = useState<string>(initialPosts[0]?.id ?? "");

  const selected = posts.find((post) => post.id === selectedId) ?? posts[0] ?? null;

  function confirmMatch(post: PostItem, productId: string, productName: string) {
    setPosts(
      posts.map((item) =>
        item.id === post.id
          ? {
              ...item,
              status: "published",
              matches: [
                item.matches.find((match) => match.productId === productId)!,
                ...item.matches.filter((match) => match.productId !== productId),
              ].map((match, index) =>
                index === 0 ? { ...match, confidence: 1 } : match,
              ),
            }
          : item,
      ),
    );
    logActivity(`linked post to ${productName}`, "Posts · photo match");
  }

  return (
    <ModuleShell
      title="Posts"
      subtitle="Photo posts with AI product recognition — confirm the match once and the AI can sell from that photo."
      walkthrough={{
        title: "Link photos to products",
        steps: [
          "Every new photo post gets the top three product matches with confidence scores.",
          "Confirm the right match — the AI will use that product's price and stock in replies.",
          "Low-confidence matches stay suggestions; nothing is auto-published without you.",
          "Published posts keep their link for future conversations.",
        ],
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <SectionCard title="Photo posts" description="Newest first.">
          {posts.length === 0 ? (
            <EmptyState icon={ImageIcon} title="No posts" text="Posts appear here as you publish them." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedId(post.id)}
                  className={cn(
                    "rounded-xl border p-2.5 text-left transition-colors",
                    selected?.id === post.id
                      ? "border-primary bg-primary-soft/40"
                      : "border-border hover:bg-surface/60",
                  )}
                >
                  <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-gradient-to-br from-surface to-border/60 text-muted-foreground">
                    <ImageIcon className="size-7" strokeWidth={1.6} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <ChannelIcon
                      channel={post.platform === "instagram" ? "instagram" : "messenger"}
                      className="size-3.5"
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {post.platform}
                    </span>
                    <Pill tone={post.status === "published" ? "success" : "warning"}>
                      {post.status}
                    </Pill>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] font-medium">{post.caption}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{post.at}</p>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Product recognition"
          description="Top three matches from the photo."
        >
          {selected ? (
            <div className="space-y-3">
              <p className="rounded-lg bg-surface px-3 py-2 text-[13px]">{selected.caption}</p>
              {selected.matches.map((match, index) => (
                <div key={match.productId} className="rounded-lg border border-border-subtle p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                      <span className="flex size-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      {match.productName}
                    </span>
                    <span className="text-xs font-bold">
                      {Math.round(match.confidence * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        match.confidence > 0.7
                          ? "bg-emerald-500"
                          : match.confidence > 0.3
                            ? "bg-amber-500"
                            : "bg-border",
                      )}
                      style={{ width: `${match.confidence * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {index === 0 && selected.status === "published" ? (
                      <Pill tone="success">
                        <Check className="size-3" />
                        linked
                      </Pill>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Camera className="size-3" />
                        suggested
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => confirmMatch(selected, match.productId, match.productName)}
                      className="h-7 rounded-lg border border-border px-2 text-[11px] font-semibold text-ink-soft hover:bg-surface"
                    >
                      Confirm match
                    </button>
                  </div>
                </div>
              ))}
              <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ChannelIcon channel={selected.platform === "instagram" ? "instagram" : "messenger"} className="size-3" />
                Recognition runs on every new photo post.
              </p>
            </div>
          ) : (
            <EmptyState icon={ImageIcon} title="Select a post" text="Pick a photo post to see its matches." />
          )}
        </SectionCard>
      </div>
    </ModuleShell>
  );
}
