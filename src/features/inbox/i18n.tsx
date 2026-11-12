"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { LANGUAGE_STORAGE_KEY, useStoredState } from "./storage";

export type Language = "en" | "bn";

/**
 * Bangla copy keyed by the English source string. Anything missing falls back
 * to English, so a new string never blocks a release.
 */
const bangla: Record<string, string> = {
  /* ── Navigation ─────────────────────────────────────────────────────── */
  Work: "কাজ",
  Grow: "প্রসার",
  "Set up": "সেটআপ",
  Overview: "ওভারভিউ",
  Inbox: "ইনবক্স",
  Notifications: "নোটিফিকেশন",
  Activity: "অ্যাক্টিভিটি",
  Analytics: "অ্যানালিটিক্স",
  Leads: "লিডস",
  Orders: "অর্ডার",
  "Follow-ups": "ফলো-আপ",
  Broadcasts: "ব্রডকাস্ট",
  Products: "পণ্য",
  Posts: "পোস্ট",
  "Agent Desk": "এজেন্ট ডেস্ক",
  Knowledge: "নলেজ",
  "Setup guide": "সেটআপ গাইড",
  Channels: "চ্যানেল",
  "Website chat": "ওয়েবসাইট চ্যাট",
  Business: "ব্যবসা",
  Team: "টিম",
  Groups: "গ্রুপ",
  Billing: "বিলিং",
  Settings: "সেটিংস",
  "Saved replies": "সংরক্ষিত উত্তর",
  Comments: "কমেন্ট",

  /* ── Rail views ─────────────────────────────────────────────────────── */
  "All messages": "সব বার্তা",
  Priority: "গুরুত্বপূর্ণ",
  Tagify: "ট্যাগ করা",
  Ignored: "উপেক্ষিত",
  Bots: "বট",
  "Starred and urgent messages": "স্টার করা ও জরুরি বার্তা",
  "Tagged messages across channels": "সব চ্যানেলের ট্যাগ করা বার্তা",
  "Muted conversations stay out of the way": "মিউট করা কথোপকথন আলাদা থাকে",
  "Automated assistants and incoming bots": "স্বয়ংক্রিয় সহকারী ও ইনকামিং বট",

  /* ── Shell ──────────────────────────────────────────────────────────── */
  Messages: "বার্তা",
  "Search people and messages": "মানুষ ও বার্তা খুঁজুন",
  "New message": "নতুন বার্তা",
  "Open channels": "চ্যানেল খুলুন",
  "Open navigation": "নেভিগেশন খুলুন",
  "Close navigation": "নেভিগেশন বন্ধ করুন",
  Menu: "মেনু",
  "Quick actions": "দ্রুত অ্যাকশন",
  "Practice mode": "প্র্যাকটিস মোড",
  Live: "লাইভ",
  "synced {n}s ago": "{n} সেকেন্ড আগে সিঙ্ক হয়েছে",
  Language: "ভাষা",
  English: "English",
  "Switch to বাংলা": "বাংলায় দেখুন",
  "Switch to English": "ইংরেজিতে দেখুন",
  "Collapse sidebar": "সাইডবার ছোট করুন",
  "Expand sidebar": "সাইডবার বড় করুন",
  You: "আপনি",
  "Owner · Manager group": "ওনার · ম্যানেজার গ্রুপ",
  Conversations: "কথোপকথন",
  Waiting: "অপেক্ষমাণ",
  Newest: "নতুন",
  Oldest: "পুরোনো",
  "Show customers waiting longest first": "দীর্ঘ সময় ধরে অপেক্ষারত গ্রাহক আগে দেখান",
  "Sort oldest first": "পুরোনো আগে সাজান",
  "Sort newest first": "নতুন আগে সাজান",
  "No conversations match this view.": "এই ভিউতে কোনো কথোপকথন নেই।",
  "Try another view or connect a channel to bring conversations in.":
    "অন্য ভিউ দেখুন বা কথোপকথন আনতে একটি চ্যানেল কানেক্ট করুন।",
  "Pick a conversation": "একটি কথোপকথন বেছে নিন",
  "Pick a thread from the stream to inspect customer CRM metadata.":
    "কাস্টমার CRM তথ্য দেখতে স্ট্রিম থেকে একটি থ্রেড বেছে নিন।",
  "No messages here": "এখানে কোনো বার্তা নেই",
  "No messages in this conversation yet.": "এই কথোপকথনে এখনো কোনো বার্তা নেই।",
  "{n} messages": "{n}টি বার্তা",
  "{n} people · one unified inbox": "{n} জন · একটাই ইনবক্স",
  "All channels": "সব চ্যানেল",
  "Reply to {name} on {channel}": "{channel}-এ {name}-কে উত্তর দিন",
  "Reply in {channel}": "{channel}-এ উত্তর দিন",
  "Reply to the unified timeline": "সমন্বিত টাইমলাইনে উত্তর দিন",
  Chat: "চ্যাট",
  "AI is answering": "এআই উত্তর দিচ্ছে",
  "Human is answering": "মানব উত্তর দিচ্ছেন",
  "Reverting to AI": "এআই-তে ফিরছে",
  "AI is answering.": "এআই উত্তর দিচ্ছে।",

  /* ── Composer & chat ───────────────────────────────────────────────── */
  Suggest: "পরামর্শ",
  Translate: "অনুবাদ",
  Bot: "বট",
  "Pick an emoji": "ইমোজি বেছে নিন",
  "Attach a file": "ফাইল যুক্ত করুন",
  "Translate message to:": "বার্তার অনুবাদের ভাষা:",
  "Attach tags to message:": "বার্তায় ট্যাগ যুক্ত করুন:",
  "New tag...": "নতুন ট্যাগ...",

  /* ── Command palette ────────────────────────────────────────────────── */
  "Jump to a module or channel… (Esc to close)":
    "মডিউল বা চ্যানেলে যান… (বন্ধ করতে Esc)",
  "No results found.": "কিছু পাওয়া যায়নি।",
  Navigation: "নেভিগেশন",
  Channel: "চ্যানেল",
  "Go to Inbox": "ইনবক্সে যান",
  "Go to Overview": "ওভারভিউতে যান",
  "Open Leads pipeline": "লিডস পাইপলাইন খুলুন",
  "Open Orders": "অর্ডার খুলুন",
  "Open Agent Desk": "এজেন্ট ডেস্ক খুলুন",
  "Open Notifications": "নোটিফিকেশন খুলুন",
  "Open Billing": "বিলিং খুলুন",
  "Open Channels & webhooks": "চ্যানেল ও ওয়েবহুক খুলুন",
  "Open Workspace settings": "ওয়ার্কস্পেস সেটিংস খুলুন",
  "Filter inbox to {channel}": "ইনবক্স {channel}-এ ফিল্টার করুন",
  "Close quick actions": "দ্রুত অ্যাকশন বন্ধ করুন",

  /* ── Common actions ─────────────────────────────────────────────────── */
  "Save changes": "পরিবর্তন সংরক্ষণ করুন",
  Cancel: "বাতিল",
  Save: "সংরক্ষণ",
  Saved: "সংরক্ষিত হয়েছে",
  Delete: "মুছুন",
  Remove: "সরান",
  Create: "তৈরি করুন",
  Add: "যোগ করুন",
  Edit: "সম্পাদনা",
  Close: "বন্ধ করুন",
  Done: "সম্পন্ন",
  Send: "পাঠান",
  Back: "পেছনে",
  Restore: "পুনরুদ্ধার",
  Export: "এক্সপোর্ট",
  Import: "ইমপোর্ট",
  Copy: "কপি",
  Search: "খুঁজুন",
  Filter: "ফিল্টার",
  Status: "স্ট্যাটাস",
  Name: "নাম",
  Phone: "ফোন",
  Email: "ইমেইল",
  Subject: "বিষয়",
  Message: "বার্তা",
  Notes: "নোট",
  Tags: "ট্যাগ",
  Today: "আজ",
  Yesterday: "গতকাল",
  "Just now": "এখনই",
  High: "উচ্চ",
  Medium: "মাঝারি",
  Low: "নিম্ন",
  Urgent: "জরুরি",
  Pending: "মুলতুবি",
  Resolved: "সমাধান হয়েছে",
  Open: "খোলা",
  Closed: "বন্ধ",
  Active: "সক্রিয়",
  All: "সব",
  None: "কিছু নেই",
  Enabled: "চালু",
  Disabled: "বন্ধ",
  On: "চালু",
  Off: "বন্ধ",
  Default: "ডিফল্ট",
  Custom: "কাস্টম",
  Approve: "অনুমোদন",
  Reject: "প্রত্যাখ্যান",
  Review: "পর্যালোচনা",
  Details: "বিস্তারিত",
  View: "দেখুন",
  "View all": "সব দেখুন",
  "Learn more": "আরও জানুন",
  Continue: "চালিয়ে যান",
  "Go live": "লাইভে যান",
  "You are live": "আপনি লাইভে আছেন",

  /* ── Walkthroughs & Onboarding ────────────────────────────────────────── */
  "Watch how · 1 min": "টিউটোরিয়াল দেখুন · ১ মিনিট",
  "Got it": "বুঝেছি",
  "Close walkthrough": "টিউটোরিয়াল বন্ধ করুন",
  "Use the audit trail": "অডিট ট্রেইল ব্যবহার করুন",
  "Every AI handoff, claim, auto-revert, and dashboard answer is recorded here.":
    "প্রতিটি এআই হ্যান্ডঅফ, দাবি, অটো-রিভার্ট এবং ড্যাশবোর্ড উত্তর এখানে রেকর্ড করা হয়।",
  "Filter by source — dashboard, AI, auto-revert, answered, bulk, broadcast, channel.":
    "উৎস দ্বারা ফিল্টার করুন — ড্যাশবোর্ড, এআই, অটো-রিভার্ট, উত্তরকৃত, বাল্ক, ব্রডকাস্ট, চ্যানেল।",
  "Search by person, action, or subject to trace one conversation's history.":
    "এক কথোপকথনের ইতিহাস অনুসন্ধান করতে ব্যক্তি, কর্ম বা বিষয় দিয়ে খুঁজুন।",
  "Tune the AI agent": "এআই এজেন্ট টিউন করুন",
  "Fill the five instruction blocks — business facts, delivery, voice, exact words, guardrails.":
    "পাঁচটি নির্দেশিকা পূরণ করুন — ব্যবসার তথ্য, ডেলিভারি, কণ্ঠস্বর, নির্দিষ্ট শব্দ, সুরক্ষানীতি।",
  "Test as a customer on the right: the reply comes from exactly what you wrote.":
    "ডানপাশে গ্রাহক হিসেবে পরীক্ষা করুন: আপনি যা লিখেছেন ঠিক সে অনুসারেই উত্তর আসবে।",
  "Publish bumps the version and re-indexes knowledge — the audit trail records it.":
    "প্রকাশ করলে সংস্করণ আপডেট হয় এবং জ্ঞান পুনর্নির্দেশিত হয় — অডিট ট্রেইলে তা রেকর্ড থাকে।",
  "Read the numbers": "পরিসংখ্যান বুঝুন",
  "AI share shows how much of the open workload the agent is carrying right now.":
    "এআই শেয়ার নির্দেশ করে এই মুহূর্তে মোট কাজের কতটুকু এআই সামলাচ্ছে।",
  "SLA flags every waiting conversation older than your target — the same flag the inbox shows.":
    "এসএলএ লক্ষ্যমাত্রার চেয়ে বেশি সময় ধরে অপেক্ষারত কথোপকথনে ফ্ল্যাগ দেয় — যা ইনবক্সেও দেখা যায়।",
  "The weekly chart splits inbound and outbound volume per day.":
    "সাপ্তাহিক চার্টে প্রতিদিনের ইনকামিং ও আউটগোয়িং বার্তা ভাগ করে দেখানো হয়।",
  "Understand billing": "বিলিং সম্পর্কে জানুন",
  "Credits are prepaid — each AI reply, translation, and photo match draws from the balance.":
    "ক্রেডিট হলো প্রিপেইড — প্রতিটি এআই উত্তর, অনুবাদ এবং ছবি মেলানোর জন্য ব্যালেন্স থেকে কাটা হয়।",
  "The itemized ledger shows every request, so the monthly bill is never a surprise.":
    "লেনদেন খতিয়ানে প্রতিটি অনুরোধ দেখানো হয়, ফলে কোনো অপ্রত্যাশিত খরচ হয় না।",
  "Set a low-balance threshold to get warned before replies start failing.":
    "ব্যালেন্স শেষ হওয়ার আগে সতর্কবার্তা পেতে সর্বনিম্ন ব্যালেন্সের সীমা নির্ধারণ করুন।",
  "Send your first broadcast": "আপনার প্রথম ব্রডকাস্ট পাঠান",
  "Pick the channel — WhatsApp Cloud API is official, so template messages are allowed.":
    "চ্যানেল বেছে নিন — হোয়াটসঅ্যাপ ক্লাউড এপিআই অফিসিয়াল, তাই টেমপ্লেট বার্তা অনুমোদিত।",
  "Filter the audience by recency, interest, and purchase history.":
    "সাম্প্রতিক সক্রিয়তা, আগ্রহ এবং ক্রয়ের ইতিহাস অনুযায়ী গ্রাহকদের বাছাই করুন।",
  "Send a test to your own phone first — the Send button stays locked until you do.":
    "প্রথমে নিজের ফোনে একটি টেস্ট পাঠান — টেস্ট না পাঠানো পর্যন্ত সেন্ড বাটন লক থাকবে।",
  "Fill in your business facts": "আপনার ব্যবসার তথ্য দিন",
  "Write the address, hours, delivery policy, and return policy exactly as customers should hear them.":
    "ঠিকানা, কাজের সময়, ডেলিভারি এবং রিটার্ন পলিসি স্পষ্টভাবে লিখুন যাতে গ্রাহকরা সঠিক তথ্য পান।",
  "Pick every payment method you actually accept — the AI will never offer one you didn't select.":
    "যেসব পেমেন্ট পদ্ধতি আপনি গ্রহণ করেন তা নির্বাচন করুন — অযাচিত কোনো পদ্ধতি এআই অফার করবে না।",
  "These facts feed Agent Desk, AI replies, broadcasts, and the website widget at once.":
    "এই তথ্যগুলো একই সাথে এজেন্ট ডেস্ক, এআই উত্তর, ব্রডকাস্ট এবং ওয়েবসাইট উইজেটে ব্যবহৃত হয়।",
  "Moderate without reading everything": "সব না পড়েও মডারেশন করুন",
  "The classifier labels each comment junk, unsure, attack, complaint, or a phone lead.":
    "স্বয়ংক্রিয় ক্লাসিফায়ার প্রতিটি কমেন্টকে স্প্যাম, অনিশ্চিত, আক্রমণাত্মক, অভিযোগ বা ফোন লিড হিসেবে চিহ্নিত করে।",
  "The suggested action follows your rules — delete junk, hide attacks, and never engage them.":
    "প্রস্তাবিত পদক্ষেপ আপনার নিয়ম অনুসরণ করে — স্প্যাম মুছুন, আক্রমণাত্মক কমেন্ট লুকান।",
  "Approve or change the action per comment; every decision is written to the audit trail.":
    "প্রতিটি কমেন্টে পদক্ষেপ অনুমোদন বা পরিবর্তন করুন; সব সিদ্ধান্ত অডিট ট্রেইলে সংরক্ষিত হয়।",
  "Tune follow-ups in 1 minute": "১ মিনিটে ফলো-আপ সাজান",
  "Judgment delay sets how many hours after silence the customer is judged cold.":
    "গ্রাহক কত ঘণ্টা নীরব থাকলে তাকে নিষ্ক্রিয় বিবেচনা করা হবে তা নির্ধারণ করুন।",
  "Hot and warm follow-ups have their own intervals and maximum message caps.":
    "হট ও ওয়ার্ম ফলো-আপের নিজস্ব ব্যবধান ও সর্বোচ্চ বার্তার সীমা থাকে।",
  "The AI respects silence reason rules and never nags customers who said no.":
    "এআই নীরবতার কারণ বিবেচনা করে এবং যে গ্রাহক না বলেছেন তাকে বিরক্ত করে না।",
  "Control who sees what": "কার কি দেখার অধিকার তা নিয়ন্ত্রণ করুন",
  "Groups bundle permissions — manager, moderator, accountant, and view-only roles.":
    "গ্রুপে অনুমতি একত্রিত থাকে — ম্যানেজার, মডারেটর, হিসাবরক্ষক এবং শুধু দেখার ভূমিকা।",
  "System groups can't be deleted so the workspace never locks itself out.":
    "সিস্টেম গ্রুপ মোছা যায় না, ফলে কখনো ওয়ার্কস্পেস থেকে লকআউট হওয়ার ঝুঁকি থাকে না।",
  "Custom groups let you mix-and-match specific features for specific team members.":
    "কাস্টম গ্রুপ দিয়ে নির্দিষ্ট দলের সদস্যদের জন্য নির্দিষ্ট সুবিধা নির্ধারণ করতে পারেন।",
  "Build your knowledge base": "নলেজ বেস তৈরি করুন",
  "Add raw text, PDF/Word documents, or live URLs for the AI to learn from.":
    "এআই-এর শেখার জন্য টেক্সট, পিডিএফ/ওয়ার্ড ডকুমেন্ট অথবা ওয়েবসাইটের লিংক যুক্ত করুন।",
  "The AI quotes from indexed sources before generating answers.":
    "উত্তর তৈরির সময় এআই ইনডেক্স করা উৎস থেকে সঠিক তথ্য উদ্ধৃত করে।",
  "Keep documents concise and updated to maintain maximum answering precision.":
    "উত্তরের সর্বোচ্চ নির্ভুলতা বজায় রাখতে নথিপত্র সংক্ষিপ্ত ও হালনাগাদ রাখুন।",
  "Manage your leads pipeline": "লিডস পাইপলাইন পরিচালনা করুন",
  "Leads captured from chat automatically arrive in New from every channel.":
    "চ্যাট থেকে সংগৃহীত লিডগুলো সব চ্যানেল থেকে স্বয়ংক্রিয়ভাবে 'নতুন' কলামে জমা হয়।",
  "Drag cards across stages as conversations progress toward closing.":
    "কথোপকথন সমাপ্তির দিকে এগোলে কার্ডগুলোকে এক ধাপ থেকে অন্য ধাপে টেনে নিন।",
  "Track deal value and channel attribution across your whole pipeline.":
    "আপনার পুরো পাইপলাইনে চুক্তির মূল্য এবং কোন চ্যানেল থেকে এসেছে তা ট্র্যাক করুন।",
  "Stay ahead of urgent events": "জরুরি ইভেন্টে এগিয়ে থাকুন",
  "Waiting SLA breaches, unhandled chats, and new high-value orders appear here.":
    "এসএলএ ভঙ্গ, উত্তরহীন চ্যাট এবং নতুন গুরুত্বপূর্ণ অর্ডার এখানে দেখা যায়।",
  "Notifications never auto-close — an operator must explicitly mark them done.":
    "নোটিফিকেশন কখনো নিজে থেকে বন্ধ হয় না — অপারেটরকে সম্পন্ন হিসেবে চিহ্নিত করতে হয়।",
  "Click any notification to jump directly into the relevant conversation.":
    "সরাসরি সংশ্লিষ্ট কথোপকথনে যেতে যেকোনো নোটিফিকেশনে ক্লিক করুন।",
  "Track and fulfill orders": "অর্ডার ট্র্যাক ও সম্পন্ন করুন",
  "Orders created by the AI or operators appear with customer details and line items.":
    "এআই বা অপারেটর দ্বারা তৈরি অর্ডারগুলো গ্রাহকের তথ্য ও পণ্যের তালিকাসহ দেখা যায়।",
  "Track Cash-on-Delivery (COD) collections and courier handoff status.":
    "ক্যাশ-অন-ডেলিভারি (সিওডি) সংগ্রহ এবং কুরিয়ারে হস্তান্তরের স্ট্যাটাস ট্র্যাক করুন।",
  "Send automated delivery chase notices when packages are out for delivery.":
    "প্যাকেজ ডেলিভারির জন্য বের হলে স্বয়ংক্রিয়ভাবে ট্র্যাকিং নোটিশ পাঠান।",
  "Read the Overview in 60 seconds": "৬০ সেকেন্ডে ওভারভিউ বুঝুন",
  "The four stat cards show open conversations, who is waiting, the AI share, and SLA breaches.":
    "চারটি স্ট্যাট কার্ডে উন্মুক্ত কথোপকথন, অপেক্ষমাণ ব্যক্তি, এআই শেয়ার এবং এসএলএ লঙ্ঘন দেখানো হয়।",
  "Longest waiting is sorted oldest-first so nothing slips past the reply target.":
    "সবচেয়ে দীর্ঘ অপেক্ষমাণ বার্তাগুলো পুরোনোগুলো আগে সাজানো হয় যাতে উত্তরের সীমা না পেরোয়।",
  "Needs attention never auto-closes — items stay until somebody marks them done.":
    "মনোযোগ প্রয়োজন এমন বিষয় নিজে থেকে বন্ধ হয় না — সমাধান না করা পর্যন্ত থাকে।",
  "Channel health shows every connected channel and whether its sync is healthy.":
    "চ্যানেল স্বাস্থ্য প্রতিটি সংযুক্ত চ্যানেল এবং তার সিঙ্ক সঠিক আছে কিনা তা দেখায়।",
  "Link photos to products": "ছবির সাথে পণ্য সংযুক্ত করুন",
  "Every new photo post gets the top three product matches with confidence scores.":
    "প্রতিটি নতুন ছবির পোস্টে সর্বোচ্চ সম্ভাবনাময় তিনটি পণ্যের মিল দেখানো হয়।",
  "Confirm the right match — the AI will use that product's price and stock in replies.":
    "সঠিক মিল নিশ্চিত করুন — এআই উত্তরে সেই পণ্যের দাম ও মজুদ ব্যবহার করবে।",
  "Low-confidence matches stay suggestions; nothing is auto-published without you.":
    "কম আত্মবিশ্বাসী মিলগুলো কেবল পরামর্শ হিসেবে থাকে; আপনার অনুমতি ছাড়া কিছুই পোস্ট হয় না।",
  "Keep the catalog accurate": "ক্যাটালগ নির্ভুল রাখুন",
  "Every price the AI quotes comes from this table — nothing else.":
    "এআই যে দাম বলে তা শুধুমাত্র এই তালিকা থেকেই আসে — অন্য কোথাও থেকে নয়।",
  "CSV imports show a preview first; approve adds, reject leaves everything untouched.":
    "সিএসভি আপলোডে প্রথমে প্রিভিউ দেখায়; অনুমোদন করলে যুক্ত হয়, বাতিল করলে অপরিবর্তিত থাকে।",
  "Edited rows keep a marker so you can tell catalog-synced data from hand edits.":
    "সম্পাদিত সারিতে চিহ্ন থাকে যাতে বোঝা যায় কোনটি স্বয়ংক্রিয় আর কোনটি হাতে করা।",
  "Set up saved replies in 1 minute": "১ মিনিটে সংরক্ষিত উত্তর সাজান",
  "Create a reply with a name, a /shortcut, and the message body.":
    "একটি নাম, একটি /শর্টকাট এবং মূল বার্তাসহ একটি উত্তর তৈরি করুন।",
  "Add a keyword trigger to answer that question automatically — the ⚡Auto chip marks it.":
    "স্বয়ংক্রিয় উত্তরের জন্য একটি কিওয়ার্ড নির্ধারণ করুন — ⚡অটো চিহ্ন তা নির্দেশ করবে।",
  "In any conversation, type / and pick the reply to insert it.":
    "যেকোনো কথোপকথনে / টাইপ করুন এবং সরাসরি বার্তাটি যুক্ত করুন।",
  "Get to go-live": "লাইভে যাওয়ার প্রস্তুতি",
  "Work down the checklist; each step opens the page where you finish it.":
    "চেকলিস্ট অনুযায়ী কাজ করুন; প্রতিটি ধাপ আপনাকে সংশ্লিষ্ট পৃষ্ঠায় নিয়ে যাবে।",
  "Practice mode keeps test chats internal — your trial starts at go-live.":
    "প্র্যাকটিস মোডে পরীক্ষামূলক চ্যাট অভ্যন্তরীণ থাকে — লাইভে গেলে ট্রায়াল শুরু হয়।",
  "You can mark steps done manually if you finished them outside the app.":
    "অ্যাপের বাইরে কোনো ধাপ সম্পন্ন করলে তা ম্যানুয়ালি টিক দিতে পারেন।",
  "Add your team": "আপনার টিম যুক্ত করুন",
  "Invite by email and pick a role — Owner, Admin, Member, or Viewer.":
    "ইমেইলে আমন্ত্রণ পাঠান এবং ভূমিকা নির্ধারণ করুন — ওনার, অ্যাডমিন, মেম্বার বা ভিউয়ার।",
  "Every teammate belongs to one group; the group decides what they can do and see.":
    "দলের প্রতিটি সদস্য একটি গ্রুপের অধীনে থাকে; গ্রুপ নির্ধারণ করে তাদের অধিকার।",
  "Page scoping limits which channels a teammate can open.":
    "পেজ স্কোপিংয়ের মাধ্যমে একজন সদস্য কোন কোন চ্যানেল দেখতে পারবে তা সীমাবদ্ধ করা যায়।",
  "Ship the widget": "ওয়েবসাইট উইজেট যুক্ত করুন",
  "Start in Test mode — only your allow-listed domains get the widget.":
    "টেস্ট মোডে শুরু করুন — শুধুমাত্র অনুমোদিত ডোমেইনেই উইজেট কাজ করবে।",
  "Paste the one-line embed script before </body> on your site.":
    "আপনার ওয়েবসাইটে </body> ট্যাগের ঠিক আগে এক লাইনের স্ক্রিপ্টটি পেস্ট করুন।",
  "Add a domain to the allowlist; requests from unknown origins are rejected.":
    "অনুমোদিত তালিকায় ডোমেইন যুক্ত করুন; অপরিচিত উৎস থেকে অনুরোধ বাতিল করা হবে।",

  /* ── Thread Header, Banner & Message Actions ───────────────────────── */
  "View Info": "তথ্য দেখুন",
  "Take over": "নিয়ন্ত্রণ নিন",
  "Handoff reason": "হ্যান্ডঅফ কারণ",
  Claim: "দাবি করুন",
  "Return to AI": "এআই-তে ফেরত দিন",
  "Open AI copilot": "এআই কপাইলট",
  "Pin conversation": "পিন করুন",
  "Unpin conversation": "আনপিন করুন",
  Pin: "পিন",
  Unpin: "আনপিন",
  Ignore: "উপেক্ষা",
  "Translated:": "অনূদিত:",
  React: "প্রতিক্রিয়া",
  Reply: "উত্তর",
  Tag: "ট্যাগ",
  More: "আরও",
  "Add reaction": "প্রতিক্রিয়া যুক্ত করুন",
  Complaint: "অভিযোগ",
  "Refund request": "রিফান্ড অনুরোধ",
  "Special request": "বিশেষ অনুরোধ",
  "Customer asked for a human": "গ্রাহক প্রতিনিধির সাথে কথা বলতে চেয়েছেন",
  "AI was unsure": "এআই নিশ্চিত হতে পারেনি",
  "Claimed by {name}": "{name} কর্তৃক গৃহীত",
  "Reverts to AI in {time}": "{time}-এ এআই-তে ফিরবে",
  "{label} is answering": "{label} উত্তর দিচ্ছে",
  AI: "এআই",
  Human: "মানব",
  Reverting: "রিভার্ট হচ্ছে",

  /* ── General & Common ─────────────────────────────────────────────────── */
  "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
  "Saved Successfully": "সফলভাবে সংরক্ষিত হয়েছে",
  Inactive: "নিষ্ক্রিয়",
  Connected: "সংযুক্ত",
  Disconnected: "সংযোগ বিচ্ছিন্ন",

  /* ── Walkthroughs & Onboarding ────────────────────────────────────────── */
  "Watch now": "এখনই দেখুন",
  "Watch now options": "টিউটোরিয়াল দেখার অপশন",
  "Watch how": "টিউটোরিয়াল দেখুন",
  "1 min walkthrough": "১ মিনিটের টিউটোরিয়াল",

  /* ── Thread Panel & Timeline ──────────────────────────────────────────── */
  "Back to conversations": "কথোপকথনে ফিরে যান",
  "Click to view customer details": "গ্রাহকের বিস্তারিত দেখতে ক্লিক করুন",
  "New in Telegram": "টেলিগ্রামে নতুন",
  "Sophia: “Sharing the Project Y update now.”":
    "সোফিয়া: “প্রজেক্ট ওয়াই-এর আপডেট এখন পাঠাচ্ছি।”",
  "{count} messages": "{count} টি বার্তা",
  "{count} message": "{count} টি বার্তা",
  "{count} people · one unified inbox": "{count} জন · একটি ইউনিফাইড ইনবক্স",

  /* ── Channel Sidebar ──────────────────────────────────────────────────── */
  "Pick a channel to filter, or drag to reorder.":
    "ফিল্টার করতে চ্যানেল বেছে নিন, অথবা সাজাতে টেনে নিন।",
  "Connect channel": "চ্যানেল যুক্ত করুন",
  "channels connected": "টি চ্যানেল সংযুক্ত",
  "Drag to change priority order": "অগ্রাধিকারের ক্রম পরিবর্তন করতে টানুন",
  "Close channels": "চ্যানেল তালিকা বন্ধ করুন",

  /* ── Customer CRM Context & User Details ──────────────────────────────── */
  "Customer CRM Context": "গ্রাহক সিআরএম তথ্য",
  "No conversation selected": "কোনো কথোপকথন নির্বাচিত নেই",
  "Ticket Triage": "টিকেট ট্রায়াজ",
  Assignee: "দায়িত্বপ্রাপ্ত",
  Unassigned: "অনির্ধারিত",
  "Account Tier & SLA": "অ্যাকাউন্ট টিয়ার ও এসএলএ",
  "Account Tier": "অ্যাকাউন্ট টিয়ার",
  Plan: "প্ল্যান",
  Starter: "স্টার্টার",
  "Starter Plan": "স্টার্টার প্ল্যান",
  "Response SLA": "রেসপন্স এসএলএ",
  "Within 15 mins (Target Met)": "১৫ মিনিটের মধ্যে (লক্ষ্য অর্জিত)",
  "Target Met (<15m)": "লক্ষ্য অর্জিত (<১৫ মি)",
  "First Contact": "প্রথম যোগাযোগ",
  "Internal Team Notes (Private)": "টিমের অভ্যন্তরীণ নোট (ব্যক্তিগত)",
  "Internal Team Notes": "টিমের অভ্যন্তরীণ নোট",
  "Add an internal note for your team...":
    "আপনার টিমের জন্য অভ্যন্তরীণ নোট লিখুন...",
  "Add team note...": "টিম নোট লিখুন...",
  "Add Note": "নোট যুক্ত করুন",
  "User Details": "গ্রাহকের বিস্তারিত তথ্য",
  Company: "প্রতিষ্ঠান",
  "Individual Customer": "একক গ্রাহক",

  /* ── AI Copilot Drawer ────────────────────────────────────────────────── */
  "AI copilot": "এআই কপাইলট",
  Summary: "সারসংক্ষেপ",
  "Grounded in Agent Desk instructions, Knowledge, and the product catalog.":
    "এজেন্ট ডেস্ক নির্দেশাবলী, নলেজ বেস এবং পণ্য ক্যাটালগের তথ্যের ওপর নির্ভরশীল।",
  "Suggested replies": "প্রস্তাবিত উত্তর",
  "Tap to drop into the composer.": "কম্পোজারে নিতে ট্যাপ করুন।",
  "Next actions": "পরবর্তী পদক্ষেপ",
  "Run without leaving the thread.": "কথোপকথন না ছেড়েই সম্পন্ন করুন।",
  "Capture as lead": "লিড হিসেবে সংরক্ষণ করুন",
  "Draft an order": "অর্ডারের খসড়া তৈরি করুন",
  "The copilot never sends on its own — every suggestion waits for a human keystroke.":
    "কপাইলট নিজে থেকে কখনো বার্তা পাঠায় না — প্রতিটি পরামর্শের জন্য মানুষের অনুমোদনের প্রয়োজন।",
  "The copilot summarises the thread and drafts replies from your saved knowledge.":
    "কপাইলট কথোপকথনের সারসংক্ষেপ তৈরি করে এবং সংরক্ষিত তথ্য থেকে উত্তর খসড়া করে।",
  "Product question": "পণ্য সংক্রান্ত প্রশ্ন",
  Delivery: "ডেলিভারি",
  Payment: "পেমেন্ট",
  "Order tracking": "অর্ডার ট্র্যাকিং",
  "After-sales": "বিক্রয়োত্তর সেবা",
  "General enquiry": "সাধারণ জিজ্ঞাসা",
  "Close copilot": "কপাইলট বন্ধ করুন",

  /* ── Command Palette ──────────────────────────────────────────────────── */

  /* ── Overview Module Additions ────────────────────────────────────────── */
  "View queue": "কিউ দেখুন",
  Manage: "পরিচালনা করুন",
  "Nothing waiting": "কোনো অপেক্ষমাণ নেই",
  "Every open conversation has been answered.":
    "সব উন্মুক্ত কথোপকথনের উত্তর দেওয়া হয়েছে।",
  "All clear": "সব সম্পন্ন",
  "Every notification has been handled.":
    "প্রতিটি নোটিফিকেশন নিষ্পত্তি করা হয়েছে।",
  "{healthy} of {total} channels connected.":
    "{total}টির মধ্যে {healthy}টি চ্যানেল সংযুক্ত।",
  "Practice & Setup": "প্র্যাকটিস ও সেটআপ",
  "Checklist before going live.": "লাইভে যাওয়ার পূর্বের চেকলিস্ট।",
  "Open guide": "গাইড খুলুন",
  "Weekly volume": "সাপ্তাহিক ভলিউম",
  "Inbound vs outbound across all channels.":
    "সব চ্যানেলে আগত ও প্রেরিত বার্তার পরিমাণ।",
  "Jump to key workflows.": "গুরুত্বপূর্ণ কার্যক্রমে দ্রুত যান।",
  "Audit trail": "অডিট ট্রেইল",
  "New broadcast": "নতুন ব্রডকাস্ট",
  "Add product": "পণ্য যুক্ত করুন",
  "Invite teammate": "সহকর্মী আমন্ত্রণ জানান",
  "Review comments": "মন্তব্য পর্যালোচনা করুন",
  "Connect a channel": "একটি চ্যানেল যুক্ত করুন",
  "Today’s mix": "আজকের চ্যানেলের অনুপাত",
  "Recent activity": "সাম্প্রতিক কার্যক্রম",
  "Every mode change, answer, and publish.":
    "প্রতিটি মোড পরিবর্তন, উত্তর ও প্রকাশের রেকর্ড।",
  "The shortcuts we use most at this desk.":
    "এই ডেস্কে সর্বাধিক ব্যবহৃত শর্টকাটসমূহ।",
  "Where your conversations came from today.":
    "আজ কোন চ্যানেলগুলো থেকে বার্তা এসেছে।",
  Healthy: "সচল",
  Degraded: "ধীরগতির",
  Paused: "স্থগিত",
  "{count} total": "মোট {count}টি",
  "target {min}m": "লক্ষ্য {min} মিনিট",
  "{ai} of {open} open": "{open}টির মধ্যে {ai}টি উন্মুক্ত",

  /* ── Overview & Statistics ─────────────────────────────────────────── */
  "Open conversations": "উন্মুক্ত কথোপকথন",
  "Waiting on a reply": "উত্তরের অপেক্ষায়",
  "AI is handling": "এআই পরিচালনা করছে",
  "Past SLA target": "এসএলএ সময়সীমা পার",
  "needs a human now": "জরুরি মানুষের হস্তক্ষেপ প্রয়োজন",
  "all within target": "সব নির্ধারিত সময়ের মধ্যে",
  "Longest waiting": "দীর্ঘতম অপেক্ষমাণ",
  "Oldest first — the default inbox order.": "পুরোনোগুলো আগে — ইনবক্সের স্বাভাবিক ক্রম।",
  "Open inbox": "ইনবক্স খুলুন",
  "Needs attention": "মনোযোগ প্রয়োজন",
  "Channel health": "চ্যানেলের অবস্থা",
  "Continue setup": "সেটআপ সম্পন্ন করুন",
  "Practice mode — {setupDone} of {setupTotal} setup steps done":
    "প্র্যাকটিস মোড — {setupTotal}-এর মধ্যে {setupDone}টি ধাপ সম্পন্ন",
  "Test chats stay internal. Your trial starts when you go live.":
    "পরীক্ষামূলক চ্যাট অভ্যন্তরীণ থাকে। লাইভে গেলে আপনার ট্রায়াল শুরু হবে।",
  "Your desk at a glance — waiting conversations, AI handoffs, and channel health.":
    "আপনার ডেস্কে একনজরে — অপেক্ষমাণ কথোপকথন, এআই হ্যান্ডঅফ ও চ্যানেলের সার্বিক অবস্থা।",
};

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function translate(
  language: Language,
  text: string,
  vars?: Record<string, string | number>,
): string {
  const template = language === "bn" ? (bangla[text] ?? text) : text;
  return interpolate(template, vars);
}

type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (text: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function parseLanguage(raw: unknown): Language {
  return raw === "bn" ? "bn" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useStoredState<Language>(
    LANGUAGE_STORAGE_KEY,
    "en",
    parseLanguage,
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "bn" : "en"),
      t: (text, vars) => translate(language, text, vars),
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
