import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { InvoiceStatus } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function getStatusConfig(status: InvoiceStatus) {
  switch (status) {
    case "PROCESSING":
      return {
        label: "Processing",
        bg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        dot: "bg-sky-400",
        badgeBg: "bg-sky-500/15",
      };
    case "NEEDS_REVIEW":
      return {
        label: "Needs Review",
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400 animate-pulse",
        badgeBg: "bg-amber-500/15",
      };
    case "APPROVED":
      return {
        label: "Approved",
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-400",
        badgeBg: "bg-emerald-500/15",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        dot: "bg-rose-400",
        badgeBg: "bg-rose-500/15",
      };
    default:
      return {
        label: status,
        bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
        dot: "bg-zinc-400",
        badgeBg: "bg-zinc-800",
      };
  }
}
