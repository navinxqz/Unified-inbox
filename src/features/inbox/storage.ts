"use client";

import { useCallback, useSyncExternalStore } from "react";
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

/** UI language — English or Bangla (see `i18n.tsx`). */
export const LANGUAGE_STORAGE_KEY = "unified_inbox_language_v1";

/**
 * localStorage-backed snapshot store.
 *
 * Reads are cached per key so `getSnapshot` stays referentially stable (a
 * fresh JSON.parse on every render would loop React). Server renders and the
 * hydration pass use the seed fallback; the stored value is applied right
 * after hydration, which keeps server markup and first client render in sync.
 */
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function notify(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null) {
      cache.clear();
      listeners.forEach((_, key) => notify(key));
      return;
    }
    cache.delete(event.key);
    notify(event.key);
  });
}

function readStored<T>(key: string, fallback: T, parse?: (raw: unknown) => T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        value = parse ? parse(parsed) : (parsed as T);
      }
    } catch {}
  }
  cache.set(key, value);
  return value;
}

function writeStored<T>(key: string, value: T): void {
  cache.set(key, value);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
  notify(key);
}

function subscribe(key: string, listener: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(key);
  };
}

/** Generic JSON store — used by modules that own a single domain slice. */
export function loadStored<T>(key: string, fallback: T): T {
  return readStored(key, fallback);
}

export function saveStored<T>(key: string, value: T): void {
  writeStored(key, value);
}

/**
 * Persistent client state for one domain slice. The setter writes through
 * immediately, so no mirroring `useEffect` is needed.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  parse?: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const subscribeToKey = useCallback(
    (listener: () => void) => subscribe(key, listener),
    [key],
  );
  const getSnapshot = useCallback(
    () => readStored(key, fallback, parse),
    [key, fallback, parse],
  );
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribeToKey, getSnapshot, getServerSnapshot);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      const current = readStored(key, fallback, parse);
      writeStored(
        key,
        typeof next === "function" ? (next as (prev: T) => T)(current) : next,
      );
    },
    [key, fallback, parse],
  );

  return [value, setValue];
}

/** Keep seeded data when a stored list is empty (fresh or cleared profile). */
function nonEmptyList<T>(fallback: T[]) {
  return (raw: unknown): T[] =>
    Array.isArray(raw) && raw.length > 0 ? (raw as T[]) : fallback;
}

const parseChannels = nonEmptyList<ChannelConnection>(initialChannels);
const parsePeople = nonEmptyList<Person>(initialPeople);
const parseMessages = nonEmptyList<Message>(initialMessages);

/** Merge defaults so settings saved by an older version keep working. */
function parseSettings(raw: unknown): WorkspaceSettings {
  return raw && typeof raw === "object"
    ? { ...initialSettings, ...(raw as Partial<WorkspaceSettings>) }
    : initialSettings;
}

export function loadStoredChannels(): ChannelConnection[] {
  return readStored(STORAGE_KEYS.CHANNELS, initialChannels, parseChannels);
}

export function saveStoredChannels(channels: ChannelConnection[]): void {
  writeStored(STORAGE_KEYS.CHANNELS, channels);
}

export function loadStoredPeople(): Person[] {
  return readStored(STORAGE_KEYS.PEOPLE, initialPeople, parsePeople);
}

export function saveStoredPeople(people: Person[]): void {
  writeStored(STORAGE_KEYS.PEOPLE, people);
}

export function loadStoredMessages(): Message[] {
  return readStored(STORAGE_KEYS.MESSAGES, initialMessages, parseMessages);
}

export function saveStoredMessages(messages: Message[]): void {
  writeStored(STORAGE_KEYS.MESSAGES, messages);
}

export function loadStoredSettings(): WorkspaceSettings {
  return readStored(STORAGE_KEYS.SETTINGS, initialSettings, parseSettings);
}

export function saveStoredSettings(settings: WorkspaceSettings): void {
  writeStored(STORAGE_KEYS.SETTINGS, settings);
}

export function loadStoredApiKeys(): ApiKeyItem[] {
  return readStored(STORAGE_KEYS.API_KEYS, initialApiKeys);
}

export function saveStoredApiKeys(keys: ApiKeyItem[]): void {
  writeStored(STORAGE_KEYS.API_KEYS, keys);
}

export function loadStoredWebhookEvents(): WebhookEventItem[] {
  return readStored(STORAGE_KEYS.WEBHOOKS, initialWebhookEvents);
}

export function saveStoredWebhookEvents(events: WebhookEventItem[]): void {
  writeStored(STORAGE_KEYS.WEBHOOKS, events);
}

export function useStoredChannels() {
  return useStoredState<ChannelConnection[]>(
    STORAGE_KEYS.CHANNELS,
    initialChannels,
    parseChannels,
  );
}

export function useStoredPeople() {
  return useStoredState<Person[]>(STORAGE_KEYS.PEOPLE, initialPeople, parsePeople);
}

export function useStoredMessages() {
  return useStoredState<Message[]>(STORAGE_KEYS.MESSAGES, initialMessages, parseMessages);
}

export function useStoredSettings() {
  return useStoredState<WorkspaceSettings>(
    STORAGE_KEYS.SETTINGS,
    initialSettings,
    parseSettings,
  );
}

export function useStoredApiKeys() {
  return useStoredState<ApiKeyItem[]>(STORAGE_KEYS.API_KEYS, initialApiKeys);
}

export function useStoredWebhookEvents() {
  return useStoredState<WebhookEventItem[]>(STORAGE_KEYS.WEBHOOKS, initialWebhookEvents);
}
