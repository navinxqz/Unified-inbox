"use client";

import { useEffect, useState } from "react";

import { AppRail } from "@/features/inbox/components/app-rail";
import { ChannelSidebar } from "@/features/inbox/components/channel-sidebar";
import { ConversationList } from "@/features/inbox/components/conversation-list";
import { ThreadPanel } from "@/features/inbox/components/thread-panel";
import {
  channelById,
  initialMessages,
  people,
  storyBanner,
  suggestedReplies,
} from "@/features/inbox/data";
import type {
  Attachment,
  ChannelFilter,
  Message,
  Person,
  RailView,
  Reaction,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const railMeta: Record<RailView, { title: string; subtitle: string }> = {
  all: { title: "All messages", subtitle: "5 channels, one timeline" },
  priority: {
    title: "Priority",
    subtitle: "People and messages that need you",
  },
  tagify: { title: "Tagify", subtitle: "Tagged messages across channels" },
  ignored: {
    title: "Ignored",
    subtitle: "Muted conversations stay out of the way",
  },
  bots: { title: "Bots", subtitle: "Automated senders and assistants" },
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toggleReactionList(
  reactions: Reaction[] | undefined,
  emoji: string,
): Reaction[] {
  const list = reactions ?? [];
  const existing = list.find((reaction) => reaction.emoji === emoji);

  if (!existing) {
    return [...list, { emoji, count: 1, reacted: true }];
  }

  if (existing.reacted) {
    const nextCount = existing.count - 1;

    if (nextCount <= 0) {
      return list.filter((reaction) => reaction.emoji !== emoji);
    }

    return list.map((reaction) =>
      reaction.emoji === emoji
        ? { ...reaction, count: nextCount, reacted: false }
        : reaction,
    );
  }

  return list.map((reaction) =>
    reaction.emoji === emoji
      ? { ...reaction, count: reaction.count + 1, reacted: true }
      : reaction,
  );
}

export function InboxWorkspace() {
  const [railView, setRailView] = useState<RailView>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);

  useEffect(() => {
    if (!channelsOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setChannelsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [channelsOpen]);

  const selectedPerson =
    people.find((person) => person.id === selectedPersonId) ?? null;
  const activeChannel =
    channelFilter === "all" ? null : channelById[channelFilter];
  const normalizedQuery = query.trim().toLowerCase();

  const inView = (person: Person) => {
    switch (railView) {
      case "priority":
        return person.priority === true;
      case "tagify":
        return messages.some(
          (message) =>
            message.personId === person.id &&
            (message.tags?.length ?? 0) > 0,
        );
      case "ignored":
      case "bots":
        return false;
      default:
        return true;
    }
  };

  const filteredPeople = people.filter(
    (person) =>
      inView(person) &&
      (channelFilter === "all" || person.channel === channelFilter) &&
      (normalizedQuery.length === 0 ||
        person.name.toLowerCase().includes(normalizedQuery) ||
        person.preview.toLowerCase().includes(normalizedQuery)),
  );

  const visiblePersonIds = new Set(
    people.filter((person) => inView(person)).map((person) => person.id),
  );

  const threadMessages = messages.filter((message) => {
    if (railView === "ignored" || railView === "bots") return false;
    if (message.personId !== "unified" && !visiblePersonIds.has(message.personId))
      return false;
    if (selectedPerson && message.personId !== selectedPerson.id) return false;
    if (channelFilter !== "all" && message.channel !== channelFilter)
      return false;
    return true;
  });

  const channelLabel = activeChannel?.label ?? "All people";
  const meta = railMeta[railView];

  const header = selectedPerson
    ? {
        title: selectedPerson.name,
        subtitle: `${channelById[selectedPerson.channel].label} · ${
          threadMessages.length
        } message${threadMessages.length === 1 ? "" : "s"}`,
        person: selectedPerson,
        channel: null,
      }
    : {
        title: activeChannel?.label ?? meta.title,
        subtitle: activeChannel
          ? `${filteredPeople.length} people · one timeline`
          : meta.subtitle,
        person: null,
        channel: activeChannel,
      };

  const placeholder = selectedPerson
    ? `Reply to ${selectedPerson.name} on ${
        channelById[selectedPerson.channel].label
      }`
    : activeChannel
      ? `Reply in ${activeChannel.label}`
      : "Reply to the unified timeline";

  function handleSelectView(view: RailView) {
    setRailView(view);
    setSelectedPersonId(null);
    setChannelFilter("all");
    setQuery("");
    setMobileThreadOpen(false);
  }

  function handleSelectPerson(personId: string) {
    setSelectedPersonId(personId);
    setMobileThreadOpen(true);
  }

  function handleSelectChannel(channel: ChannelFilter) {
    setRailView("all");
    setChannelFilter(channel);
    setSelectedPersonId(null);
    setChannelsOpen(false);
  }

  function handleToggleReaction(
    messageId: string,
    emoji: string,
    replyId?: string,
  ) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;

        if (replyId) {
          return {
            ...message,
            replies: message.replies?.map((reply) =>
              reply.id === replyId
                ? {
                    ...reply,
                    reactions: toggleReactionList(reply.reactions, emoji),
                  }
                : reply,
            ),
          };
        }

        return {
          ...message,
          reactions: toggleReactionList(message.reactions, emoji),
        };
      }),
    );
  }

  function handleSend(body: string, attachment?: Attachment) {
    const target = selectedPerson;

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        personId: target?.id ?? "unified",
        authorId: "me",
        channel: target?.channel,
        time: formatTime(new Date()),
        body,
        attachment,
      },
    ]);
  }

  function handleViewBanner() {
    setRailView("all");
    setChannelFilter("telegram");
    setSelectedPersonId(storyBanner.personId);
    setBannerVisible(false);
    setChannelsOpen(false);
    setMobileThreadOpen(true);
  }

  return (
    <div className="grid h-dvh grid-cols-[56px_1fr] overflow-hidden bg-background text-foreground md:grid-cols-[64px_320px_minmax(0,1fr)] xl:grid-cols-[64px_320px_minmax(0,1fr)_272px]">
      <AppRail activeView={railView} onSelect={handleSelectView} />

      <div
        className={cn(
          "min-h-0 min-w-0 flex-col",
          mobileThreadOpen ? "hidden md:flex" : "flex",
        )}
      >
        <ConversationList
          people={filteredPeople}
          selectedPersonId={selectedPersonId}
          query={query}
          onQueryChange={setQuery}
          onSelect={handleSelectPerson}
          onOpenChannels={() => setChannelsOpen(true)}
          summary={`${channelLabel} · ${filteredPeople.length}`}
        />
      </div>

      <div
        className={cn(
          "min-h-0 min-w-0 flex-col",
          mobileThreadOpen ? "flex" : "hidden md:flex",
        )}
      >
        <ThreadPanel
          title={header.title}
          subtitle={header.subtitle}
          person={header.person}
          channel={header.channel}
          messages={threadMessages}
          suggestions={suggestedReplies}
          banner={
            bannerVisible && railView !== "ignored" && railView !== "bots"
              ? storyBanner
              : null
          }
          placeholder={placeholder}
          onDismissBanner={() => setBannerVisible(false)}
          onViewBanner={handleViewBanner}
          onToggleReaction={handleToggleReaction}
          onSend={handleSend}
          onOpenChannels={() => setChannelsOpen(true)}
          onBack={() => setMobileThreadOpen(false)}
        />
      </div>

      <div className="hidden min-h-0 border-l border-border xl:flex">
        <ChannelSidebar
          activeChannel={channelFilter}
          onSelect={handleSelectChannel}
        />
      </div>

      {channelsOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close channels"
            onClick={() => setChannelsOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Channels"
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-surface-alt shadow-2xl"
          >
            <ChannelSidebar
              activeChannel={channelFilter}
              onSelect={handleSelectChannel}
              showClose
              onClose={() => setChannelsOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
