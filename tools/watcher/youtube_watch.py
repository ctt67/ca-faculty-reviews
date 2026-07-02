"""
YouTube buying-conversation watcher for Careviews.

Search-driven (NOT faculty-channel-driven): finds fresh comparison/guidance
videos matching the configured queries, then scans their comments for
buying-intent keywords. Notifies via Telegram bot.

Run once per invocation (schedule with Windows Task Scheduler, e.g. every 2h).
Quota math: ~8 searches x 100 units + ~50 comment fetches x 1 unit
= well under the free 10,000 units/day at 4 runs/day.

Usage:
    python youtube_watch.py            # uses config.json next to this file
"""

import json
import html
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

BASE = Path(__file__).parent
CONFIG_PATH = BASE / "config.json"
STATE_PATH = BASE / "yt_state.json"

API = "https://www.googleapis.com/youtube/v3"


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def save_state(state):
    STATE_PATH.write_text(json.dumps(state, indent=1), encoding="utf-8")


def notify(cfg, text: str):
    token = cfg["notify"]["bot_token"]
    chat_id = cfg["notify"]["chat_id"]
    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
            timeout=15,
        )
    except requests.RequestException as e:
        print(f"[warn] telegram notify failed: {e}")


def yt_get(cfg, endpoint: str, params: dict) -> dict:
    params = {**params, "key": cfg["youtube"]["api_key"]}
    r = requests.get(f"{API}/{endpoint}", params=params, timeout=20)
    if r.status_code == 403:
        # quota exhausted or comments disabled — degrade gracefully
        return {}
    r.raise_for_status()
    return r.json()


def clean(text: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", " ", text)).strip()


def keyword_hit(text: str, keywords) -> bool:
    low = text.lower()
    return any(k.lower() in low for k in keywords)


def main():
    cfg = load_json(CONFIG_PATH, None)
    if not cfg:
        sys.exit("config.json not found — copy config.example.json and fill it in.")

    yt = cfg["youtube"]
    keywords = cfg["keywords"]
    exclude = set(yt.get("exclude_channel_ids", []))
    state = load_json(STATE_PATH, {"seen_videos": [], "seen_comments": []})
    seen_videos = set(state["seen_videos"])
    seen_comments = set(state["seen_comments"])

    cutoff = (
        datetime.now(timezone.utc) - timedelta(days=yt.get("max_video_age_days", 14))
    ).strftime("%Y-%m-%dT%H:%M:%SZ")

    new_videos = []       # (video_id, title, channel)
    hits = []             # notification lines

    # 1. Fresh videos matching the buying-decision queries
    for q in yt["search_queries"]:
        data = yt_get(cfg, "search", {
            "part": "snippet",
            "q": q,
            "type": "video",
            "order": "date",
            "publishedAfter": cutoff,
            "maxResults": yt.get("max_videos_per_query", 10),
            "relevanceLanguage": "en",
            "regionCode": "IN",
        })
        for item in data.get("items", []):
            vid = item["id"]["videoId"]
            sn = item["snippet"]
            if sn["channelId"] in exclude:
                continue
            if vid not in seen_videos:
                seen_videos.add(vid)
                new_videos.append((vid, clean(sn["title"]), clean(sn["channelTitle"])))

    for vid, title, channel in new_videos:
        hits.append(
            f"🎬 NEW VIDEO ({channel}):\n{title}\nhttps://youtu.be/{vid}\n"
            f"→ fresh comparison video: early helpful comment gets top placement"
        )

    # 2. Buying-intent comments on recently seen videos (new + previously found)
    recent_video_ids = [v for v in state["seen_videos"]][-80:] + [v[0] for v in new_videos]
    for vid in dict.fromkeys(recent_video_ids):  # dedupe, keep order
        data = yt_get(cfg, "commentThreads", {
            "part": "snippet",
            "videoId": vid,
            "order": "time",
            "maxResults": yt.get("comments_per_video", 50),
            "textFormat": "plainText",
        })
        for item in data.get("items", []):
            cid = item["id"]
            if cid in seen_comments:
                continue
            seen_comments.add(cid)
            top = item["snippet"]["topLevelComment"]["snippet"]
            text = clean(top.get("textDisplay", ""))
            if keyword_hit(text, keywords):
                author = top.get("authorDisplayName", "someone")
                snippet = text[:220] + ("…" if len(text) > 220 else "")
                hits.append(
                    f"💬 COMMENT by {author}:\n\"{snippet}\"\n"
                    f"https://www.youtube.com/watch?v={vid}&lc={cid}"
                )

    # 3. Notify + persist
    if hits:
        # batch into messages under Telegram's 4096-char limit
        buf = ""
        for h in hits:
            if len(buf) + len(h) > 3800:
                notify(cfg, buf)
                buf = ""
            buf += h + "\n\n"
        if buf:
            notify(cfg, buf)
        print(f"[ok] {len(hits)} hits sent")
    else:
        print("[ok] no new hits")

    state["seen_videos"] = list(seen_videos)[-500:]
    state["seen_comments"] = list(seen_comments)[-5000:]
    save_state(state)


if __name__ == "__main__":
    main()
