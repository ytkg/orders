import type { Visitor } from "../model/types";

export const VISITORS_COOKIE_KEY = "bar_visitors";
const ONE_YEAR_SECONDS = 31536000;

type VisitorCookieV1 = {
  version: 1;
  visitors: Visitor[];
};

function resolveDocument(doc?: Document): Document | null {
  if (doc) {
    return doc;
  }
  if (typeof document === "undefined") {
    return null;
  }
  return document;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeVisitors(value: unknown): Visitor[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: Visitor[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const id = typeof item.id === "string" ? item.id.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";

    if (!id || !name || seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);
    normalized.push({ id, name });
  }

  return normalized;
}

function parseStoredVisitors(parsed: unknown): Visitor[] {
  if (Array.isArray(parsed)) {
    // Legacy format: direct Visitor[] array.
    return normalizeVisitors(parsed);
  }

  if (!isRecord(parsed)) {
    return [];
  }

  if (parsed.version !== 1) {
    return [];
  }

  return normalizeVisitors(parsed.visitors);
}

export function readVisitorsFromCookie(doc?: Document): Visitor[] {
  const resolvedDoc = resolveDocument(doc);
  if (!resolvedDoc) {
    return [];
  }

  const cookiePart = resolvedDoc.cookie
    .split("; ")
    .find((part) => part.startsWith(`${VISITORS_COOKIE_KEY}=`));

  if (!cookiePart) {
    return [];
  }

  const encoded = cookiePart.slice(VISITORS_COOKIE_KEY.length + 1);
  if (!encoded) {
    return [];
  }

  try {
    const decoded = decodeURIComponent(encoded);
    const parsed = JSON.parse(decoded) as unknown;
    return parseStoredVisitors(parsed);
  } catch {
    return [];
  }
}

export function writeVisitorsToCookie(visitors: Visitor[], doc?: Document) {
  const resolvedDoc = resolveDocument(doc);
  if (!resolvedDoc) {
    return;
  }

  const payload: VisitorCookieV1 = {
    version: 1,
    visitors
  };

  const encoded = encodeURIComponent(JSON.stringify(payload));
  resolvedDoc.cookie = `${VISITORS_COOKIE_KEY}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
