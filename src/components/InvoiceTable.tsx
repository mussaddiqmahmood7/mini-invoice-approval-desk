import React from "react";
import type { InvoiceWithRelations } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, DuplicateBadge, FlagBadge } from "./StatusBadge";
import { ChevronRight, FileText, Calendar, Building2, Layers } from "lucide-react";

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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
        <p className="mt-3 text-sm font-mono text-zinc-400">Loading invoice ledger...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">No invoices found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          No records match the current tab or filter parameters. Try clearing your search or switching tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
          <thead className="bg-zinc-950/80 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                Invoice Number
              </th>
              <th scope="col" className="px-3 py-3.5">
                Vendor / Contractor
              </th>
              <th scope="col" className="px-3 py-3.5">
                Issue / Due
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Items
              </th>
              <th scope="col" className="px-3 py-3.5 text-right">
                Total Amount
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Status / Flags
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 bg-zinc-900/30 font-sans">
            {invoices.map((inv) => {
              const isSelected = selectedInvoiceId === inv.id;
              const isDuplicate = !!inv.duplicateOfId || inv.flags?.includes("DUPLICATE_SUSPECTED");

              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className={`group cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-amber-500/10 border-l-2 border-l-amber-500"
                      : "hover:bg-zinc-800/60"
                  }`}
                >
                  {/* Invoice # */}
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                      <span className="font-mono font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{inv.vendorName}</span>
                      </div>
                      {inv.vendorTaxId && (
                        <span className="text-[11px] font-mono text-zinc-500 pl-5">
                          Tax ID: {inv.vendorTaxId}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex flex-col text-xs font-mono text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>Issued: {formatDate(inv.issueDate)}</span>
                      </div>
                      <span className="text-zinc-500 pl-4 text-[11px]">
                        Due: {formatDate(inv.dueDate)}
                      </span>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                      <Layers className="w-3 h-3 text-zinc-500" />
                      {inv.items?.length || 0}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="whitespace-nowrap px-3 py-4 text-right">
                    <span className="font-mono font-bold text-base tabular-nums text-zinc-100 tracking-tight">
                      {formatCurrency(inv.totalAmount)}
                    </span>
                  </td>

                  {/* Status & Badges */}
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <StatusBadge status={inv.status} size="sm" />
                      {isDuplicate && <DuplicateBadge />}
                    </div>
                  </td>

                  {/* Action / Chevron */}
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right">
                    <div className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
                      <span className="hidden sm:inline">Review</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
