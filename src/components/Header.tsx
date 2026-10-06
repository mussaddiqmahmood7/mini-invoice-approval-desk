"use client";

import React, { useState } from "react";
import { Hammer, RefreshCw, HardHat, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

interface HeaderProps {
  onSeed: () => Promise<void>;
  isSeeding: boolean;
  totalInvoices: number;
}

export function Header({ onSeed, isSeeding, totalInvoices }: HeaderProps) {
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const handleSeedClick = async () => {
    try {
      setSeedSuccess(null);
      await onSeed();
      setSeedSuccess("Database reset with 6 sample invoices!");
      setTimeout(() => setSeedSuccess(null), 4000);
    } catch (err) {
      alert("Error seeding database: " + String(err));
    }
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md sticky top-0 z-30 transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Left (min-w-0 to allow proper flex shrinking without overflow) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-zinc-950 font-black shrink-0">
              <Hammer className="w-4 h-4 sm:w-5 sm:h-5 fill-zinc-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-extrabold tracking-tight text-zinc-900 dark:text-white text-xs sm:text-base whitespace-nowrap">
                  SLEDGE
                </span>
                <span className="text-zinc-400 dark:text-zinc-600 text-[10px] sm:text-xs font-mono">|</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 font-mono truncate">
                  <span className="hidden sm:inline">The Builders AI Office</span>
                  <span className="sm:hidden inline">AI Office</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Invoice Approval Desk
              </p>
            </div>
          </div>

          {/* Center Info / Toast */}
          {seedSuccess && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{seedSuccess}</span>
            </div>
          )}

          {/* User & Actions Right */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Engineer Identity (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Mussaddiq Mahmood</span>
              <span className="text-zinc-500 text-[11px] font-mono">(Engineer)</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Re-seed Button */}
            <button
              onClick={handleSeedClick}
              disabled={isSeeding}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Reset and seed sample construction invoices"
            >
              <RefreshCw
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 ${isSeeding ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">{isSeeding ? "Seeding..." : "Reset / Seed"}</span>
              <span className="sm:hidden inline">{isSeeding ? "..." : "Seed"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
