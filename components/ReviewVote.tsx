"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { hashUserAgent } from "@/lib/client-meta";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function getSessionToken(): string {
  let token = localStorage.getItem("cv_session_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("cv_session_token", token);
  }
  return token;
}

async function sendVote(review_id: string | number, session_token: string, vote_type: "up" | "down" | null) {
  const uaHash = await hashUserAgent(navigator.userAgent);
  await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review_id, session_token, vote_type, user_agent_hash: uaHash }),
  });
}

export default function ReviewVote({
  reviewId,
  initialUpvotes = 0,
  initialDownvotes = 0,
}: {
  reviewId: string | number;
  initialUpvotes?: number;
  initialDownvotes?: number;
}) {
  const [upvotes, setUpvotes]     = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [myVote, setMyVote]       = useState<"up" | "down" | null>(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    supabase
      .from("review_votes")
      .select("vote_type")
      .eq("review_id", reviewId)
      .eq("session_token", token)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyVote(data.vote_type as "up" | "down");
      });
  }, [reviewId]);

  const vote = async (type: "up" | "down") => {
    if (loading) return;
    setLoading(true);
    const token = getSessionToken();

    if (myVote === type) {
      // Toggle off
      await sendVote(reviewId, token, null);
      if (type === "up") setUpvotes((v) => Math.max(0, v - 1));
      else setDownvotes((v) => Math.max(0, v - 1));
      setMyVote(null);
    } else {
      await sendVote(reviewId, token, type);
      if (type === "up") {
        setUpvotes((v) => v + 1);
        if (myVote === "down") setDownvotes((v) => Math.max(0, v - 1));
      } else {
        setDownvotes((v) => v + 1);
        if (myVote === "up") setUpvotes((v) => Math.max(0, v - 1));
      }
      setMyVote(type);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-ink/35 mr-0.5">Helpful?</span>
      <button
        onClick={() => vote("up")}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
          myVote === "up"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-slate-50 text-ink/45 border-slate-200 hover:bg-slate-100"
        } disabled:opacity-50`}
      >
        <ThumbsUp size={12} />
        {upvotes > 0 && <span>{upvotes}</span>}
      </button>
      <button
        onClick={() => vote("down")}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
          myVote === "down"
            ? "bg-red-50 text-red-600 border-red-200"
            : "bg-slate-50 text-ink/45 border-slate-200 hover:bg-slate-100"
        } disabled:opacity-50`}
      >
        <ThumbsDown size={12} />
        {downvotes > 0 && <span>{downvotes}</span>}
      </button>
    </div>
  );
}
