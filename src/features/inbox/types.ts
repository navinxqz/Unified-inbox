export type ChannelId =
  | "slack"
  | "whatsapp"
  | "email"
  | "messenger"
  | "telegram";

export type Channel = {
  id: ChannelId;
  label: string;
  short: string;
  color: string;
  soft: string;
  softForeground: string;
  count: number;
};

export type AvatarPalette = {
  background: string;
  color: string;
};

export type Person = {
  id: string;
  name: string;
  initials: string;
  channel: ChannelId;
  avatar: AvatarPalette;
  preview: string;
  time: string;
  priority?: boolean;
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
};

export type Reply = {
  id: string;
  authorId: string;
  time: string;
  body: string;
  reactions?: Reaction[];
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
};

export type RailView = "all" | "priority" | "tagify" | "ignored" | "bots";

export type ChannelFilter = ChannelId | "all";
