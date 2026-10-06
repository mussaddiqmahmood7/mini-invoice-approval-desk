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
    size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide uppercase font-mono ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function DuplicateBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md uppercase font-mono bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm ${className}`}
      title="Suspected Duplicate Invoice Detected"
    >
      <Copy className="w-3 h-3 text-amber-400" />
      Duplicate Flagged
    </span>
  );
}

export function FlagBadge({ flag }: { flag: string }) {
  const cleanLabel = flag.replace(/_/g, " ").toLowerCase();
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-500/80" />
      {cleanLabel}
    </span>
  );
}
