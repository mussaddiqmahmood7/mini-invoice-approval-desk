import React from "react";
import type { KPIStats } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface KPIBarProps {
  stats: KPIStats;
}

export function KPIBar({ stats }: KPIBarProps) {
  const cards = [
    {
      title: "Processing",
      count: stats.processingCount,
      amount: stats.processingAmount,
      icon: Clock,
      borderColor: "border-sky-500/20",
      accentBg: "bg-sky-500/10",
      textColor: "text-sky-400",
      subtext: "OCR intake & PO verification",
    },
    {
      title: "Needs Review",
      count: stats.needsReviewCount,
      amount: stats.needsReviewAmount,
      icon: AlertTriangle,
      borderColor: "border-amber-500/30",
      accentBg: "bg-amber-500/10",
      textColor: "text-amber-400",
      subtext: "Includes flagged duplicates & anomalies",
      pulse: stats.needsReviewCount > 0,
    },
    {
      title: "Approved",
      count: stats.approvedCount,
      amount: stats.approvedAmount,
      icon: CheckCircle,
      borderColor: "border-emerald-500/20",
      accentBg: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      subtext: "Cleared for contractor payment",
    },
    {
      title: "Rejected",
      count: stats.rejectedCount,
      amount: stats.rejectedAmount,
      icon: XCircle,
      borderColor: "border-rose-500/20",
      accentBg: "bg-rose-500/10",
      textColor: "text-rose-400",
      subtext: "Declined with audit reasoning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-xl bg-zinc-900/80 border ${card.borderColor} p-4 transition-all duration-200 hover:border-zinc-700 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.accentBg} ${card.textColor}`}>
                <Icon className={`w-4 h-4 ${card.pulse ? "animate-pulse" : ""}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono tabular-nums text-zinc-100 tracking-tight">
                {formatCurrency(card.amount)}
              </div>
              <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {card.count} {card.count === 1 ? "inv" : "invs"}
              </div>
            </div>

            <p className="mt-2 text-[11px] text-zinc-500 font-sans truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
