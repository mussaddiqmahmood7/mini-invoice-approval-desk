import React from "react";
import type { TabType, KPIStats } from "@/types/invoice";
import { Clock, AlertTriangle, CheckSquare } from "lucide-react";

interface TabsNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats: KPIStats;
}

export function TabsNav({ currentTab, onTabChange, stats }: TabsNavProps) {
  const tabs = [
    {
      id: "processing" as TabType,
      label: "Processing",
      count: stats.processingCount,
      icon: Clock,
      hasAlert: false,
    },
    {
      id: "needs_review" as TabType,
      label: "Needs Review",
      count: stats.needsReviewCount,
      icon: AlertTriangle,
      hasAlert: stats.needsReviewCount > 0,
    },
    {
      id: "approved_rejected" as TabType,
      label: "Approved & Rejected",
      count: stats.approvedCount + stats.rejectedCount,
      icon: CheckSquare,
      hasAlert: false,
    },
  ];

  return (
    <div className="border-b border-zinc-800">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center gap-2.5 py-3.5 px-3 border-b-2 font-mono text-sm tracking-wide font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-amber-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-semibold transition-colors ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : tab.hasAlert
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
