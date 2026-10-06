import React from "react";
import type { InvoiceStatus } from "@/db/schema";
import { getStatusConfig } from "@/lib/utils";
import { AlertTriangle, Copy } from "lucide-react";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeClasses =
    size === "sm"
      ? "px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium"
      : "px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-md border tracking-wide uppercase font-mono whitespace-nowrap ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
}

export function DuplicateBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-bold rounded-md uppercase font-mono bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40 shadow-sm whitespace-nowrap ${className}`}
      title="Suspected Duplicate Invoice Detected"
    >
      <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
      <span className="hidden sm:inline">Duplicate Flagged</span>
      <span className="sm:hidden inline">Duplicate</span>
    </span>
  );
}

export function FlagBadge({ flag }: { flag: string }) {
  const cleanLabel = flag.replace(/_/g, " ").toLowerCase();
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 whitespace-nowrap">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-500/80 shrink-0" />
      <span>{cleanLabel}</span>
    </span>
  );
}
