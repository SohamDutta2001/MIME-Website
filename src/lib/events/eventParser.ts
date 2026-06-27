import { EventSchema, type Event } from "../../types/event";

const REQUIRED_COLUMNS = [
  "active", "category", "title", "date", "time", "venue",
  "banner url", "description", "additional info", "gallery urls", "registration url",
] as const;

export function validateHeaders(header: string[]): { ok: true } | { ok: false; missing: string[] } {
  const missing = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}

// Normalises date strings from Google Sheets into YYYY-MM-DD.
// Sheets exports dates as M/D/YYYY (e.g. "1/1/2026") regardless of locale.
function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, m, d, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return raw;
}

export function parseEventRow(
  row: string[],
  headerIndex: Record<string, number>
): Event | null {
  const get = (col: string) => row[headerIndex[col]]?.trim() ?? "";

  const galleryUrls = get("gallery urls")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const raw = {
    active: get("active").toLowerCase() === "true",
    category: get("category"),
    title: get("title"),
    date: normalizeDate(get("date")),
    time: get("time"),
    venue: get("venue"),
    bannerUrl: get("banner url"),
    description: get("description"),
    additionalInfo: get("additional info"),
    galleryUrls,
    registrationUrl: get("registration url"),
  };

  const result = EventSchema.safeParse(raw);
  if (!result.success) {
    console.warn(`[events] Skipping row "${raw.title}":`, result.error.issues.map((i) => i.message).join(", "));
    return null;
  }
  return result.data;
}
