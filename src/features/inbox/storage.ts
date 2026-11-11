"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  initialApiKeys,
  initialChannels,
  initialMessages,
  initialPeople,
  initialSettings,
  initialWebhookEvents,
} from "./data";
import type {
  ApiKeyItem,
  ChannelConnection,
  Message,
  Person,
  WebhookEventItem,
  WorkspaceSettings,
} from "./types";

const STORAGE_KEYS = {
  CHANNELS: "unified_inbox_channels_v3",
  PEOPLE: "unified_inbox_people_v3",
  MESSAGES: "unified_inbox_messages_v3",
  SETTINGS: "unified_inbox_settings_v3",
  API_KEYS: "unified_inbox_api_keys_v2",
  WEBHOOKS: "unified_inbox_webhooks_v2",
};

/** Namespaced keys for the module pages (saved replies, orders, billing, …). */
export const MODULE_STORAGE_KEYS = {
  activity: "unified_inbox_activity_v1",
  notifications: "unified_inbox_notifications_v1",
  savedReplies: "unified_inbox_saved_replies_v1",
  comments: "unified_inbox_comments_v1",
  moderationRules: "unified_inbox_moderation_rules_v1",
  leads: "unified_inbox_leads_v1",
  leadsSettings: "unified_inbox_leads_settings_v1",
  orders: "unified_inbox_orders_v1",
  coupons: "unified_inbox_coupons_v1",
  products: "unified_inbox_products_v1",
  posts: "unified_inbox_posts_v1",
  followupRules: "unified_inbox_followup_rules_v1",
  followups: "unified_inbox_followups_v1",
  broadcasts: "unified_inbox_broadcasts_v1",
  agentDesk: "unified_inbox_agent_desk_v1",
  knowledge: "unified_inbox_knowledge_v1",
  websiteChat: "unified_inbox_website_chat_v1",
  business: "unified_inbox_business_v1",
  team: "unified_inbox_team_v1",
  groups: "unified_inbox_groups_v1",
  billing: "unified_inbox_billing_v1",
  setup: "unified_inbox_setup_v1",
} as const;

/** Generic JSON store — used by modules that own a single domain slice. */
export function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Persistent client state for one module domain. Mirrors the load/save
 * pattern used by the workspace-level domains, without prop drilling.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadStored(key, fallback));

  useEffect(() => {
    saveStored(key, value);
  }, [key, value]);

  return [value, setValue];
}

export function loadStoredChannels(): ChannelConnection[] {
  if (typeof window === "undefined") return initialChannels;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return raw ? JSON.parse(raw) : initialChannels;
  } catch {
    return initialChannels;
  }
}

export function saveStoredChannels(channels: ChannelConnection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  } catch {}
}

export function loadStoredPeople(): Person[] {
  if (typeof window === "undefined") return initialPeople;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    return raw ? JSON.parse(raw) : initialPeople;
  } catch {
    return initialPeople;
  }
}

export function saveStoredPeople(people: Person[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  } catch {}
}

export function loadStoredMessages(): Message[] {
  if (typeof window === "undefined") return initialMessages;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : initialMessages;
  } catch {
    return initialMessages;
  }
}

export function saveStoredMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch {}
}

export function loadStoredSettings(): WorkspaceSettings {
  if (typeof window === "undefined") return initialSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    // Merge defaults so settings saved by an older version keep working once
    // new fields (auto-revert, SLA, wait-before-answer) ship.
    return raw ? { ...initialSettings, ...JSON.parse(raw) } : initialSettings;
  } catch {
    return initialSettings;
  }
}

export function saveStoredSettings(settings: WorkspaceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function loadStoredApiKeys(): ApiKeyItem[] {
  if (typeof window === "undefined") return initialApiKeys;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    return raw ? JSON.parse(raw) : initialApiKeys;
  } catch {
    return initialApiKeys;
  }
}

export function saveStoredApiKeys(keys: ApiKeyItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch {}
}

export function loadStoredWebhookEvents(): WebhookEventItem[] {
  if (typeof window === "undefined") return initialWebhookEvents;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBHOOKS);
    return raw ? JSON.parse(raw) : initialWebhookEvents;
  } catch {
    return initialWebhookEvents;
  }
}

export function saveStoredWebhookEvents(events: WebhookEventItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(events));
  } catch {}
}
