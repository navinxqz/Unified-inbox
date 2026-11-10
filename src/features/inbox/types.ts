export type ChannelId =
  | "slack"
  | "whatsapp"
  | "email"
  | "messenger"
  | "telegram";

export type ChannelStatus = "connected" | "disconnected" | "syncing" | "error";

export type ChannelConnection = {
  id: ChannelId;
  label: string;
  short: string;
  color: string;
  soft: string;
  softForeground: string;
  count: number;
  status: ChannelStatus;
  accountHandle: string;
  webhookUrl: string;
  apiKeyMasked: string;
  lastSyncedAt: string;
  enabled: boolean;
  priorityOrder: number;
};

export type Channel = ChannelConnection;

export type AvatarPalette = {
  background: string;
  color: string;
};

export type ConversationStatus = "open" | "pending" | "resolved";
export type ConversationPriority = "low" | "medium" | "high" | "urgent";

export type Person = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  planTier?: "Free" | "Starter" | "Growth" | "Enterprise";
  initials: string;
  channel: ChannelId;
  avatar: AvatarPalette;
  preview: string;
  time: string;
  priority?: boolean;
  ticketPriority?: ConversationPriority;
  status?: ConversationStatus;
  assignee?: string;
  unreadCount?: number;
};

export type Author = Pick<Person, "id" | "name" | "initials" | "avatar">;

export type Reaction = {
  emoji: string;
  count: number;
  reacted?: boolean;
};

export type Attachment = {
  name: string;
  size: string;
  url?: string;
};

export type QuotedMessage = {
  id: string;
  authorName: string;
  body: string;
};

export type Reply = {
  id: string;
  authorId: string;
  time: string;
  body: string;
  reactions?: Reaction[];
  replyTo?: QuotedMessage;
};

export type Message = {
  id: string;
  personId: string;
  authorId: string;
  channel?: ChannelId;
  time: string;
  body: string;
  translation?: string;
  tags?: string[];
  reactions?: Reaction[];
  attachment?: Attachment;
  replies?: Reply[];
  replyTo?: QuotedMessage;
};

export type RailView = "all" | "priority" | "tagify" | "ignored" | "bots";
export type NavigationTab = "inbox" | "channels" | "settings";
export type ChannelFilter = ChannelId | "all";

export type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string;
};

export type WebhookEventItem = {
  id: string;
  channel: ChannelId;
  event: string;
  timestamp: string;
  payload: string;
  status: "delivered" | "failed";
};

export type WorkspaceSettings = {
  workspaceName: string;
  workspaceSlug: string;
  companyDomain: string;
  supportEmail: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  density: "compact" | "comfortable";
  enableAiSuggestions: boolean;
  enableAutoTranslation: boolean;
  defaultTranslateLanguage: string;
  autoResolveAfterDays: number;
  notificationSounds: boolean;
  desktopNotifications: boolean;
  emailDigest: "instant" | "daily" | "weekly" | "off";
  customTags: Array<{ id: string; name: string; color: string }>;
};
