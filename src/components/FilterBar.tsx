"use client";

import React from "react";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  vendors: string[];
  totalResults: number;
}

export function FilterBar({
  search,
  onSearchChange,
  selectedVendor,
  onVendorChange,
  vendors,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters = search.length > 0 || (selectedVendor && selectedVendor !== "ALL");

  const clearFilters = () => {
    onSearchChange("");
    onVendorChange("ALL");
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 sm:p-3 transition-colors w-full max-w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search invoice # or vendor..."
          className="block w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-2 sm:pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Shadcn Vendor Select Dropdown */}
      <div className="flex items-center gap-2">
        <div className="flex-1 sm:w-60 min-w-0">
          <Select value={selectedVendor} onValueChange={onVendorChange}>
            <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vendors ({vendors.length})</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-md border border-zinc-300 dark:border-zinc-700 transition-colors whitespace-nowrap"
            title="Reset filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="hidden lg:flex items-center text-xs font-mono text-zinc-500 dark:text-zinc-400 pl-2 shrink-0">
        <span>
          Showing <strong className="text-zinc-900 dark:text-zinc-200 font-bold">{totalResults}</strong> invoices
        </span>
      </div>
    </div>
  );
}
