import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Download rows as a CSV file (client only). Used by module report/export actions. */
export function downloadCsv(
  filename: string,
  rows: Array<Array<string | number>>,
): void {
  if (typeof window === "undefined") return;

  const escape = (cell: string | number) => {
    const text = String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Human-friendly elapsed label for an epoch timestamp. */
export function timeAgo(atMs: number): string {
  const diff = Math.max(0, Date.now() - atMs);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Countdown label in minutes, e.g. "in 42m" / "overdue 3m". */
export function minutesLabel(targetMs: number): string {
  const diff = Math.round((targetMs - Date.now()) / 60_000);
  if (diff >= 0) return `in ${diff}m`;
  return `${Math.abs(diff)}m ago`;
}

/** Minutes elapsed since an epoch timestamp. */
export function minutesSince(atMs: number): number {
  return Math.max(0, Math.round((Date.now() - atMs) / 60_000));
}
