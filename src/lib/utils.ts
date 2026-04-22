import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a YYYY-MM-DD date string as local date (not UTC).
 * Prevents the common off-by-one-day bug caused by UTC parsing.
 */
export function parseLocalDate(dateStr: string | null | undefined): Date {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a YYYY-MM-DD string to pt-BR locale string without UTC shift.
 */
export function formatDateBR(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("pt-BR", options);
}
