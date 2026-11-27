import type { ReferenceDataset } from "@meno/api-client";
import type { Tint } from "@meno/ui";

export type DatasetStatus = NonNullable<ReferenceDataset["status"]>;

/** Status is always written out, never colour alone (DESIGN_LANGUAGE §4). */
export const STATUS: Record<string, { label: string; tint: Tint }> = {
  NOT_LOADED: { label: "Not loaded", tint: "amber" },
  CURRENT: { label: "Up to date", tint: "green" },
  DUE: { label: "Refresh due", tint: "amber" },
  LATER: { label: "Later", tint: "slate" },
};

export const statusOf = (status: string | undefined) => STATUS[status ?? "NOT_LOADED"] ?? STATUS.NOT_LOADED!;

/** "Every month", "Every 3 months", "Every year". */
export function cadence(months: number | undefined): string {
  if (!months || months <= 1) return "Every month";
  if (months % 12 === 0) return months === 12 ? "Every year" : `Every ${months / 12} years`;
  return `Every ${months} months`;
}

/** 12_400_000 → "11.8 MB". Display only. */
export function fileSize(bytes: number | undefined): string {
  const b = bytes ?? 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

/** Row counts with Indian digit grouping (1,54,823), the way staff read them. */
export const count = (n: number | undefined) => (n ?? 0).toLocaleString("en-IN");

/** Today in India as yyyy-MM-dd: a file's publication date can't be later than this. */
export function indiaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Load lists show the status as words: why a file was refused, from its reason code. */
export const REASONS: Record<string, string> = {
  REFERENCE_FILE_COLUMNS_MISSING: "Columns missing",
  REFERENCE_FILE_NO_ROWS: "No usable rows",
  REFERENCE_LOAD_SHRINKS: "Much smaller than today's list",
};
