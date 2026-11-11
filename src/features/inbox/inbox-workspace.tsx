"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ChannelSidebar } from "@/features/inbox/components/channel-sidebar";
import { ChannelsManager } from "@/features/inbox/components/channels-manager";
import { CommandPalette } from "@/features/inbox/components/command-palette";
import { ConversationList } from "@/features/inbox/components/conversation-list";
import { CopilotPanel } from "@/features/inbox/components/copilot-panel";
import { PrimaryNav } from "@/features/inbox/components/primary-nav";
import { SettingsDashboard } from "@/features/inbox/components/settings-dashboard";
import { ThreadPanel } from "@/features/inbox/components/thread-panel";
import { UserDetailsModal } from "@/features/inbox/components/user-details-modal";
import { ActivityModule } from "@/features/inbox/components/modules/activity-module";
import { AgentDeskModule } from "@/features/inbox/components/modules/agent-desk-module";
import { AnalyticsModule } from "@/features/inbox/components/modules/analytics-module";
import { BillingModule } from "@/features/inbox/components/modules/billing-module";
import { BroadcastsModule } from "@/features/inbox/components/modules/broadcasts-module";
import { BusinessModule } from "@/features/inbox/components/modules/business-module";
import { CommentsModule } from "@/features/inbox/components/modules/comments-module";
import { FollowupsModule } from "@/features/inbox/components/modules/followups-module";
import { GroupsModule } from "@/features/inbox/components/modules/groups-module";
import { KnowledgeModule } from "@/features/inbox/components/modules/knowledge-module";
import { LeadsModule } from "@/features/inbox/components/modules/leads-module";
import { NotificationsModule } from "@/features/inbox/components/modules/notifications-module";
import { OrdersModule } from "@/features/inbox/components/modules/orders-module";
import { OverviewModule } from "@/features/inbox/components/modules/overview-module";
import { PostsModule } from "@/features/inbox/components/modules/posts-module";
import { ProductsModule } from "@/features/inbox/components/modules/products-module";
import { SavedRepliesModule } from "@/features/inbox/components/modules/saved-replies-module";
import { SetupModule } from "@/features/inbox/components/modules/setup-module";
import { TeamModule } from "@/features/inbox/components/modules/team-module";
import { WebsiteChatModule } from "@/features/inbox/components/modules/website-chat-module";
import {
  channelById,
  handoffReasonLabels,
  initialActivity,
  initialChannels,
  initialLeads,
  initialMessages,
  initialNotifications,
  initialOrders,
  initialPeople,
  initialSavedReplies,
  initialSetup,
  storyBanner,
  suggestedReplies,
} from "@/features/inbox/data";
import {
  MODULE_STORAGE_KEYS,
  loadStored,
  loadStoredApiKeys,
  loadStoredChannels,
  loadStoredMessages,
  loadStoredPeople,
  loadStoredSettings,
  loadStoredWebhookEvents,
  saveStored,
  saveStoredApiKeys,
  saveStoredChannels,
  saveStoredMessages,
  saveStoredPeople,
  saveStoredSettings,
  saveStoredWebhookEvents,
  useStoredState,
} from "@/features/inbox/storage";
import type {
  ActivityEntry,
  ActivitySource,
  ApiKeyItem,
  Attachment,
  ChannelConnection,
  ChannelFilter,
  ChannelId,
  ConversationPriority,
  ConversationStatus,
  HandoffReason,
  Lead,
  Message,
  ModuleId,
  NotificationItem,
  Person,
  QuotedMessage,
  RailView,
  Reaction,
  SavedReply,
  SetupState,
  WebhookEventItem,
  WorkspaceSettings,
} from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const moduleIds: ModuleId[] = [
  "overview",
  "inbox",
  "saved-replies",
  "comments",
  "notifications",
  "activity",
  "analytics",
  "leads",
  "orders",
  "followups",
  "broadcasts",
  "products",
  "posts",
  "agent-desk",
  "knowledge",
  "setup",
  "channels",
  "website",
  "business",
  "team",
  "groups",
  "billing",
  "settings",
];

const railMeta: Record<RailView, { title: string; subtitle: string }> = {
  all: { title: "All messages", subtitle: "9 channels, one unified inbox" },
  priority: { title: "Priority", subtitle: "Starred and urgent messages" },
  tagify: { title: "Tagify", subtitle: "Tagged messages across channels" },
  ignored: { title: "Ignored", subtitle: "Muted conversations stay out of the way" },
  bots: { title: "Bots", subtitle: "Automated assistants and incoming bots" },
};

function parseHash(hash: string): ModuleId {
  const value = hash.replace(/^#\/?/, "") as ModuleId;
  return moduleIds.includes(value) ? value : "inbox";
}

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
  const [activeModule, setActiveModule] = useState<ModuleId>(() =>
    typeof window === "undefined" ? "inbox" : parseHash(window.location.hash),
  );
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

  const [activity, setActivity] = useStoredState<ActivityEntry[]>(
    MODULE_STORAGE_KEYS.activity,
    initialActivity,
  );
  const [notifications, setNotifications] = useStoredState<NotificationItem[]>(
    MODULE_STORAGE_KEYS.notifications,
    initialNotifications,
  );
  const [leads, setLeads] = useStoredState<Lead[]>(MODULE_STORAGE_KEYS.leads, initialLeads);
  const [savedReplies, setSavedReplies] = useStoredState<SavedReply[]>(
    MODULE_STORAGE_KEYS.savedReplies,
    initialSavedReplies,
  );
  const [setup, setSetup] = useStoredState<SetupState>(MODULE_STORAGE_KEYS.setup, initialSetup);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [insertion, setInsertion] = useState<{ text: string; nonce: number } | undefined>();

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
    function onHashChange() {
      setActiveModule(parseHash(window.location.hash));
      setNavOpen(false);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!channelsOpen && !navOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setChannelsOpen(false);
        setNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [channelsOpen, navOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const logActivity = useCallback(
    (action: string, subject: string, source: ActivitySource = "dashboard") => {
      setActivity((current) => [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          atMs: Date.now(),
          actor: "You",
          action,
          subject,
          source,
        },
        ...current,
      ]);
    },
    [setActivity],
  );

  const pushNotification = useCallback(
    (input: { kind: NotificationItem["kind"]; title: string; body: string }) => {
      setNotifications((current) => [
        {
          id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: input.kind,
          title: input.title,
          body: input.body,
          atMs: Date.now(),
          done: false,
        },
        ...current,
      ]);
    },
    [setNotifications],
  );

  const selectedPerson =
    peopleList.find((person) => person.id === selectedPersonId) ?? null;
  const activeChannel = channelFilter === "all" ? null : channelById[channelFilter];
  const normalizedQuery = query.trim().toLowerCase();

  const inView = useCallback(
    (person: Person) => {
      switch (railView) {
        case "priority":
          return person.priority === true;
        case "tagify":
          return messages.some(
            (message) => message.personId === person.id && (message.tags?.length ?? 0) > 0,
          );
        case "ignored":
        case "bots":
          return false;
        default:
          return true;
      }
    },
    [messages, railView],
  );

  const channelPriorityMap = useMemo(
    () => new Map(channelList.map((channel, index) => [channel.id, index])),
    [channelList],
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
        return priorityA - priorityB;
      }
      return 0;
    });

  const visiblePersonIds = new Set(
    peopleList.filter((person) => inView(person)).map((person) => person.id),
  );

  const threadMessages = messages.filter((message) => {
    if (selectedPerson) return message.personId === selectedPerson.id;
    if (railView === "ignored" || railView === "bots") return false;
    if (message.personId !== "unified" && !visiblePersonIds.has(message.personId)) return false;
    if (channelFilter !== "all" && message.channel !== channelFilter) return false;
    return true;
  });

  const mode = selectedPerson?.mode ?? "ai";
  const revertAtMs = selectedPerson?.revertAtMs;
  const handoffReason = selectedPerson?.handoff?.reason;

  const header = selectedPerson
    ? {
        title: selectedPerson.name,
        subtitle: `${channelById[selectedPerson.channel]?.label ?? "Chat"} · ${threadMessages.length} message${
          threadMessages.length === 1 ? "" : "s"
        }`,
        person: selectedPerson,
        channel: null,
      }
    : {
        title: activeChannel?.label ?? railMeta[railView].title,
        subtitle: activeChannel
          ? `${filteredPeople.length} people · one unified inbox`
          : railMeta[railView].subtitle,
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

  /* ── Navigation ───────────────────────────────────────────────────── */

  function navigate(module: ModuleId) {
    setActiveModule(module);
    setNavOpen(false);
    setChannelsOpen(false);
    setMobileThreadOpen(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${module}`);
    }
  }

  function handleSelectPerson(personId: string) {
    setSelectedPersonId(personId);
    setMobileThreadOpen(true);
  }

  function handleSelectView(view: RailView) {
    setRailView(view);
    setSelectedPersonId(null);
    setChannelFilter("all");
    setQuery("");
    setMobileThreadOpen(false);
  }

  function handleSelectChannel(channel: ChannelFilter) {
    setRailView("all");
    setChannelFilter(channel);
    setSelectedPersonId(null);
    setChannelsOpen(false);
  }

  /* ── Conversation model ───────────────────────────────────────────── */

  const handoff = useCallback(
    (person: Person, reason: HandoffReason) => {
      const revertAt = Date.now() + settings.autoRevertWindowMin * 60_000;
      setPeopleList((current) =>
        current.map((item) =>
          item.id === person.id
            ? {
                ...item,
                mode: "human",
                handoff: { reason, atMs: Date.now() },
                revertAtMs: revertAt,
                claimedBy: item.claimedBy,
              }
            : item,
        ),
      );
      logActivity(
        `handed ${person.name} to a human · ${handoffReasonLabels[reason]}`,
        person.name,
        "ai",
      );
      pushNotification({
        kind: "waiting",
        title: `${person.name} needs a human`,
        body: `AI handed off · ${handoffReasonLabels[reason]}. Reverts to AI in ${settings.autoRevertWindowMin}m if unanswered.`,
      });
    },
    [logActivity, pushNotification, setPeopleList, settings.autoRevertWindowMin],
  );

  const claim = useCallback(
    (person: Person) => {
      const revertAt = Date.now() + settings.autoRevertWindowMin * 60_000;
      setPeopleList((current) =>
        current.map((item) =>
          item.id === person.id
            ? { ...item, mode: "human", claimedBy: "You", revertAtMs: revertAt }
            : item,
        ),
      );
      logActivity(`claimed ${person.name}`, person.name);
    },
    [logActivity, setPeopleList, settings.autoRevertWindowMin],
  );

  const takeOver = useCallback(
    (person: Person) => {
      const revertAt = Date.now() + settings.autoRevertWindowMin * 60_000;
      setPeopleList((current) =>
        current.map((item) =>
          item.id === person.id
            ? {
                ...item,
                mode: "human",
                claimedBy: "You",
                handoff: { reason: "asked-for-human", atMs: Date.now() },
                revertAtMs: revertAt,
              }
            : item,
        ),
      );
      logActivity(`took over ${person.name} with the "." shortcut`, person.name);
    },
    [logActivity, setPeopleList, settings.autoRevertWindowMin],
  );

  const returnToAi = useCallback(
    (person: Person) => {
      setPeopleList((current) =>
        current.map((item) =>
          item.id === person.id
            ? {
                ...item,
                mode: "ai",
                handoff: undefined,
                revertAtMs: undefined,
                claimedBy: undefined,
              }
            : item,
        ),
      );
      logActivity(`returned ${person.name} to the AI`, person.name);
    },
    [logActivity, setPeopleList],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const expired = peopleList.filter(
        (person) =>
          (person.mode === "human" || person.mode === "reverting") &&
          typeof person.revertAtMs === "number" &&
          person.revertAtMs <= Date.now(),
      );
      if (expired.length === 0) return;

      setPeopleList((current) =>
        current.map((person) =>
          expired.some((item) => item.id === person.id)
            ? {
                ...person,
                mode: "ai",
                handoff: undefined,
                revertAtMs: undefined,
                claimedBy: undefined,
              }
            : person,
        ),
      );
      expired.forEach((person) =>
        logActivity(`auto-reverted ${person.name} to the AI`, person.name, "auto-revert"),
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [peopleList, logActivity, setPeopleList]);

  /* ── Inbox actions ────────────────────────────────────────────────── */

  function handleToggleReaction(messageId: string, emoji: string, replyId?: string) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;
        if (replyId) {
          return {
            ...message,
            replies: message.replies?.map((reply) =>
              reply.id === replyId
                ? { ...reply, reactions: toggleReactionList(reply.reactions, emoji) }
                : reply,
            ),
          };
        }
        return { ...message, reactions: toggleReactionList(message.reactions, emoji) };
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
    if (target && mode === "reverting") {
      setPeopleList((current) =>
        current.map((person) =>
          person.id === target.id ? { ...person, mode: "ai" } : person,
        ),
      );
    }

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
        authorType: "agent",
      },
    ]);

    if (target) {
      const answering = target.mode !== "human";
      setPeopleList((current) =>
        current.map((person) =>
          person.id === target.id
            ? {
                ...person,
                preview: data.body,
                time: "Just now",
                waitingSinceMs: undefined,
                unreadCount: 0,
                mode: "human",
                claimedBy: person.claimedBy ?? "You",
                revertAtMs:
                  person.revertAtMs ??
                  Date.now() + settings.autoRevertWindowMin * 60_000,
              }
            : person,
        ),
      );
      if (answering) {
        logActivity(`answered ${target.name} from the dashboard`, target.name, "answered");
      }
    }
  }

  function handleViewBanner() {
    setRailView("all");
    setChannelFilter("telegram");
    setSelectedPersonId(storyBanner.personId);
    setBannerVisible(false);
    setChannelsOpen(false);
    setMobileThreadOpen(true);
    navigate("inbox");
  }

  function handleSimulateInboundWebhook(channel: ChannelId) {
    const now = new Date();
    const timeStr = formatTime(now);

    setWebhookEvents((prev) => [
      {
        id: `evt_${Date.now()}`,
        channel,
        event: `${channel}.message_received`,
        timestamp: timeStr,
        payload: `{"channel":"${channel}","event":"inbound_message","status":"processed"}`,
        status: "delivered",
      },
      ...prev.slice(0, 20),
    ]);

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
          authorType: "customer",
        },
      ]);
    }
    logActivity(`simulated an inbound ${channel} webhook`, "Webhooks", "channel");
  }

  function handleUpdateStatus(personId: string, status: ConversationStatus) {
    setPeopleList((prev) => prev.map((p) => (p.id === personId ? { ...p, status } : p)));
    logActivity(`changed status to ${status}`, personId);
  }

  function handleUpdatePriority(personId: string, ticketPriority: ConversationPriority) {
    setPeopleList((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, ticketPriority } : p)),
    );
    logActivity(`set priority to ${ticketPriority}`, personId);
  }

  function createLeadFromCopilot() {
    if (!selectedPerson) return;
    if (leads.some((lead) => lead.name === selectedPerson.name)) {
      logActivity(`${selectedPerson.name} is already in Leads`, "Leads");
      return;
    }
    setLeads((current) => [
      {
        id: `lead-${Date.now()}`,
        name: selectedPerson.name,
        phone: selectedPerson.phone ?? "—",
        channel: selectedPerson.channel,
        value: 0,
        stage: "new",
        source: "AI copilot · inbox",
        createdAt: "Just now",
      },
      ...current,
    ]);
    logActivity(`captured ${selectedPerson.name} as a lead from the copilot`, "Leads");
    pushNotification({
      kind: "order",
      title: `Lead captured · ${selectedPerson.name}`,
      body: "Added to the Leads pipeline from the inbox copilot.",
    });
  }

  function createOrderFromCopilot() {
    if (!selectedPerson) return;
    const stored = loadStored(MODULE_STORAGE_KEYS.orders, initialOrders);
    saveStored(MODULE_STORAGE_KEYS.orders, [
      {
        id: `ord-${Date.now()}`,
        code: `#ORD-${String(9200 + Math.floor(Math.random() * 700))}`,
        customer: selectedPerson.name,
        phone: selectedPerson.phone ?? "—",
        channel: selectedPerson.channel,
        items: "Draft from conversation",
        total: 0,
        cod: true,
        stage: "new",
        createdAt: "Just now",
      },
      ...stored,
    ]);
    logActivity(`drafted an order for ${selectedPerson.name}`, "Orders");
    pushNotification({
      kind: "order",
      title: `Order draft · ${selectedPerson.name}`,
      body: "Draft created from the conversation. Open Orders to add items and totals.",
    });
  }

  const setupDone = setup.steps.filter((step) => step.done).length;
  const setupTotal = setup.steps.length;
  const openConversations = peopleList.filter((person) => person.status === "open").length;
  const notificationsWaiting = notifications.filter((item) => !item.done).length;

  /* ── Module router ────────────────────────────────────────────────── */

  function renderModule() {
    switch (activeModule) {
      case "overview":
        return (
          <OverviewModule
            people={peopleList}
            channels={channelList}
            notifications={notifications}
            activity={activity}
            setupDone={setupDone}
            setupTotal={setupTotal}
            practiceMode={setup.practiceMode}
            slaTargetMin={settings.slaTargetMin}
            onNavigate={navigate}
            onSelectPerson={(personId) => {
              navigate("inbox");
              handleSelectPerson(personId);
            }}
          />
        );
      case "saved-replies":
        return <SavedRepliesModule replies={savedReplies} onUpdate={setSavedReplies} />;
      case "comments":
        return <CommentsModule logActivity={logActivity} />;
      case "notifications":
        return (
          <NotificationsModule
            notifications={notifications}
            onMarkDone={(id) =>
              setNotifications((current) =>
                current.map((item) => (item.id === id ? { ...item, done: true } : item)),
              )
            }
            onReopen={(id) =>
              setNotifications((current) =>
                current.map((item) => (item.id === id ? { ...item, done: false } : item)),
              )
            }
            onSelectPerson={(personId) => {
              navigate("inbox");
              handleSelectPerson(personId);
            }}
          />
        );
      case "activity":
        return <ActivityModule entries={activity} />;
      case "analytics":
        return (
          <AnalyticsModule
            people={peopleList}
            messages={messages}
            activity={activity}
            channels={channelList}
            slaTargetMin={settings.slaTargetMin}
          />
        );
      case "leads":
        return (
          <LeadsModule
            leads={leads}
            onUpdate={(next) => setLeads(next)}
            logActivity={logActivity}
          />
        );
      case "orders":
        return <OrdersModule logActivity={logActivity} />;
      case "followups":
        return <FollowupsModule logActivity={logActivity} />;
      case "broadcasts":
        return (
          <BroadcastsModule logActivity={logActivity} pushNotification={pushNotification} />
        );
      case "products":
        return <ProductsModule logActivity={logActivity} />;
      case "posts":
        return <PostsModule logActivity={logActivity} />;
      case "agent-desk":
        return <AgentDeskModule logActivity={logActivity} />;
      case "knowledge":
        return <KnowledgeModule logActivity={logActivity} />;
      case "setup":
        return (
          <SetupModule
            setup={setup}
            onUpdate={setSetup}
            onGoLive={() => {
              setSetup({ ...setup, practiceMode: false, liveSince: "Just now" });
              logActivity("went live — practice mode off, trial started", "Setup guide");
              pushNotification({
                kind: "system",
                title: "You are live",
                body: "Practice mode is off. Every connected channel is now answering real customers.",
              });
            }}
            onNavigate={navigate}
          />
        );
      case "channels":
        return (
          <div className="h-full min-h-0 overflow-hidden">
            <ChannelsManager
              channels={channelList}
              apiKeys={apiKeys}
              webhookEvents={webhookEvents}
              onUpdateChannels={setChannelList}
              onUpdateApiKeys={setApiKeys}
              onSimulateWebhook={handleSimulateInboundWebhook}
              onLogActivity={logActivity}
            />
          </div>
        );
      case "website":
        return <WebsiteChatModule logActivity={logActivity} />;
      case "business":
        return <BusinessModule logActivity={logActivity} />;
      case "team":
        return <TeamModule logActivity={logActivity} />;
      case "groups":
        return <GroupsModule logActivity={logActivity} />;
      case "billing":
        return <BillingModule logActivity={logActivity} />;
      case "settings":
        return (
          <div className="h-full min-h-0 overflow-hidden">
            <SettingsDashboard
              settings={settings}
              onSaveSettings={(next) => {
                setSettings(next);
                logActivity("updated workspace settings", "Workspace settings");
              }}
            />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex">
        <PrimaryNav
          activeModule={activeModule}
          onNavigate={navigate}
          openConversations={openConversations}
          notificationsWaiting={notificationsWaiting}
          setupDone={setupDone}
          setupTotal={setupTotal}
          practiceMode={setup.practiceMode}
          onOpenPalette={() => setCommandPaletteOpen(true)}
        />
      </div>

      {navOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex h-full w-[236px] max-w-[85vw] flex-col">
            <PrimaryNav
              activeModule={activeModule}
              onNavigate={navigate}
              openConversations={openConversations}
              notificationsWaiting={notificationsWaiting}
              setupDone={setupDone}
              setupTotal={setupTotal}
              practiceMode={setup.practiceMode}
              onOpenPalette={() => setCommandPaletteOpen(true)}
            />
          </div>
        </div>
      ) : null}

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {activeModule === "inbox" ? (
          <div className="flex h-full min-h-0">
            <div
              className={cn(
                "min-h-0 w-full min-w-0 flex-col lg:flex lg:w-[320px] lg:shrink-0",
                mobileThreadOpen ? "hidden lg:flex" : "flex",
              )}
            >
              <ConversationList
                people={filteredPeople}
                selectedPersonId={selectedPersonId}
                query={query}
                onQueryChange={setQuery}
                onSelect={handleSelectPerson}
                onOpenChannels={() => setChannelsOpen(true)}
                onOpenNav={() => setNavOpen(true)}
                view={railView}
                onViewChange={handleSelectView}
                slaTargetMin={settings.slaTargetMin}
                summary={`${
                  channelFilter === "all" ? "All channels" : activeChannel?.label ?? ""
                } · ${filteredPeople.length}`}
              />
            </div>

            <div
              className={cn(
                "min-h-0 min-w-0 flex-1 flex-col",
                mobileThreadOpen ? "flex" : "hidden lg:flex",
              )}
            >
              <ThreadPanel
                title={header.title}
                subtitle={header.subtitle}
                person={header.person}
                channel={header.channel}
                messages={threadMessages}
                suggestions={suggestedReplies}
                savedReplies={savedReplies}
                banner={
                  bannerVisible && railView !== "ignored" && railView !== "bots"
                    ? storyBanner
                    : null
                }
                placeholder={placeholder}
                mode={mode}
                handoffReason={handoffReason}
                revertAtMs={revertAtMs}
                insertion={insertion}
                onDismissBanner={() => setBannerVisible(false)}
                onViewBanner={handleViewBanner}
                onToggleReaction={handleToggleReaction}
                onSend={handleSend}
                onOpenChannels={() => setChannelsOpen(true)}
                onOpenUserDetails={() => setUserDetailsModalOpen(true)}
                onBack={() => setMobileThreadOpen(false)}
                onHandoff={(reason) => {
                  if (selectedPerson) handoff(selectedPerson, reason);
                }}
                onClaim={() => {
                  if (selectedPerson) claim(selectedPerson);
                }}
                onReturnToAi={() => {
                  if (selectedPerson) returnToAi(selectedPerson);
                }}
                onTakeover={() => {
                  if (selectedPerson) takeOver(selectedPerson);
                }}
                onOpenCopilot={() => setCopilotOpen(true)}
              />
            </div>

            <div className="hidden min-h-0 w-[240px] shrink-0 border-l border-border xl:flex">
              <ChannelSidebar
                channels={channelList}
                activeChannel={channelFilter}
                onSelect={handleSelectChannel}
                onReorderChannels={setChannelList}
                onConnect={() => navigate("channels")}
              />
            </div>
          </div>
        ) : (
          renderModule()
        )}
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
              channels={channelList}
              activeChannel={channelFilter}
              onSelect={handleSelectChannel}
              onReorderChannels={setChannelList}
              onConnect={() => {
                setChannelsOpen(false);
                navigate("channels");
              }}
              showClose
              onClose={() => setChannelsOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {copilotOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Dismiss copilot"
            onClick={() => setCopilotOpen(false)}
            className="absolute inset-0 bg-black/30 lg:bg-black/10"
          />
          <div className="relative h-full w-[320px] max-w-[90vw] shadow-2xl">
            <CopilotPanel
              person={selectedPerson}
              messages={threadMessages}
              savedReplies={savedReplies}
              onClose={() => setCopilotOpen(false)}
              onInsert={(text) =>
                setInsertion({ text, nonce: Date.now() })
              }
              onCreateLead={createLeadFromCopilot}
              onCreateOrder={createOrderFromCopilot}
            />
          </div>
        </div>
      ) : null}

      <UserDetailsModal
        person={selectedPerson}
        isOpen={userDetailsModalOpen}
        onClose={() => setUserDetailsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={navigate}
        onSelectChannelFilter={(channel) => {
          setChannelFilter(channel as ChannelFilter);
          navigate("inbox");
        }}
      />
    </div>
  );
}
