import React from "react";
import { Search, Filter, X } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-500" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by invoice number or vendor name..."
          className="block w-full pl-9 pr-8 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Vendor Filter Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <select
            value={selectedVendor}
            onChange={(e) => onVendorChange(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono truncate"
          >
            <option value="ALL">All Vendors ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-2.5 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-md border border-zinc-700 transition-colors whitespace-nowrap"
            title="Reset filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="hidden lg:flex items-center text-xs font-mono text-zinc-400 pl-2">
        <span>Showing <strong className="text-zinc-200 font-bold">{totalResults}</strong> invoices</span>
      </div>
    </div>
  );
}
