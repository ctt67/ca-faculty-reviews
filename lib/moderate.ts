// Conservative list — catches clear abuse, not student frustration.
// Deliberately short to avoid over-moderation.
const BLOCKED_WORDS = [
  "fuck", "fucker", "fucking", "motherfucker",
  "shit", "bullshit",
  "bitch", "bitches",
  "asshole", "bastard",
  "cunt", "whore", "slut",
  "faggot", "nigger", "nigga",
  "chutiya", "madarchod", "bhenchod", "randi", "harami", "gaandu", "bhosdike",
];

const PATTERN = new RegExp(
  `(^|[^a-z])(${BLOCKED_WORDS.join("|")})([^a-z]|$)`,
  "i",
);

export function containsProfanity(text: string): boolean {
  return PATTERN.test(text);
}

export function moderateReviewText(
  pros: string,
  cons: string,
  reviewText?: string | null,
): { ok: boolean } {
  const combined = [pros, cons, reviewText].filter(Boolean).join(" ");
  return { ok: !containsProfanity(combined) };
}
