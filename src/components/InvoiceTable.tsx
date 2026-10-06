import React from "react";
import type { InvoiceWithRelations } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, DuplicateBadge } from "./StatusBadge";
import { ChevronRight, FileText, Calendar, Building2, Layers } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./ui/table";

interface InvoiceTableProps {
  invoices: InvoiceWithRelations[];
  onSelectInvoice: (invoice: InvoiceWithRelations) => void;
  selectedInvoiceId?: string | null;
  isLoading?: boolean;
}

export function InvoiceTable({
  invoices,
  onSelectInvoice,
  selectedInvoiceId,
  isLoading,
}: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
        <p className="mt-3 text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400">Loading invoice ledger...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white/40 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 sm:p-12 text-center transition-colors">
        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
        <h3 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-300">No invoices found</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-sm mx-auto mt-1">
          No records match the current tab or filter parameters. Try clearing your search or switching tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm transition-colors">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-950/80">
          <TableRow>
            <TableHead className="py-3 pl-4 pr-2 sm:pl-6">Invoice</TableHead>
            <TableHead className="px-3 py-3">Vendor / Contractor</TableHead>
            <TableHead className="hidden md:table-cell px-3 py-3">Issue / Due</TableHead>
            <TableHead className="hidden sm:table-cell px-3 py-3 text-center">Items</TableHead>
            <TableHead className="px-3 py-3 text-right">Total Amount</TableHead>
            <TableHead className="px-3 py-3 text-center">Status</TableHead>
            <TableHead className="py-3 pl-2 pr-4 sm:pr-6 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const isSelected = selectedInvoiceId === inv.id;
            const isDuplicate = !!inv.duplicateOfId || inv.flags?.includes("DUPLICATE_SUSPECTED");

            return (
              <TableRow
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className={`group cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-2 border-l-amber-500"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                {/* Invoice # */}
                <TableCell className="py-3.5 pl-4 pr-2 sm:pl-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0" />
                    <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {inv.invoiceNumber}
                    </span>
                  </div>
                </TableCell>

                {/* Vendor */}
                <TableCell className="px-3 py-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <span className="truncate max-w-[160px] sm:max-w-none">{inv.vendorName}</span>
                    </div>
                    {inv.vendorTaxId && (
                      <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pl-5">
                        Tax ID: {inv.vendorTaxId}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Dates (Hidden on mobile) */}
                <TableCell className="hidden md:table-cell px-3 py-3.5">
                  <div className="flex flex-col text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                      <span>Issued: {formatDate(inv.issueDate)}</span>
                    </div>
                    <span className="text-zinc-400 dark:text-zinc-500 pl-4 text-[11px]">
                      Due: {formatDate(inv.dueDate)}
                    </span>
                  </div>
                </TableCell>

                {/* Items (Hidden on xs mobile) */}
                <TableCell className="hidden sm:table-cell px-3 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
                    <Layers className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                    {inv.items?.length || 0}
                  </span>
                </TableCell>

                {/* Total Amount */}
                <TableCell className="px-3 py-3.5 text-right">
                  <span className="font-mono font-bold text-sm sm:text-base tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {formatCurrency(inv.totalAmount)}
                  </span>
                </TableCell>

                {/* Status & Badges */}
                <TableCell className="px-3 py-3.5">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <StatusBadge status={inv.status} size="sm" />
                    {isDuplicate && <DuplicateBadge />}
                  </div>
                </TableCell>

                {/* Chevron */}
                <TableCell className="py-3.5 pl-2 pr-4 sm:pr-6 text-right">
                  <div className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-amber-500 transition-colors">
                    <span className="hidden sm:inline">Review</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
