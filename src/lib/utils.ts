import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Locale-safe number formatter.
 * Uses regex instead of toLocaleString() to avoid ICU data
 * differences between Node.js (server) and the browser (client),
 * which cause React hydration mismatches.
 */
export function fmtAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Locale-safe date formatter pinned to en-GB so server and client
 * always produce the same string (e.g. "29 Mar 2026").
 */
export function fmtDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Locale-safe datetime formatter pinned to en-GB
 * (e.g. "29 Mar, 14:35").
 */
export function fmtDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}
