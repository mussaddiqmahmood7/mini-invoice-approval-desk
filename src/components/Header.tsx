"use client";

import React, { useState } from "react";
import { Hammer, RefreshCw, HardHat, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  onDataRefresh: () => Promise<void>;
  isRefreshing: boolean;
  totalInvoices: number;
}

export function Header({ onDataRefresh, isRefreshing, totalInvoices }: HeaderProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedSuccess(null);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedSuccess("Database reset with 6 sample invoices!");
        await onDataRefresh();
        setTimeout(() => setSeedSuccess(null), 4000);
      } else {
        alert("Failed to seed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error seeding database: " + String(err));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black">
              <Hammer className="w-5 h-5 fill-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-base">
                  SLEDGE
                </span>
                <span className="text-zinc-500 text-xs font-mono">|</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-mono">
                  The Builders AI Office
                </span>
              </div>
              <p className="text-xs text-zinc-400">Mini Invoice Approval Desk</p>
            </div>
          </div>

          {/* Center Info / Toast */}
          {seedSuccess && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{seedSuccess}</span>
            </div>
          )}

          {/* User & Actions Right */}
          <div className="flex items-center gap-3">
            {/* Engineer Identity */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs">
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-300 font-medium">Mussaddiq Mahmood</span>
              <span className="text-zinc-500 text-[11px] font-mono">(Engineer)</span>
            </div>

            {/* Re-seed Button */}
            <button
              onClick={handleSeed}
              disabled={seeding || isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Reset and seed sample construction invoices"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-400 ${seeding || isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{seeding ? "Seeding..." : "Reset / Seed Invoices"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
