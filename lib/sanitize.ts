const HTML_TAG    = /<[^>]*>/g;
const HTML_ENTITY = /&[a-z#0-9]+;/gi;
const CTRL_CHARS  = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeText(raw: string): string {
  return raw
    .replace(HTML_TAG, "")
    .replace(HTML_ENTITY, " ")
    .replace(CTRL_CHARS, "")
    .trim();
}

export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const out = { ...obj };
  for (const field of fields) {
    if (typeof out[field] === "string") {
      (out as Record<string, unknown>)[field as string] = sanitizeText(out[field] as string);
    }
  }
  return out;
}
