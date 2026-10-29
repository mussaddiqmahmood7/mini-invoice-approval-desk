"use client";

import { FileCheck2 } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md sticky top-0 z-30 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 shrink-0">
            <FileCheck2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">Mini Invoice Approval Desk</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Review invoices. Record decisions.</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
