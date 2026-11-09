import type {
  Author,
  Channel,
  Message,
  Person,
} from "./types";

export const channels: Channel[] = [
  {
    id: "slack",
    label: "Slack",
    short: "S",
    color: "#6D5BD0",
    soft: "#E8E9FB",
    softForeground: "#3730A3",
    count: 12,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    short: "W",
    color: "#1F9D55",
    soft: "#D6F0E0",
    softForeground: "#14532D",
    count: 9,
  },
  {
    id: "email",
    label: "Email",
    short: "E",
    color: "#2563EB",
    soft: "#DCEBFF",
    softForeground: "#123E7C",
    count: 11,
  },
  {
    id: "messenger",
    label: "Messenger",
    short: "M",
    color: "#B8399A",
    soft: "#F6DDF0",
    softForeground: "#6B1B5A",
    count: 6,
  },
  {
    id: "telegram",
    label: "Telegram",
    short: "T",
    color: "#0E7FB8",
    soft: "#D9F2F7",
    softForeground: "#0B4F63",
    count: 4,
  },
];

export const channelById = Object.fromEntries(
  channels.map((channel) => [channel.id, channel]),
) as Record<Channel["id"], Channel>;

export const totalChannelCount = 38;

export const people: Person[] = [
  {
    id: "maya",
    name: "Maya Alvarez",
    initials: "MA",
    channel: "slack",
    avatar: { background: "#FDE7D3", color: "#8A3B0B" },
    preview: "Can you confirm the delivery date?",
    time: "2m",
    priority: true,
  },
  {
    id: "rahim",
    name: "Rahim Khan",
    initials: "RK",
    channel: "whatsapp",
    avatar: { background: "#D6F0E0", color: "#14532D" },
    preview: "আপনার ইনভয়েসটি পেয়েছি, পেমেন্ট…",
    time: "11m",
    priority: true,
  },
  {
    id: "jonas",
    name: "Jonas Teller",
    initials: "JT",
    channel: "email",
    avatar: { background: "#DCEBFF", color: "#123E7C" },
    preview: "Re: Q4 proposal — revised numbers",
    time: "34m",
  },
  {
    id: "sana",
    name: "Sana Parveen",
    initials: "SP",
    channel: "messenger",
    avatar: { background: "#F6DDF0", color: "#6B1B5A" },
    preview: "Is the sample still available in blue?",
    time: "1h",
  },
  {
    id: "esther",
    name: "Esther Howard",
    initials: "EH",
    channel: "whatsapp",
    avatar: { background: "#FFE4E1", color: "#7A1F1F" },
    preview: "Yes, I saw your message. I'm writing…",
    time: "3h",
  },
  {
    id: "sophia",
    name: "Sophia Rodriguez",
    initials: "SR",
    channel: "telegram",
    avatar: { background: "#D9F2F7", color: "#0B4F63" },
    preview: "I'm currently working on Project Y…",
    time: "5h",
  },
  {
    id: "leslie",
    name: "Leslie Alexander",
    initials: "LA",
    channel: "whatsapp",
    avatar: { background: "#E9E2FF", color: "#40308A" },
    preview: "Please be informed that a new policy…",
    time: "10h",
  },
  {
    id: "chloe",
    name: "Chloe Patel",
    initials: "CP",
    channel: "messenger",
    avatar: { background: "#E6F4D7", color: "#2E5410" },
    preview: "This is a friendly reminder on the deadline",
    time: "15h",
  },
  {
    id: "elise",
    name: "Elise Hunt",
    initials: "EH",
    channel: "email",
    avatar: { background: "#FFF1C2", color: "#6B4A00" },
    preview: "Following up on the contract draft",
    time: "2d",
  },
];

export const personById = Object.fromEntries(
  people.map((person) => [person.id, person]),
) as Record<string, Person>;

export const selfAuthor: Author = {
  id: "me",
  name: "You",
  initials: "YN",
  avatar: { background: "#E8E9FB", color: "#3730A3" },
};

const authorEntries = people.map((person) => [
  person.id,
  {
    id: person.id,
    name: person.name,
    initials: person.initials,
    avatar: person.avatar,
  } satisfies Author,
]);

export const authorById = Object.fromEntries([
  ...authorEntries,
  [selfAuthor.id, selfAuthor],
]) as Record<string, Author>;

export const initialMessages: Message[] = [
  {
    id: "m-rahim-1",
    personId: "rahim",
    authorId: "rahim",
    channel: "whatsapp",
    time: "9:12 AM",
    body: "আপনার ইনভয়েসটি পেয়েছি, পেমেন্ট আগামীকাল হবে।",
    translation: "Got the invoice, payment will be made tomorrow.",
    tags: ["invoice"],
  },
  {
    id: "m-maya-1",
    personId: "maya",
    authorId: "maya",
    channel: "slack",
    time: "9:40 AM",
    body: "Can you confirm the delivery date? The client is asking again.",
    reactions: [
      { emoji: "👍", count: 2, reacted: true },
      { emoji: "👀", count: 1 },
    ],
    replies: [
      {
        id: "r-maya-1",
        authorId: "me",
        time: "9:42 AM",
        body: "Checking with the warehouse now, will update you shortly.",
      },
      {
        id: "r-maya-2",
        authorId: "maya",
        time: "9:44 AM",
        body: "Thanks, appreciated.",
        reactions: [{ emoji: "❤️", count: 1 }],
      },
    ],
  },
  {
    id: "m-jonas-1",
    personId: "jonas",
    authorId: "jonas",
    channel: "email",
    time: "10:05 AM",
    body: "Re: Q4 proposal — attached the revised numbers, let me know if the scope works.",
    attachment: { name: "Q4-proposal-v2.pdf", size: "248 KB" },
  },
  {
    id: "m-sana-1",
    personId: "sana",
    authorId: "sana",
    channel: "messenger",
    time: "10:30 AM",
    body: "Is the sample still available in blue?",
    replies: [
      {
        id: "r-sana-1",
        authorId: "me",
        time: "10:34 AM",
        body: "Yes, blue is in stock. Want me to hold one for you?",
      },
    ],
  },
  {
    id: "m-esther-1",
    personId: "esther",
    authorId: "esther",
    channel: "whatsapp",
    time: "10:52 AM",
    body: "Yes, I saw your message. I'm writing the full reply now — just need a moment.",
  },
  {
    id: "m-sophia-1",
    personId: "sophia",
    authorId: "sophia",
    channel: "telegram",
    time: "11:14 AM",
    body: "I'm currently working on Project Y and sharing the update before lunch.",
  },
  {
    id: "m-leslie-1",
    personId: "leslie",
    authorId: "leslie",
    channel: "whatsapp",
    time: "11:38 AM",
    body: "Please be informed that a new policy takes effect from Monday.",
  },
  {
    id: "m-chloe-1",
    personId: "chloe",
    authorId: "chloe",
    channel: "messenger",
    time: "12:02 PM",
    body: "This is a friendly reminder that the deadline is tomorrow at 5 PM.",
  },
  {
    id: "m-elise-1",
    personId: "elise",
    authorId: "elise",
    channel: "email",
    time: "12:20 PM",
    body: "Following up on the contract draft — could you review section 4?",
    tags: ["contract"],
  },
];

export const suggestedReplies = [
  "Yes, delivery is confirmed for Thursday",
  "Let me check and get back to you",
  "I'll share the update within the hour",
];

export const storyBanner = {
  channel: "telegram" as const,
  personId: "sophia",
  title: "New in Telegram",
  text: "Sophia: “Sharing the Project Y update now.”",
};
