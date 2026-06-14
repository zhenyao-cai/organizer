import { NEED_TO_FIX_TAG } from "@/lib/tags";

/** End of the selected month (UTC). Input: "YYYY-MM". */
export function parseMonthInput(value: string): Date | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

export function formatMonthInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isExpired(
  expiresAt: Date | string | null | undefined
): boolean {
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  if (isNaN(exp.getTime())) return false;
  return Date.now() > exp.getTime();
}

export function formatExpiryLabel(expiresAt: Date | string): string {
  const d = new Date(expiresAt);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function applyExpirationTag(
  tags: string[],
  expiresAt: Date | string | null | undefined
): string[] {
  if (!isExpired(expiresAt)) return tags;
  if (tags.includes(NEED_TO_FIX_TAG)) return tags;
  return [...tags, NEED_TO_FIX_TAG];
}

export function parseExpiresAtInput(
  value: string | null | undefined
): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (/^\d{4}-\d{2}$/.test(value)) {
    return parseMonthInput(value);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}
