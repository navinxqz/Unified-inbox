# AiPraktor — Competitor Teardown & Playbook

> **What:** Full workflow / architecture / security analysis of [AiPraktor](https://www.aipraktor.com) (aipraktor.com), a Bangladeshi AI-commerce SaaS whose dashboard is a unified inbox for Facebook Messenger, Instagram DMs, Facebook comments, WhatsApp and website chat.
> **How:** Logged into the live dashboard (analyst account, English UI) and toured every sidebar page via browser automation, plus network/API inspection. 33 page snapshots (accessibility-tree YAML) and 2 screenshots are preserved in `docs/aipraktor-evidence/`.
> **When:** Nov 11, 2026. Account was in **Practice mode** (page "Coffee 9" never connected, 0 conversations), so UI structure, empty states, settings and API models were observable — not live chat data.
> **Why:** Use it as a reference playbook for our own unified-inbox project (`src/features/inbox/`, see `docs/saas-inbox-rework-plan.md`), and to spot the gaps we can fill (they have **no Discord, no Gmail/email** — we do).

Screenshots: [inbox](./aipraktor-inbox.png) · [overview](./aipraktor-overview.png)

---

## 1. Product positioning

- **One-liner (their words):** "AI automation for Messenger · Instagram · WhatsApp — ব্যবসা চালান আপনি, ঝামেলা সামলাবে AI" ("You run the business, AI handles the hassle").
- **Target market:** Small Bangladeshi online shops (clothing/panjabi/kurti sellers on Facebook pages) and, newer, **service businesses** (coaching, clinic, salon, travel — bookings & admissions). Bilingual **বাংলা / English** product, BDT (৳) currency.
- **Core promise:** An AI agent that answers customer chats 24/7, recognizes products from photos, understands voice notes (including Banglish — Bangla typed in English letters), takes orders with receipts, books couriers, chases reviews, and **hands off to humans when needed, then returns to AI automatically**.
- **Pricing model:** **No monthly fee.** Prepaid "AI credit", pay-per-request. Average **৳1–2 per customer handled end-to-end** (their clients' average, incl. their service charge). Free ৳50 credit on connecting a page (7 days). WhatsApp is a separate **৳900/month** pass-through charge. Manual top-up via bKash / Nagad / bank transfer.
- **Anti-chatbot positioning:** A comparison table on the homepage contrasts "ordinary chatbot" (fixed menus/keywords, blind to photos, mute on voice, can't take orders, forgets history, leaves customers hanging when a human is needed, monthly fee) vs AiPraktor (free-form understanding, photo recognition from the catalog, voice, orders + receipts + courier updates, full memory, auto handoff + auto-revert, pay-per-use).
- **Value math they publish:** moderator at ৳15,000/mo ÷ 200 work-hours = **৳1.25 per hand-written reply**; AiPraktor handles a whole customer for ৳1–2. Used as the core sales argument.
- **Trust narrative (they lean hard on it):** OAuth (never asks for your Facebook password), Meta 24-hour messaging rule respected, WhatsApp ban-risk honestly disclosed, no cookies/trackers, encrypted channel keys, nightly encrypted off-site backups, data deletion on request. Legal pages: /privacy, /terms, /data-deletion, plus /help, /careers, /partners.

## 2. Tech stack (observed, not guessed)

| Layer | Observation |
|---|---|
| Frontend | **Next.js App Router** with React Server Components — `_rsc` query param on route transitions, `main-app` webpack chunk, `app` RSC payload pattern |
| Serving | **nginx/1.28.3 on Ubuntu** in front of the Node app |
| Deploy | **Blue-green slots** — response headers `x-aipraktor-slot: aipraktor-a` and `x-aipraktor-build: <hash>` |
| Security headers | `Strict-Transport-Security` (max-age ~1 year, includeSubDomains), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` |
| Auth | **No cookies at all.** Bearer token in `localStorage`: `ct_key` = `cadm_…` admin token; `ct_auth` = JSON blob (role, workspaceId, page list, permissions). Sent as `Authorization` header |
| Realtime | **Polling**, not WebSockets — `/api/inbox/pulse` returns a version string; client refetches lists when the version changes. An "Auto-revert sweeper is running · SYSTEM ONLINE" status pill + live clock in the top bar |
| i18n | Runtime বাংলা/English toggle per page (`group Language` with two buttons), marketing site defaults to Bangla |
| PWA | Installable app ("Open your browser's menu and choose Install app / Add to Home screen"); per-device notification settings |
| Widget | One-line `embed.js` loader → iframe (see §6.4) |
| Meta integration | Own Meta app **id 1219610400365298**, **Graph API v26.0**, OAuth callback `https://www.aipraktor.com/api/connect/facebook/callback` with `state` param; page subscriptions managed server-side |
| Browser companion | Chrome extension **"AiPraktor Assistant" v1.0.2** (web store id `amnajnlfhelammpbnbbgcfhnbkjjjpmj`) |
| Support | In-dashboard AI support agent ("AiPraktor Agent") with human escalation, screenshot paste (Ctrl+V), voice |

**API surface seen from the dashboard** (all under `/api/…`, JSON, bearer-auth, per-request workspace scoping):

- `/api/auth/me` — session/identity
- `/api/organization` — org/workspace record
- `/api/inbox/pulse` — lightweight polling endpoint returning a version/delta string
- `/api/inbox`, `/api/conversations` — inbox list/thread data
- `/api/labels` — inbox labels
- `/api/notifications` + counts endpoints — notification queue
- `/api/features` — **full feature-flag catalog** (see §13)
- `/api/connect/facebook/health` — connection status check
- `/api/whatsapp-term` — WhatsApp terms/consent content
- `/api/credit` — AI credit balance / usage
- `/api/orders`, counts endpoints for orders/leads/etc.

## 3. Information architecture — the full dashboard

Sidebar groups (exact IA, with routes) — this is the single most borrowable artifact:

```
Setup guide 0/8            (/dashboard#setup-guide)      ← persistent progress chip
WORK
  Overview                  /dashboard
  Inbox                     /dashboard/inbox
  Notifications             /dashboard/notifications
  Comments                  /dashboard/comments
  Saved replies ⚡Auto       /dashboard/saved-replies    ← "can answer customers automatically, free"
  Orders                    /dashboard/orders
  Activity                  /dashboard/activity
  Analytics                 /dashboard/analytics
  Announcements              /dashboard/announcements
GROW
  Follow-ups                /dashboard/followups
  Broadcasts                /dashboard/broadcasts
  Products                  /dashboard/products
  Posts                     /dashboard/posts
  Knowledge                 /dashboard/knowledge
  Website chat              /dashboard/website
  Agent Desk                /dashboard/agent-desk
SET UP
  Pages                     /dashboard/pages
  Business settings         /dashboard/business
  Billing                   /dashboard/billing
  Team                      /dashboard/submasters
  Groups                    /dashboard/groups
  Setup                     /dashboard/setup
  Video guide               /dashboard/videos
HELP
  AiPraktor Agent           /dashboard/help
  Feedback                  /dashboard/feedback
```

Sidebar footer: **SYSTEM ONLINE** pill ("Auto-revert sweeper is running"), signed-in email + role ("Business owner"), an **On duty** switch, "This device" link (`/dashboard/device`), Sign out.

Top bar: **LIVE · AI ⟷ HUMAN** status, a "Watch how · N min" **contextual micro-video** button that changes per page (1–9 min videos everywhere), Light/Dark theme radios, system-online pill, live clock.

Orders module has its own sub-nav: **Orders · Customers · Scan · Courier · To chase · Report · Discounts**.

Two persistent UX devices worth stealing:
1. **"Watch how · 1 min" contextual video help** on every page — short screencasts matched to the page you're on.
2. **Setup-guide progress chip (0/8)** always visible in the sidebar — resumes onboarding wherever you left it ("Whatever you leave stays at the top of your Overview — it is not lost").

## 4. Onboarding / setup funnel (`/dashboard/setup`)

Seven-step wizard with a practice-mode gate. Steps (buttons): **Facebook → Your business → Add your products → Turn on alerts on your phone → Courier → Your team → Go live**.

- **Practice mode:** "Your assistant answers test chats only. Nothing reaches a customer before you go live. Your free trial days start counting when you go live." Website chat warns the same: until live, visitor messages go to the team, not the AI.
- **"Help me connect" escape hatch:** if the FB page won't connect, a button tells their team, and **they phone you** — human-in-the-loop onboarding, plus "Stuck? Tell the AiPraktor Agent" support button.
- Homepage "live in 10 minutes" timeline: 0:00 sign-up → 0:02 connect FB page → 0:04 WhatsApp (optional, QR) → 0:06 business facts → 0:08 test message → 10:00 live.
- Setup guide step persistence; the Overview page carries unfinished items at the top.

## 5. Channel architecture (the heart of the product)

AiPraktor's channel model: **a "page" is a channel container** owned by the business. Every page shares the business's products, offers and instructions, and keeps its own inbox. AI per-channel can be switched off/on anytime — "messages are saved either way".

### 5.1 Facebook (Messenger) — OAuth
- "Connect with Facebook" → OAuth via their Meta app (1219610400365298, Graph v26.0) with `state`, callback `/api/connect/facebook/callback`.
- User-facing copy is explicit about the flow: "Sign in once and this page is connected — its messages start arriving and its Instagram is found, without anything to set up in Meta's dashboard. On Facebook's screen, **tick the page you want to connect** and continue. If another page is already ticked there, leave it ticked — unticking it switches that page off."
- Observed scope families: `pages_show_list`, `pages_messaging`, page metadata/engagement, `instagram_manage_messages`, `instagram_manage_comments`, `instagram_content_publish`, `read_insights` (business/insights access for the ads tie-in).
- **Per-page sign-in:** each page has its own Facebook connection; until connected "its messages do not arrive and the AI cannot answer on it".
- Marketing claim (FAQ): FB page + Instagram run "Meta's official system" and the AI obeys Meta messaging rules incl. the 24-hour window. Revocable from dashboard **or** from Facebook settings.

### 5.2 Instagram — piggybacks on FB
- "Connect Facebook first — an Instagram account is reached through the page it is linked to, using that same key."
- One checkbox during FB connect: "Also ask for Instagram permissions — untick if there is no Instagram account; **asking later costs a second sign-in**."

### 5.3 WhatsApp — unofficial linked-device (deliberate trade-off)
- Provider: **WaSender**; the number links as a **WhatsApp-Web-style linked device via QR scan** — *not* the official Business/Cloud API. The phone keeps working normally.
- Costs **৳900/month** (a pass-through for the session service — "not AiPraktor's service charge and not AI credit"), paid from Billing (`Billing → WhatsApp`), switched on when the payment is verified. Video disclosure first: "Before you add WhatsApp: the cost, the risk, how to pay · 4 min".
- **Ban risk is honestly disclosed.** Their mitigation rules: AI on WhatsApp **only replies to people who messaged you first** — no mass messages, no broadcasts on WhatsApp ever. All conversation history is stored, so even if the number must change, customer history survives.
- A "Contact your account manager" (wa.me/8801627777482) and `mailto:support@aipraktor.com` deep-links are embedded on the WhatsApp panels.

### 5.4 Website chat — one-line widget
Config (`/dashboard/website`):
- "A support button on your website: **Live chat and Voice call** first, then your WhatsApp, Messenger and phone" — replaces the site's old contact button. Same assistant, same knowledge; humans can take over from the Inbox.
- Modes per feature: **Off / Test / On** radios. Voice call ("they talk, and the AI answers aloud… a spoken answer costs about three times a typed one") was globally switched off by the vendor at the time of analysis.
- **Lead capture:** every visitor gives a **name and mobile number** first — "each chat is also a lead".
- Branding: name shown in chat, logo (https image URL, square works best), colour (`#111827` default), plus optional WhatsApp number / Messenger (`m.me/yourpage`) / phone fields.
- **Daily limit:** visitor messages the AI answers per day (empty = no limit); past the limit messages go to the team. Hard cap: **one visitor gets at most 200 AI answers a day**. Answers are paid from AI credit.
- **Domain allowlist:** "Your website address… one per line if you have more than one. The widget works only on these; any other website is refused, so nobody else can use your credit."
- **Technical embed (verified from `embed.js`):** loader script reads `data-site` (format `site_[0-9a-f]{16}`), creates an **iframe** to `origin + "/embed/" + siteId + "?lang=&test=&r=&b="`, bootstraps via **postMessage with an origin check** and an `{aipraktor:1}` flag; cached busting params included. Widget test mode maps to the `test=` iframe param.

### 5.5 Facebook & Instagram comments — moderation engine
- Every comment under your posts: what the AI answered and what was removed. Tabs: **Comments / Posts**; periods 7/30/90 days; queues: **To check · All · Needs you · Unanswered · Complaints · Removed**. "A new comment waits here until someone on your team has looked at it and pressed Done. Done only clears it from this list — nothing changes on Facebook."
- **Rules dialog (one set of rules for the whole business):**
  - Sure it's junk (ads, scam links, abuse) → **Delete** or **Hide** (default: delete; deleted items remain listed under Removed with their text).
  - Not sure → hide + tell you; you decide delete/restore.
  - Comment attacks the business ("calls it fake or a fraud, mocks it, tells people not to buy") → hide + tell you; **the AI never answers it, in public or in private**; under Complaints you delete, block the person, or restore.
  - Customer complains under a post → radio: **Hide it — a person answers, and you are told** (default) or **The AI answers in public and in private, and you are told**.
  - Customer writes a phone number in a comment → ON switch: hide the comment, save the number to their lead "so other sellers cannot copy it"; the AI still replies.
  - **Blocked-words list:** max 50 entries, case-insensitive; matching comments are never answered — per-word choice of Hide or Delete.
  - **Blocked people** region: a blocked person can no longer comment or message the page (blocks made on Facebook itself don't show here).
- AI can reply to a comment **and** continue in the inbox ("কমেন্টে নাম ধরে উত্তর, সাথে ইনবক্সে মেসেজ").

### 5.6 What they do NOT have (our differentiation)
No **Discord**, no **Gmail/email**, no Telegram, no Slack, no SMS, no Twitter/X. Broadcast channels are Messenger/Instagram only. There is no webhook marketplace or public API for third parties. WooCommerce is the only store integration. → Our target channel list (Messenger, FB page chat, WhatsApp, **Discord**, **Gmail**, …) is strictly a superset — that is the wedge.

## 6. The inbox workflow (AI ⟷ HUMAN)

### 6.1 Conversation modes & handoff
- Every conversation is in one of: **AI** (AI এই চ্যাট সামলাচ্ছে) / **Human** (with reason: e.g. "কারণ: অভিযোগ") / **Human · <teammate>** (with countdown timer) / **Reverting**.
- AI decides it needs a person for: **complaints, refund requests, special requests** — and **writes down why** ("AI নিজেই বোঝে কখন মানুষ লাগবে, আর কারণটা লিখে রাখে").
- Team learns via **phone push + Chrome extension + dashboard** simultaneously.
- **Claim/takeover:** one tap ("একজন এক ট্যাপে দায়িত্ব নেন"); the notification shows waiting time (e.g. "অপেক্ষা ০:৪২").
- **Auto-revert sweeper:** chats handed to a human **revert to AI automatically** after the window expires — "কাউকে মনে রাখতে হয়নি" (nobody has to remember). The sweeper's running state is a sidebar status pill.
- **"." takeover trick:** from **Messenger or WhatsApp itself**, a teammate writes a single `.` to take the chat into their own hands (works because teammates are logged into the same page/number).
- Inbox ordering: "যিনি সবচেয়ে বেশিক্ষণ অপেক্ষা করছেন, তিনি সবার ওপরে" — **longest-waiting on top**.
- Sidebar **On duty** switch: whether this user is on the human roster.

### 6.2 Page-level inbox settings (per page)
- **Default auto-revert window** — presets 30m/1h/2h/4h/6h/8h/12h/24h **+ free-form minutes** (default 60). "Shared across your team and used by the automation."
- **SLA target — flag waiting chats after** — presets 5m/10m/15m/30m/60m (default **15m**): "A chat waiting on a human longer than 15m turns red in the queue so nobody gets forgotten."
- **Replying from the app:** Allow replies / View-only ("Team can read AND reply to customers from the app").
- **Auto-lead on handoff** On/Off: "Leads come only from the AI saving one during a chat, and from what you add by hand."
- **Automatic follow-ups** — vendor-managed ON ("Switched on by AiPraktor — contact your account manager"), per-page audience: Both / Hot only / Warm only.
- **Broadcasts** — same vendor-managed ON pattern.
- **Delivery problem notice** On/Off: when the courier reports a failed attempt or hold, the customer is told why and asked when to retry — **at most once per 20 hours per order**; a team task opens either way.
- **Wait before answering** (on Pages list): seconds 0–15, **standard 15** — "The AI waits a few seconds before it answers, so a customer who writes one question in two or three messages gets one answer… each answer is charged to your credit. At 0 that happens with every message. Photos have their own short wait."
- **Sales reported to Meta** (per page, free, ON): "we tell Meta about the sale — **the amount only**, never the customer's name, phone or address — so your Facebook ads learn which chats buy and find more people like them." (This is the Meta Conversions/offline-events tie-in behind `read_insights` / `meta_sales` feature.)

### 6.3 The customer drawer (right panel)
Per-customer full story timeline: photos sent (with what the AI saw in them), product cards viewed, voice notes transcribed, orders with ratings, today's message. Beside it an **AI copilot** with four actions: **সারাংশ (Summarize) · প্রশ্ন করুন (Ask anything, e.g. "what did they buy before?") · পরের রিপ্লাই (Draft next reply) · লিড বানান (Make a lead)**. Same assistant is available inside Meta Business Suite via the Chrome extension.

### 6.4 Saved replies (`⚡Auto`)
- "Answers your team sends with **/** in any chat — and ones that go out **by themselves, free**, when a customer writes the same words." (Two layers: keyword-triggered auto-answers are free because they don't hit the LLM; slash-replies are manual.)
- **AI helpers** (each switchable, each consumes AI credit):
  1. **Suggest the fitting reply** — "Above the reply box, the saved replies that fit the customer's last message offer themselves. One tap puts one in the box." Cost: "a very small amount of your AI credit for each new customer message — and nothing while you have no saved replies." (feature flag `saved_reply_chips`)
  2. **Adapt with AI** — a small button in the reply box rewrites a saved reply (or a typed message) for the customer in front of you. **"Prices, numbers and links are never changed."** (flag `saved_reply_adapt`)

## 7. AI system

### 7.1 Agent Desk (`/dashboard/agent-desk`) — instruction management
"Your part of your assistant's instructions. Add what it should know, test it with a message, and publish it when it answers the way you want."

- Separate fields: **Business name**, **Open hours** ("saved straight away").
- **Instruction blocks** (structured prompt sections, with per-block Write buttons and a drafted-characters counter):
  1. **About the shop** — "What your shop is and what you sell, your address, your hotline and how customers pay. Plain sentences, one fact per line."
  2. **Delivery — charges, times and when you ship** — three specific lines: WHAT DELIVERY COSTS ("by area, by weight, or both"), HOW LONG IT TAKES, WHEN YOU HAND PARCELS OVER. Their example copy: "Shipping — orders placed before 5pm are normally handed to the courier the same day; after that, the next working day." Note: "This is the one most shops forget, and it is what lets the assistant tell a customer which day their order arrives."
  3. **Your voice** — formal/friendly, emojis, greeting for brand-new conversations, what you never say.
  4. **Your exact words** — verbatim answers (discount request reply, refund/exchange policy, warranty line, out-of-stock line).
  5. **Anything else** — "Short and specific beats long and general."
- Plus **Add instruction** for custom blocks.
- **Publish flow:** draft → test → publish; **Undo last publish** / published-versions list. Natural-language change requests ("ডেলিভারি চার্জ ৮০ টাকা করো") are shown as a Helper dialog: AI confirms current value, proposes the change, runs tests, asks to go live — with one-click rollback.
- **Test-it pane:** "Write, send photos or a voice note as if you were a customer — your real assistant answers… You see exactly what a customer would see. Nobody else sees it." Test photos/voice kept **only for testing and deleted after 8 days**.

### 7.2 Knowledge (`/dashboard/knowledge`) — RAG
- "Fees, requirements, packages, delivery and return rules — the long tail. The AI looks a fact up here when a question needs it. Hours, the address and payment numbers stay in your business facts."
- Doc upload; **"the AI gains the rule to look things up the moment the first one is saved"** — retrieval is conditional on knowledge existing.
- Marketing demo shows retrieval metadata: "রিটার্ন নীতি কী? → **3 passages found · meaning + words**" — i.e. **hybrid retrieval (semantic + keyword)**.
- A **test-question box** ("Ask a test question — the same door the AI uses", e.g. "Italy te bachelor korte IELTS lage?").

### 7.3 Multimodal capabilities
- **Photo recognition:** matches a customer's photo to the catalog "three ways — কোড → হুবহু ছবি → দেখতে কেমন" (product code → exact image → visual similarity). If unsure, it does **not guess**: it shows the closest 3 and asks. Products are **"indexed once, on your account's AI credit"** so photo questions don't re-embed every time (flag `image_describe`).
- **Voice notes:** transcribed and acted on — name, number and address spoken → order confirmed with receipt (understands Banglish; answers in Bangla).
- **Product cards in chat:** price + code + "এটি নিতে চাই" (take it) / "বিস্তারিত" (details) buttons; category buttons → product carousel; receipts are structured messages; rating widget after order ("Rate us" → ★★★★★).
- **Guardrails:** never invents prices ("দাম কখনো নিজে থেকে বানায় না" — answers only from the catalog); when unsure it asks the customer or hands to the team.
- **Sale price in chat** (flag), **product page** (flag) — product detail interactions in-thread.

## 8. Commerce modules

### 8.1 Orders (`/dashboard/orders`)
- "Your shop's order book — every order from confirmation to the courier parcel and the cash to collect, **with a history of every change. Orders are never deleted, only cancelled.**"
- **Stage tabs:** All · Pending · On Hold · Exported · Approved · Processing · Ready to Ship · In-Transit · Delivered · Flagged · Cancelled · **Store** (a separate lane for orders synced from the connected store, vs "AiPraktor"-sourced).
- Filters: page (multi-page), **source** (AiPraktor vs Store), test-orders toggle, generic Filters, **Export**, New order (manual), search by name/phone/order number.
- Sub-pages:
  - **Customers** — customer list derived from orders/chats.
  - **Scan** — "Scan the code on each invoice, or type the order number, to build a list — then move every order on it in one go." Camera support; every printed invoice carries a QR in its top corner.
  - **Courier (handover)** — "**Money with the couriers**" (COD cash held, last 45 days) + **Handover sheet**: the day's parcels per courier (Steadfast / Pathao / RedX / eCourier) filterable by day (Dhaka timezone) and page, printable — "the sheet the rider signs". Only parcels booked through the panel appear.
  - **To chase** (`/orders/incomplete`) — people to chase.
  - **Report** — sales figures.
  - **Discounts** — discount management.
- **Courier update automations:** on handover, on delivery morning, and post-delivery review ask; each chat message includes a **Track button**. Delivery-problem notices capped at once per 20h per order (§6.2).

### 8.2 Products (`/dashboard/products`)
- Tabs: **Catalog · Sync · Photos · Stock · Numbers**. Filters: All / Featured / Hidden from the AI ("the AI never offers these") / Not ready for the assistant / No photo at all / Without a photo / Edited in the panel (not in the source yet) / Deleted (restore any time).
- CSV upload on the Sync tab with an **approve-preview first** ("A sync shows you what it would change before it changes anything"). WooCommerce store sync included.
- Every product **indexed once on the account's AI credit** for photo matching and wording suggestions.
- Captions tip (Posts page): "when you post several photos, give each photo a short caption with the product's name and code. The AI then knows every product for certain, at no cost."

### 8.3 Posts (`/dashboard/posts`)
- "Every Facebook or Instagram post a customer comments on is read once: AiPraktor remembers **which of your products each photo shows**… If a photo shows the wrong product, tap **Fix** and type the right code — several codes with commas when the photo shows more than one — or choose 'None of our products'. What you give is remembered, and the same picture in a later post is recognised."

### 8.4 Business settings (`/dashboard/business`) — set once, applies to every channel
- **Review ask after delivery** — default **Off**; review link field, **minutes after delivery** (default **1440** = 24h), custom sentence. "A delivered parcel ends quietly; the chat still shows the courier's status."
- **Upsell discount** — store coupon code + what the AI says. "Empty: the AI suggests related products but never a discount."
- **Special offers** list — product code, AI label, start/end dates, one-line rule (e.g. "buy 2 → delivery free"). "The AI presents these product codes as today's offers… this list never changes a price" (price truth stays in the catalog).
- Cross-links: catalogue (Products) and documents (Knowledge) are also business-wide.

## 9. Growth modules

### 9.1 Follow-ups (`/dashboard/followups`) — automated win-back
- **Judgment delay: 3 quiet hours** after the customer's last message. Then classify:
  - **Hot** = asked about a product **and** its delivery/address/quantity, or said they'd order → reminders at **3h and 20h** (2 reminders).
  - **Warm** = only asked about the product/price → **1 reminder at 20h**.
- "Never more than 2 per visit, never after Meta's 24-hour window, and never in a chat a person on your team has taken over." The system **may choose silence** — person owns the chat / already ordered / said no — **and says why** (Skipped queue with reason).
- Stats tiles: Watching now / Planned / Sent · 14d / Replied · 14d / **Ordered after · 14d** (the ROI metric). Queues: Watching / Upcoming / Sent / Skipped / For the team.
- Optional **offer with the last reminder**: "a discount card (no code), valid for hours — the AI honours it only until then."
- Per-page toggles (audience Both/Hot only/Warm only); switching a kind off cancels its planned reminders "within a minute".

### 9.2 Broadcasts (`/dashboard/broadcasts`)
- "A short offer to everyone who wrote to you in the last few hours… Only people who messaged within the last **23 hours** can receive it (Meta's rule), and **nothing goes out before a test lands on your own phone**."
- Composer, 3 steps:
  1. **Who** — messaged within last 1–23h; channel **Both / Messenger / Instagram**; interest (hot / warm / none — from follow-ups); bought before (doesn't matter / yes / never ordered); **skip anyone messaged by a broadcast in the last 6–168h**; live recipient count ("…people would receive this right now").
  2. **What they see** — formats: Text · Text + quick replies · Message with buttons · One product card · Product carousel · Discount card · Photo. Bangla or English "exactly as the customer reads it"; speak-instead-of-typing.
  3. **The offer (what the AI will honour, and until when)** — No offer / % off / ৳ off / Free delivery / Special price on these products / Custom. "the coupon is real in the store".
- Flow: compose → **Save as draft** → in Drafts & scheduled: **send yourself a test**, then Send now or Schedule. Phone-preview pane. Per-page ON/OFF switch (mirrored in page settings).

### 9.3 Leads (`/dashboard/leads`)
- Master switch: off = "The AI does not write down leads and you get no follow-up notifications. Phone numbers customers give still go onto their chat… Leads you already had are kept."
- 6-stage pipeline ("৬ ধাপের পাইপলাইন, আজ কাকে ফোন করবেন" — whom to call today). Sources: AI extraction from conversation (name, phone, interest), auto-lead on handoff, manual, website-chat sign-up gate, phone numbers dropped in comments (auto-hidden + saved).

## 10. Team, roles & audit

### 10.1 Team (`/dashboard/submasters`)
- "Teammates who answer customers and work the orders. Each is invited by email and chooses their own password; a group says they can do."
- **Record of changes** button (audit log of team mutations).

### 10.2 Groups (`/dashboard/groups`) — RBAC
- "A group says what its people can do. Put a person in one or more groups; **the most generous one wins**. The business's own login is the **owner**: it can do everything and is in no group."
- **Can-do vs can-see** as two separate dimensions per module. Ready-made groups:
  | Group | Can do | Can see |
  |---|---|---|
  | **Manager** | Inbox, Leads, Orders, Products, Bookings, Follow-ups and broadcasts, AI instructions and knowledge, Team, Connections and settings — *everything except Billing* | Reports |
  | **Inbox** | Inbox, Leads | Orders, Products, Bookings |
  | **Orders and delivery** | Inbox, Orders | Products |
  | **Products** | Products | Orders |
  | **Accounts (হিসাব)** | Billing | Orders, Reports |
- More ready-made (add-on): **Sales** (follow up leads, take orders), **Bookings** (confirm/change bookings), **Marketing** (run follow-ups & broadcasts, read results), **Viewer** (sees everything, changes nothing). All renameable/editable; Open / Copy actions.
- Owner sees every page; teammates see only pages you assign; per-teammate "assigned chats" scope exists (Notifications has a "Given to me" filter).
- **View-as impersonation** exists in the product (owner can preview what a teammate sees).

### 10.3 Activity (`/dashboard/activity`) — audit trail
- "Every mode change, from every source — including each automatic reversion." Sources filter: **All sources / Dashboard / AI / Auto-revert / Bulk / Answered**. **Export CSV**, and a **STREAMING** badge (live tail). This is the forensic record of AI⟷HUMAN transitions.

## 11. Notifications & devices

### 11.1 Notifications (`/dashboard/notifications`)
- "The record of every handover, AI alert and handed-back follow-up — **kept until a person clears it**. A phone alert can be missed or silenced; this list cannot. If you have already dealt with something, mark it done anyway: that is how the queue stays honest."
- Stat tiles: **Waiting for someone** ("nothing closes on its own") · **Past its target** ("older than the page's response time") · **Never answered** ("the chat went back to the AI first") · Done.
- Queues: Needs attention / Done / All. Category filters: **Everything · Handovers · AI alerts · Follow-ups · Calls · Bookings · Payments · Website leads · Requests · Given to me**. Periods 7d/30d/60d/All time.

### 11.2 This device (`/dashboard/device`)
- Per-device (not per-account) settings: browser **notifications** on/off, **Inbox sound** ("a short ping (and a buzz on a phone) when a new chat starts waiting, while the Inbox is open"), and PWA install instructions. "These settings are remembered on this device only — your other phone or computer keeps its own."

### 11.3 Chrome extension ("AiPraktor Assistant" v1.0.2)
Works **inside Meta Business Suite** alongside the native inbox: summarize conversation, draft reply, takeover, lead card, desktop alerts. Lets teams keep their Meta muscle memory while AiPraktor powers the assist. (Web store: `aipraktor-assistant/amnajnlfhelammpbnbbgcfhnbkjjjpmj`.)

## 12. Analytics (`/dashboard/analytics`)

Two tabs: **Overview** and **People**. Periods 7d/14d/30d (people tab: 30d/90d + compare).

**Overview** — the metric set:
- **Handoffs**: handoffs to humans, **auto-reversions**, total events, avg events/day.
- **Response & SLA**: **avg first response**, **SLA breach rate**, **waiting now** (deep-links to `/dashboard/inbox?view=waiting`), **longest wait now**.
- **Activity over time**: daily handoffs vs auto-reverts chart.
- **Current split**: chats by AI / Human / **Reverting** (3-way conversation-state distribution).
- **Busiest pages**, **By source**.

**People** — per-teammate scorecard: Person · Chats · Taken over · Given · Answered · Replies · Typical reply · In time · Leads won · Leads lost · **Dropped** · **Not opened**. Footnotes: "Under 10 chats a person's speed is not shown — too few to judge"; reply attribution only exists since they started stamping senders (Oct 2026). ▲▼ compare vs the previous 30 days.

## 13. Feature-flag catalog (`GET /api/features`)

The dashboard ships a feature catalog with descriptions — a clean pattern for progressive rollout per workspace:

| Flag | Meaning (from descriptions) |
|---|---|
| `bookings` | service-business bookings (request → one-tap confirm, reminders day-before & hours-before, advance payment w/ TrxID) |
| `knowledge` | doc-upload RAG |
| `leads` | lead pipeline |
| `meta_sales` | report order amounts to Meta for ads learning |
| `whatsapp` | WhatsApp channel |
| `followups` | automatic follow-ups |
| `broadcasts` | broadcast desk |
| `orders` | order book |
| `woocommerce` | store sync |
| `products` | catalog |
| `special_offers` | business-level offers list |
| `courier` | courier booking/handover |
| `product_page` | product detail interactions in chat |
| `stock` | stock answers ("কোন সাইজ স্টকে আছে") |
| `sale_price_in_chat` | sell at catalog price in chat |
| `image_describe` | photo recognition |
| `saved_reply_chips` | suggest fitting saved reply |
| `saved_reply_adapt` | AI-rewrite saved reply |
| `agent_desk` | instruction management desk |
| `team` | teammates/groups |

## 14. Billing (`/dashboard/billing`)

- **AI credit** balance, top-up, and full usage. "No monthly fee — you only pay for what your assistant does. Prices include AiPraktor's service. Every top-up is added to your credit in full."
- **Low-balance warning** at ৳10 (standard, changeable) — by email; when credit runs out the AI stops and resumes by itself after recharge.
- **Your customers** counters per period (Today/Yesterday/7d/30d/This month/Last month/Pick dates).
- **"Every AI request, one by one"** — itemized ledger: what, when, for which customer, its price, download as CSV; filters Everything / Succeeded and failed / Succeeded only / Failed only. (Radical billing transparency — their pricing trust device.)
- **Add credit flow (manual mobile-money):** purpose = AI credit or **WhatsApp · ৳900 a month** → amount (presets ৳1,000/2,000/5,000/10,000, or custom, **minimum ৳1,000**) → payment tabs **bKash / Nagad / Bank transfer** with step-by-step instructions (bKash: Send Money to **01724501119 (Personal)**, copy amount, **reference code AP-99B7E4** "so we can find your payment") → **Transaction ID** entry (+ optional sender number, note) → "I've paid — confirm my top-up". "Nothing is charged here. This tells us to look for your payment." Credit: **does not expire, not refundable** (Terms /terms#fees). One balance shared by all pages/channels.
- **Top-ups list** with progress states; **Statement** CSV export for 30/90/365 days.
- **Setup service** — optional white-glove setup ("Our support agent can do it all for you… The cost differs from business to business — ask below, and our support agent calls you and tells you before anything is paid.") — a human-services upsell on top of SaaS.
- Economics from the homepage: **৳1–2 average cost per customer handled end-to-end**; free ৳50 credit on first page connect (7-day trial); a spoken (voice) answer ≈ 3× a typed one; a broadcast/test costs nothing extra beyond per-message credit.

## 15. Security & privacy posture

**Claimed and partially verified:**

1. **No cookies, no trackers, no analytics beacons; no data selling** (verified: zero Set-Cookie on dashboard; auth via localStorage bearer).
2. **Channel keys encrypted at rest and never rendered** — "Facebook, WhatsApp আর AI সংযোগের চাবি এনক্রিপ্ট করে রাখা হয় — কোনো স্ক্রিনে বা ব্রাউজারে কখনো দেখানো হয় না।"
3. **Nightly encrypted off-site backups; the backup key is not stored on any server** (key held elsewhere — split-knowledge claim).
4. **Per-request workspace isolation** — "প্রতিটা অনুরোধে সার্ভার এটা যাচাই করে" — every API call re-checks that the caller's workspace may see the data; no other business can ever see yours.
5. **Minimal data to the AI provider** — only the needed fragment goes to the LLM per reply.
6. **Access model:** only the owner + invited teammates (scoped by pages/groups) + AiPraktor's own ops (they run the service) can read chats.
7. **Meta OAuth, no password custody** — connection revocable from either side; WhatsApp disclosed as unofficial with contained behavior (reply-only) to reduce ban risk; history survives number changes.
8. **Meta sales reporting** shares **amount only** — never name/phone/address.
9. **Data deletion on request** (/data-deletion page); stopping the service deletes nothing until asked; test media in Agent Desk auto-purged after 8 days.
10. **Transport:** HSTS (~1y), nosniff, SAMEORIGIN framing, strict-origin-when-cross-origin referrers; widget postMessages are origin-checked with a domain allowlist so a copied embed can't drain someone's credit.
11. **Audit:** Activity log of every mode change incl. automatic reversions, exportable; Team "Record of changes".

**Weak points we should not copy:**
- **localStorage bearer token** — no HttpOnly cookie, no refresh rotation observed → XSS would be session theft; also breaks cross-tab SSO safety and sign-out guarantees (token deletion is client-trust).
- **Manual TrxID payment verification** — fine for BD market fit, but fraud-prone and slow (humans reconcile payments).
- **Polling instead of realtime** — simpler, but adds latency to the exact thing they sell (fast replies).
- No visible 2FA on accounts (email + password only), no SSO/SAML, no SCIM; no public API/webhooks for customers.

## 16. What to copy into our unified inbox (recommendations)

Mapped to our codebase (`src/features/inbox/`, plans in `docs/saas-inbox-rework-plan.md` and `docs/channel-icons-reply-composer-plan.md`):

### 16.1 Information architecture
1. **Adopt their sidebar groups** — Work / Grow / Set up / Help — with our channel-centric additions. Their `Saved replies ⚡Auto` chip and `Setup guide 0/8` progress chip are cheap, high-signal.
2. **Setup guide wizard with practice mode**: 8-step checklist (connect channel → business facts → products → alerts → integrations → team → go live), resumable, surfaced on Overview. Practice mode (test chats only, trial starts at go-live) is a brilliant trust device — build it into our channel simulator.
3. **"Watch how · 1 min" per-page micro-videos** (or annotated tours) in the top bar — onboarding without docs.
4. Keep our **Cmd+K palette**; add their **longest-waiting-on-top** inbox default and a `?view=waiting` deep-linkable queue.

### 16.2 Conversation model (the crown jewel)
5. **AI ⟷ HUMAN as a first-class conversation state** with: reason for handoff (complaint/refund/special request), claim/takeover (one tap), **auto-revert sweeper** with per-page window (presets 30m–24h, default 60m, free-form override), **SLA flag** (presets 5–60m, default 15m, red-in-queue), and a visible "Reverting" third state. Surface the sweeper as a SYSTEM ONLINE pill.
6. **"." takeover from the channel itself** (Messenger/WhatsApp/Slack-compatible pattern) for teammates living inside the native apps.
7. **Activity audit trail** of every mode change (sources: dashboard / AI / auto-revert / bulk / answered), streaming, CSV export.
8. **Notifications queue that never auto-closes** — "needs attention" persists until Done; stats: waiting / past target / never answered (reverted before a human replied); filters incl. "Given to me".
9. **Wait-before-answering debounce** (0–15s, default 15) to batch multi-part customer messages — saves AI cost, feels human.

### 16.3 Channels
10. **Facebook/Instagram:** mirror their OAuth UX copy — page-tick guidance, IG-permission checkbox up front ("asking later costs a second sign-in"), per-page connection state, `connect/health` endpoint for status.
11. **WhatsApp:** they use unofficial linked-device (ban risk). **We should go official WhatsApp Cloud API** — that's a selling point against them (no ban risk, template messages, broadcasts legally possible). Keep their honesty pattern: a risk/cost disclosure video before enabling.
12. **Website widget:** copy the `embed.js` → iframe → origin-checked postMessage pattern with **domain allowlist + per-site id** (`site_<16hex>`), Off/Test/On modes, per-visitor daily AI cap (200), lead-gate (name + phone), branding fields.
13. **Comments moderation:** their rules matrix (junk delete/hide · unsure→hide+notify · attack→hide+never-engage · complaint→human or AI policy choice · phone-number scraping guard · 50-word blocklist · blocked-people) is directly portable to any social channel, and to Discord community moderation.
14. **Our wedge — channels they lack:** ship **Discord** (guild/bot OAuth, thread-per-conversation, slash-commands for takeover) and **Gmail** (OAuth + Pub/Sub push or IMAP/SMTP, threading, attachments) as first-class channel peers. Their channel model ("page = container with own inbox; business-level catalog/rules") extends cleanly: one `channel` table, per-channel inbox, business-scoped knowledge.
15. **Store sync:** WooCommerce parity (CSV preview-approve sync, edited-in-panel vs source states, soft-delete with restore).

### 16.4 AI features
16. **Agent Desk pattern:** structured instruction blocks (about/delivery/voice/exact-words/custom), char counters, **test-as-customer pane** (text/photo/voice), publish + **undo-last-publish** versioning. Their delivery-block copy guide is worth stealing verbatim in spirit.
17. **Knowledge RAG** with hybrid retrieval ("meaning + words"), retrieval-on-demand only when knowledge exists, test-question box.
18. **Copilot drawer:** summarize / ask-anything / draft-next-reply / make-lead.
19. **Saved replies:** `/` slash-insert in composer, free keyword-triggered auto-answers, AI helpers (suggest-chips above the composer, adapt-with-AI that **never rewrites prices/numbers/links**), archived replies.
20. **Guardrail principles to encode:** AI never invents prices (catalog is truth); unsure → ask customer or hand off; photo match returns top-3 with confirmation instead of a guess.
21. **Feature flags catalog** with descriptions per workspace (§13 table) — do progressive rollout exactly like `/api/features`.

### 16.5 Commerce & growth (phase 2 for us)
22. Orders: 11-stage pipeline incl. separate Store lane; never-delete-only-cancel; **scan-to-batch** invoice QRs; courier handover sheet + COD cash-held tracker; to-chase queue; delivery-problem notice capped 1/20h.
23. Follow-ups: 3h judgment delay; hot(3h+20h, 2 max) vs warm(20h, 1); silence-with-reason; ordered-after metric.
24. Broadcasts: 23h Meta window compliance; audience filters (recency, interest, purchase history, recent-broadcast-skip); 7 message formats; **test-to-own-phone gate before any send**; real coupon honored until expiry.
25. Leads: master switch w/ graceful degradation (numbers still on chat), 6-stage pipeline, auto-lead-on-handoff, comment-phone scraping guard.

### 16.6 Team/RBAC
26. Copy **can-do vs can-see**, most-generous-group-wins, owner-outside-groups, ready-made groups (Manager/Inbox/Orders/Products/Accounts + Sales/Bookings/Marketing/Viewer), per-teammate page scoping, "assigned chats" scope, record-of-changes audit, view-as impersonation.

### 16.7 Billing & trust
27. **Prepaid credit + itemized per-request ledger (CSV)** — if we ever meter AI usage, this transparency pattern is the trust winner. Low-balance warning at configurable threshold; email before stop.
28. For BD market keep bKash/Nagad/manual TrxID as an option, but lead with **cards/Stripe** (they can't) and instant activation (their manual verification is a wait-state).
29. **Privacy posture worth matching:** no trackers, encrypted channel keys never displayed, off-site encrypted backups with split keys, per-request workspace scoping, minimal-context LLM calls, data-deletion endpoint. **But fix their auth weakness:** HttpOnly session cookie (or at least refresh rotation), 2FA, device/session management.

### 16.8 Engineering
30. Their polling (`/pulse` version-string) is fine to start; we should ship **SSE/WebSocket** for inbox realtime — a felt advantage for a "fast replies" product.
31. Blue-green deploy headers + per-page micro-video CDN — operational niceties, not urgent.
32. PWA install + per-device notification prefs — cheap, do it.

## 17. Scorecard & differentiation summary

| Dimension | AiPraktor | Us (target) |
|---|---|---|
| Channels | Messenger, IG DM, FB/IG comments, WhatsApp (unofficial), website chat + voice | Same core + **Discord**, **Gmail**, Telegram/others; **official WhatsApp Cloud API** |
| Commerce | Deep (orders/couriers/COD/scan/Woo) | Phase 2, design for it |
| AI | Strong multimodal agent + handoff choreography | Match the choreography; provider-agnostic |
| RBAC | Groups, can-do/can-see, audit, impersonation | Match + SSO/2FA |
| Realtime | Polling | SSE/WebSocket |
| Payments | Manual bKash/Nagad/TrxID, BDT | Cards + instant activation, multi-currency, keep MFS option |
| Trust | Excellent copy & honest risk disclosure | Match copy quality; stronger session security |
| Locale | Bangladesh-first, bilingual | i18n from day one |

**Their moat:** Meta-channel depth + Bangla voice/photo commerce + local payment/courier stack + superb UX writing. **Our openings:** channels they don't have (Discord, email), official WhatsApp, realtime, instant global payments, and an open API/webhook layer (they have none).

## Appendix A — Evidence index

All snapshots are Playwright accessibility-tree YAML dumps taken Nov 11, 2026 (post-login, English UI). In `docs/aipraktor-evidence/`:

`home.yml` (marketing site incl. pricing/FAQ/security claims) · `faq.yml` (FAQ answers: OAuth, ban risk, chat visibility, costs, data deletion) · `signup.yml`, `login-check.yml` (auth flows) · `setup-channels.yml` (wizard + channel copy) · `pages.yml`, `page-settings.yml` (page/container model + inbox settings) · `website.yml`, `website-setup.yml` (widget config) · `saved-replies.yml` · `comments.yml`, `comments-rules.yml` (moderation rules dialog) · `orders.yml`, `scan.yml`, `handover.yml` (commerce) · `products.yml`, `posts.yml` (catalog & photo recognition) · `followups.yml`, `broadcasts.yml`, `leads.yml` (growth) · `agent-desk.yml`, `knowledge.yml` (AI config/RAG) · `analytics.yml`, `analytics-people.yml` · `notifications.yml`, `device.yml` · `business.yml`, `billing.yml` · `team.yml`, `groups.yml` · `activity.yml`, `help.yml`.

Screenshots in `docs/`: `aipraktor-inbox.png` (Inbox UI), `aipraktor-overview.png` (Overview/dashboard).

## Appendix B — Identified constants (for reference only)

- Workspace `ws_1794374612651_f3d05g` · Page `page_1794374612666_0y3u81` · Org `org_1794374612651_f3d05g`
- Meta app **1219610400365298** · Graph **v26.0** · OAuth callback `/api/connect/facebook/callback`
- WhatsApp provider **WaSender** (linked-device), ৳900/mo · bKash top-up number 01724501119 (Personal), reference code format `AP-XXXXXX`
- Support: `support@aipraktor.com`, wa.me/8801627777482 · Extension: `aipraktor-assistant` v1.0.2
- Widget: `embed.js`, `data-site` = `site_[0-9a-f]{16}`, iframe `/embed/<id>?lang=&test=&r=&b=`, origin-checked postMessage `{aipraktor:1}`
- Defaults: auto-revert 60m · SLA 15m · wait-before-answer 15s (0–15) · review ask 1440m after delivery (off by default) · follow-up judgment 3h · hot 3h+20h · warm 20h · broadcast window 23h · daily widget cap 200/visitor · low-credit warning ৳10 · min top-up ৳1,000 · blocklist 50 words · backup nightly · test media retention 8 days

*Analysis is of publicly observable UI/API behavior and marketing claims; internal implementation is inferred where noted. Claims in §15 marked "claimed" are vendor statements, not independently verified.*
