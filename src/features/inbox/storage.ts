"use client";

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
  CHANNELS: "unified_inbox_channels_v2",
  PEOPLE: "unified_inbox_people_v2",
  MESSAGES: "unified_inbox_messages_v2",
  SETTINGS: "unified_inbox_settings_v2",
  API_KEYS: "unified_inbox_api_keys_v2",
  WEBHOOKS: "unified_inbox_webhooks_v2",
};

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
    return raw ? JSON.parse(raw) : initialSettings;
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
