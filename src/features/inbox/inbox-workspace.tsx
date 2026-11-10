"use client";

import { useEffect, useState } from "react";

import { AppRail } from "@/features/inbox/components/app-rail";
import { ChannelSidebar } from "@/features/inbox/components/channel-sidebar";
import { ChannelsManager } from "@/features/inbox/components/channels-manager";
import { CommandPalette } from "@/features/inbox/components/command-palette";
import { ConversationList } from "@/features/inbox/components/conversation-list";
import { SettingsDashboard } from "@/features/inbox/components/settings-dashboard";
import { ThreadPanel } from "@/features/inbox/components/thread-panel";
import { UserDetailsModal } from "@/features/inbox/components/user-details-modal";
import {
  channelById,
  initialChannels,
  initialMessages,
  initialPeople,
  storyBanner,
  suggestedReplies,
} from "@/features/inbox/data";
import {
  loadStoredApiKeys,
  loadStoredChannels,
  loadStoredMessages,
  loadStoredPeople,
  loadStoredSettings,
  loadStoredWebhookEvents,
  saveStoredApiKeys,
  saveStoredChannels,
  saveStoredMessages,
  saveStoredPeople,
  saveStoredSettings,
  saveStoredWebhookEvents,
} from "@/features/inbox/storage";
import type {
  ApiKeyItem,
  Attachment,
  ChannelConnection,
  ChannelFilter,
  ChannelId,
  ConversationPriority,
  ConversationStatus,
  Message,
  Person,
  QuotedMessage,
  RailView,
  Reaction,
  WebhookEventItem,
  WorkspaceSettings,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const railMeta: Record<RailView, { title: string; subtitle: string }> = {
  all: { title: "All messages", subtitle: "5 channels, one unified inbox" },
  priority: {
    title: "Priority",
    subtitle: "Starred and urgent messages",
  },
  tagify: { title: "Tagify", subtitle: "Tagged messages across channels" },
  ignored: {
    title: "Ignored",
    subtitle: "Muted conversations stay out of the way",
  },
  bots: { title: "Bots", subtitle: "Automated assistants and incoming bots" },
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

  const [channelList, setChannelList] = useState<ChannelConnection[]>(() => {
    const stored = loadStoredChannels();
    return stored.length ? stored : initialChannels;
  });
  const [peopleList, setPeopleList] = useState<Person[]>(() => {
    const stored = loadStoredPeople();
    return stored.length ? stored : initialPeople;
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = loadStoredMessages();
    return stored.length ? stored : initialMessages;
  });
  const [settings, setSettings] = useState<WorkspaceSettings>(loadStoredSettings);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(loadStoredApiKeys);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventItem[]>(loadStoredWebhookEvents);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    saveStoredChannels(channelList);
  }, [channelList]);

  useEffect(() => {
    saveStoredPeople(peopleList);
  }, [peopleList]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredApiKeys(apiKeys);
  }, [apiKeys]);

  useEffect(() => {
    saveStoredWebhookEvents(webhookEvents);
  }, [webhookEvents]);

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedPerson =
    peopleList.find((person) => person.id === selectedPersonId) ?? null;
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

  const channelPriorityMap = new Map(
    channelList.map((ch, idx) => [ch.id, idx]),
  );

  const filteredPeople = peopleList
    .filter(
      (person) =>
        inView(person) &&
        (channelFilter === "all" || person.channel === channelFilter) &&
        (normalizedQuery.length === 0 ||
          person.name.toLowerCase().includes(normalizedQuery) ||
          person.preview.toLowerCase().includes(normalizedQuery)),
    )
    .sort((a, b) => {
      if (channelFilter === "all") {
        const priorityA = channelPriorityMap.get(a.channel) ?? 999;
        const priorityB = channelPriorityMap.get(b.channel) ?? 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      }
      return 0;
    });

  const visiblePersonIds = new Set(
    peopleList.filter((person) => inView(person)).map((person) => person.id),
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

  const channelLabel = activeChannel?.label ?? "All channels";
  const meta = railMeta[railView];

  const header = selectedPerson
    ? {
        title: selectedPerson.name,
        subtitle: `${channelById[selectedPerson.channel]?.label ?? "Chat"} · ${
          threadMessages.length
        } message${threadMessages.length === 1 ? "" : "s"}`,
        person: selectedPerson,
        channel: null,
      }
    : {
        title: activeChannel?.label ?? meta.title,
        subtitle: activeChannel
          ? `${filteredPeople.length} people · one unified inbox`
          : meta.subtitle,
        person: null,
        channel: activeChannel,
      };

  const placeholder = selectedPerson
    ? `Reply to ${selectedPerson.name} on ${
        channelById[selectedPerson.channel]?.label ?? "Chat"
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

  function handleSend(data: {
    body: string;
    attachment?: Attachment;
    replyTo?: QuotedMessage;
    tags?: string[];
    translation?: string;
  }) {
    const target = selectedPerson;

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        personId: target?.id ?? "unified",
        authorId: "me",
        channel: target?.channel,
        time: formatTime(new Date()),
        body: data.body,
        attachment: data.attachment,
        replyTo: data.replyTo,
        tags: data.tags,
        translation: data.translation,
      },
    ]);

    if (target) {
      setPeopleList((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? { ...p, preview: data.body, time: "Just now" }
            : p,
        ),
      );
    }
  }

  function handleViewBanner() {
    setRailView("all");
    setChannelFilter("telegram");
    setSelectedPersonId(storyBanner.personId);
    setBannerVisible(false);
    setChannelsOpen(false);
    setMobileThreadOpen(true);
  }

  function handleSimulateInboundWebhook(channel: ChannelId) {
    const now = new Date();
    const timeStr = `${now.getHours() % 12 || 12}:${String(
      now.getMinutes(),
    ).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

    const newEvent: WebhookEventItem = {
      id: `evt_${Date.now()}`,
      channel,
      event: `${channel}.message_received`,
      timestamp: timeStr,
      payload: `{"channel":"${channel}","event":"inbound_message","status":"processed"}`,
      status: "delivered",
    };

    setWebhookEvents((prev) => [newEvent, ...prev.slice(0, 20)]);

    if (selectedPerson) {
      setMessages((prev) => [
        ...prev,
        {
          id: `wh-msg-${Date.now()}`,
          personId: selectedPerson.id,
          authorId: selectedPerson.id,
          channel,
          time: timeStr,
          body: `[Inbound message via ${channel}] Update received from customer.`,
        },
      ]);
    }
  }

  function handleUpdateStatus(personId: string, status: ConversationStatus) {
    setPeopleList((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, status } : p)),
    );
  }

  function handleUpdatePriority(
    personId: string,
    ticketPriority: ConversationPriority,
  ) {
    setPeopleList((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, ticketPriority } : p)),
    );
  }

  return (
    <div className="grid h-dvh grid-cols-[56px_1fr] overflow-hidden bg-background text-foreground md:grid-cols-[64px_320px_minmax(0,1fr)] xl:grid-cols-[64px_320px_minmax(0,1fr)_272px]">
      {/* 1st part: Left Rail Sidebar */}
      <AppRail activeView={railView} onSelect={handleSelectView} />

      {/* 2nd part: Chat List (Conversations) */}
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

      {/* 3rd part: Chat Thread (Messages, Replies, Composer) */}
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
          onOpenUserDetails={() => setUserDetailsModalOpen(true)}
          onBack={() => setMobileThreadOpen(false)}
        />
      </div>

      {/* 4th part (on the right): All Connected Channels */}
      <div className="hidden min-h-0 border-l border-border xl:flex">
        <ChannelSidebar
          channels={channelList}
          activeChannel={channelFilter}
          onSelect={handleSelectChannel}
          onReorderChannels={(reordered) => setChannelList(reordered)}
        />
      </div>

      {/* Mobile Drawer for Connected Channels */}
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
              channels={channelList}
              activeChannel={channelFilter}
              onSelect={handleSelectChannel}
              onReorderChannels={(reordered) => setChannelList(reordered)}
              showClose
              onClose={() => setChannelsOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* User Details Modal (opens when clicking the user header) */}
      <UserDetailsModal
        person={selectedPerson}
        isOpen={userDetailsModalOpen}
        onClose={() => setUserDetailsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
      />

      {/* Integrations Modal (Webhooks, API keys) */}
      {showIntegrationsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="relative h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <button
              type="button"
              onClick={() => setShowIntegrationsModal(false)}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              ✕
            </button>
            <ChannelsManager
              channels={channelList}
              apiKeys={apiKeys}
              webhookEvents={webhookEvents}
              onUpdateChannels={setChannelList}
              onUpdateApiKeys={setApiKeys}
              onSimulateWebhook={handleSimulateInboundWebhook}
            />
          </div>
        </div>
      ) : null}

      {/* Settings Modal */}
      {showSettingsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="relative h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              ✕
            </button>
            <SettingsDashboard
              settings={settings}
              onSaveSettings={setSettings}
            />
          </div>
        </div>
      ) : null}

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          if (tab === "channels") setShowIntegrationsModal(true);
          else if (tab === "settings") setShowSettingsModal(true);
          setCommandPaletteOpen(false);
        }}
        onSelectChannelFilter={(ch) => {
          setChannelFilter(ch as ChannelFilter);
          setCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}
