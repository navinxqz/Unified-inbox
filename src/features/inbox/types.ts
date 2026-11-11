export type ChannelId =
  | "slack"
  | "whatsapp"
  | "email"
  | "messenger"
  | "telegram"
  | "instagram"
  | "discord"
  | "gmail"
  | "website";

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
  /** How this channel is wired (OAuth, official API, widget…). */
  provider?: string;
  /** Live connection health surfaced on Overview. */
  health?: "healthy" | "degraded";
};

export type Channel = ChannelConnection;

export type AvatarPalette = {
  background: string;
  color: string;
};

export type ConversationStatus = "open" | "pending" | "resolved";
export type ConversationPriority = "low" | "medium" | "high" | "urgent";

/**
 * AI ⟷ HUMAN conversation model.
 * State machine: ai → (handoff) → human → (sweeper expiry) → reverting → ai
 *                 human ← (claim / "." takeover / answering from dashboard)
 */
export type ConversationMode = "ai" | "human" | "reverting";

export type HandoffReason =
  | "complaint"
  | "refund"
  | "special-request"
  | "asked-for-human"
  | "low-confidence";

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
  /** Who currently answers: the AI agent, a human, or the sweeper returning it to the AI. */
  mode?: ConversationMode;
  /** Present when the AI handed the conversation to a human. */
  handoff?: {
    reason: HandoffReason;
    /** Epoch ms — used for live countdowns and the auto-revert sweeper. */
    atMs: number;
  };
  /** Epoch ms when the sweeper reverts an unanswered human conversation back to the AI. */
  revertAtMs?: number;
  claimedBy?: string;
  /** Epoch ms of the last inbound customer message — drives the SLA flag. */
  waitingSinceMs?: number;
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
  /** Who authored it — drives AI vs human vs system rendering. */
  authorType?: "customer" | "agent" | "ai" | "system";
};

export type RailView = "all" | "priority" | "tagify" | "ignored" | "bots";

/** Every module reachable from the primary navigation. */
export type ModuleId =
  | "overview"
  | "inbox"
  | "saved-replies"
  | "comments"
  | "notifications"
  | "activity"
  | "analytics"
  | "leads"
  | "orders"
  | "followups"
  | "broadcasts"
  | "products"
  | "posts"
  | "agent-desk"
  | "knowledge"
  | "setup"
  | "channels"
  | "website"
  | "business"
  | "team"
  | "groups"
  | "billing"
  | "settings";

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
  /** Minutes before an unanswered human conversation reverts to the AI (presets 30–1440). */
  autoRevertWindowMin: number;
  /** Minutes before a waiting conversation is flagged past target (presets 5–60). */
  slaTargetMin: number;
  /** Seconds the AI waits before answering, to batch multi-part customer messages (0–15). */
  waitBeforeAnswerSec: number;
};

/* ── Activity audit trail ──────────────────────────────────────────────── */

export type ActivitySource =
  | "dashboard"
  | "ai"
  | "auto-revert"
  | "bulk"
  | "answered"
  | "broadcast"
  | "channel";

export type ActivityEntry = {
  id: string;
  /** Epoch ms — newest first, streamed into the audit trail. */
  atMs: number;
  actor: string;
  action: string;
  subject: string;
  source: ActivitySource;
};

/* ── Needs-attention notifications (never auto-close) ──────────────────── */

export type NotificationKind =
  | "waiting"
  | "past-target"
  | "never-answered"
  | "order"
  | "system";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  atMs: number;
  personId?: string;
  channel?: ChannelId;
  assignedTo?: string;
  done: boolean;
};

/* ── Saved replies (slash-insert + keyword auto-answers) ───────────────── */

export type SavedReplyCategory =
  | "greeting"
  | "delivery"
  | "payment"
  | "support"
  | "sales"
  | "custom";

export type SavedReply = {
  id: string;
  name: string;
  /** Inserted in the composer with `/${shortcut}`. */
  shortcut: string;
  body: string;
  category: SavedReplyCategory;
  /** Keyword that triggers this reply automatically on inbound messages. */
  autoTrigger?: string;
  auto?: boolean;
  archived?: boolean;
  useCount: number;
};

/* ── Comment moderation (FB / IG / Discord) ────────────────────────────── */

export type CommentVerdict =
  | "normal"
  | "junk"
  | "unsure"
  | "attack"
  | "complaint"
  | "phone-lead";

export type CommentAction =
  | "none"
  | "delete"
  | "hide"
  | "hide-notify"
  | "hide-never-engage"
  | "human"
  | "ai-policy"
  | "capture-lead";

export type CommentItem = {
  id: string;
  platform: "instagram" | "facebook" | "discord";
  author: string;
  text: string;
  postContext: string;
  verdict: CommentVerdict;
  suggestedAction: CommentAction;
  atMs: number;
  status: "pending" | "handled";
};

export type ModerationRules = {
  junk: "delete" | "hide";
  unsure: "hide-notify" | "hide";
  attack: "hide-never-engage" | "delete";
  complaint: "human" | "ai-policy";
  /** Block comments that scrape phone numbers into the public thread. */
  phoneGuard: boolean;
  /** Hard blocklist, capped at 50 words. */
  blocklist: string[];
  blockedPeople: string[];
};

/* ── Leads pipeline ────────────────────────────────────────────────────── */

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiating"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  channel: ChannelId;
  value: number;
  stage: LeadStage;
  source: string;
  createdAt: string;
  note?: string;
};

/* ── Commerce: orders, coupons, products, posts ────────────────────────── */

export type OrderStage =
  | "new"
  | "confirmed"
  | "packed"
  | "courier"
  | "delivered"
  | "returned"
  | "cancelled";

export type Order = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  channel: ChannelId;
  items: string;
  total: number;
  /** Cash-on-delivery order — tracked in the courier handover sheet. */
  cod: boolean;
  stage: OrderStage;
  createdAt: string;
  chase?: boolean;
  chaseNoticeAt?: string;
  courier?: string;
};

export type DiscountCoupon = {
  id: string;
  code: string;
  percent: number;
  expiresAt: string;
  uses: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  /** Photo recognition enabled for this product. */
  photoMatch: boolean;
  source: "panel" | "csv";
  edited?: boolean;
  deleted?: boolean;
};

export type PostMatch = {
  productId: string;
  productName: string;
  confidence: number;
};

export type PostItem = {
  id: string;
  caption: string;
  platform: "instagram" | "facebook";
  status: "pending" | "published";
  at: string;
  matches: PostMatch[];
};

/* ── Follow-ups ────────────────────────────────────────────────────────── */

export type FollowupRules = {
  /** Hours to wait before judging whether a conversation went cold. */
  judgmentDelayH: number;
  hot: { enabled: boolean; firstH: number; gapH: number; max: number };
  warm: { enabled: boolean; gapH: number; max: number };
  silenceReason: string;
};

export type FollowupItem = {
  id: string;
  customer: string;
  channel: ChannelId;
  type: "hot" | "warm";
  dueAt: string;
  reason: string;
  sent: number;
  status: "due" | "sent" | "skipped";
};

/* ── Broadcasts ────────────────────────────────────────────────────────── */

export type BroadcastAudience = {
  lastActiveDays: number;
  interestTag?: string;
  purchased: boolean;
  skipRecentBroadcast: boolean;
};

export type BroadcastFormat =
  | "text"
  | "card"
  | "image"
  | "template"
  | "video"
  | "audio"
  | "poll";

export type Broadcast = {
  id: string;
  name: string;
  channel: ChannelId;
  audience: BroadcastAudience;
  recipients: number;
  format: BroadcastFormat;
  status: "draft" | "testing" | "sent";
  sentAt?: string;
  windowCompliant: boolean;
};

/* ── AI: Agent Desk & Knowledge ────────────────────────────────────────── */

export type AgentInstructions = {
  about: string;
  delivery: string;
  voice: string;
  exactWords: string;
  custom: string;
};

export type AgentDeskState = {
  instructions: AgentInstructions;
  publishedAt?: string;
  versions: number;
  lastPublished?: AgentInstructions;
};

export type KnowledgeSource = {
  id: string;
  title: string;
  kind: "text" | "file" | "url";
  status: "ready" | "indexing";
  words: number;
  at: string;
};

/* ── Website chat widget ───────────────────────────────────────────────── */

export type WebsiteSite = {
  id: string;
  domain: string;
  dailyCap: number;
  leadGate: boolean;
};

export type WebsiteChatState = {
  mode: "off" | "test" | "on";
  sites: WebsiteSite[];
  widgetName: string;
  greeting: string;
  accent: string;
};

/* ── Business profile (set once, applies to every channel) ─────────────── */

export type BusinessProfile = {
  name: string;
  category: string;
  address: string;
  hours: string;
  deliveryPolicy: string;
  paymentMethods: string[];
  returnPolicy: string;
};

/* ── Team & RBAC groups ────────────────────────────────────────────────── */

export type Teammate = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  group: string;
  pages: string[];
  status: "active" | "invited";
};

export type GroupDef = {
  id: string;
  name: string;
  description: string;
  canDo: string[];
  canSee: string[];
  members: number;
  system: boolean;
};

/* ── Billing: prepaid credits + itemized ledger ────────────────────────── */

export type LedgerItem = {
  id: string;
  at: string;
  description: string;
  requestType: string;
  credits: number;
  balanceAfter: number;
};

export type BillingState = {
  plan: string;
  credits: number;
  lowBalanceThreshold: number;
  ledger: LedgerItem[];
  cardOnFile: boolean;
  autoTopUp: boolean;
  autoTopUpAmount: number;
};

/* ── Setup guide (practice mode → go live) ─────────────────────────────── */

export type SetupStep = {
  id: string;
  label: string;
  done: boolean;
  module: ModuleId;
};

export type SetupState = {
  practiceMode: boolean;
  steps: SetupStep[];
  liveSince?: string;
};
