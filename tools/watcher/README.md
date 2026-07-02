# Careviews Conversation Watcher

Finds fresh YouTube videos where CA students are making faculty buying decisions
("best FR faculty 2027", "which classes for CA inter"...) and flags buying-intent
comments under them — so you can be an early, helpful commenter instead of
scrolling all day.

Deliberately does NOT target faculty-owned channels (excludable via config) and
does NOT post anything automatically. It only watches and notifies.

## One-time setup (~15 min)

### 1. YouTube API key (free)
1. Go to https://console.cloud.google.com → create project ("careviews-watcher")
2. APIs & Services → Library → enable **YouTube Data API v3**
3. APIs & Services → Credentials → Create credentials → **API key** → copy it

### 2. Notification bot (this is your own private bot pinging you — nothing runs on your account)
1. In Telegram, message **@BotFather** → `/newbot` → name it anything → copy the **bot token**
2. Message **@userinfobot** → it replies with your **chat id**
3. Open a chat with your new bot and press Start (required before it can message you)

### 3. Config
```
cd tools/watcher
copy config.example.json config.json
```
Fill in `youtube.api_key`, `notify.bot_token`, `notify.chat_id`.
Tune `search_queries` (add subject-specific ones each season) and add any
faculty-owned channel IDs you want skipped to `exclude_channel_ids`.

### 4. Install + test run
```
pip install requests
python youtube_watch.py
```
First run seeds state (may send a burst of existing videos); later runs only
send new stuff.

### 5. Schedule it (Windows Task Scheduler)
- Task Scheduler → Create Basic Task → "careviews watcher"
- Trigger: Daily, repeat every 2 hours (in the task's advanced properties)
- Action: Start a program → Program: `python` →
  Arguments: `youtube_watch.py` → Start in: full path to `tools\watcher`

Quota: ~8 searches × 100 units + comment fetches ≈ 900 units/run.
At 6 runs/day ≈ 5,400 of the free 10,000 daily units. Add queries freely,
but if you double the query list, drop to 4 runs/day.

## The rest of the monitoring stack (no code needed)

- **Reddit** → https://f5bot.com (free): add keywords like `CA final faculty`,
  `careviews`, faculty names. Emails you within minutes of any Reddit mention.
- **X** → bookmark saved searches, check twice daily:
  `"which faculty" CA (final OR inter)` and `CA classes (confused OR recommend)`
  sorted by Latest. (API automation costs $100/mo — not worth it yet.)
- **Instagram / Discord** → not monitorable within platform rules. Follow the
  big CA meme pages with notifications on; that's the honest ceiling.

## Ground rules when responding to a hit
- Be helpful first; the link is optional, not the point
- Never respond to hits under faculty-owned videos
- Vary your wording; identical paste-replies get flagged as spam
- If the comment is a rant/rave about a specific faculty → that's a
  rant-to-review DM opportunity, not a public reply
