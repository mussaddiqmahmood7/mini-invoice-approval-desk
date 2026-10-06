"use client";

import React, { useState } from "react";
import type { InvoiceWithRelations } from "@/types/invoice";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge, DuplicateBadge } from "./StatusBadge";
import { RejectModal } from "./RejectModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  X,
  Check,
  XCircle,
  FileText,
  History,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface InvoiceDetailDrawerProps {
  invoice: InvoiceWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: "APPROVED" | "REJECTED", note?: string, actor?: string) => Promise<void>;
}

export function InvoiceDetailDrawer({
  invoice,
  isOpen,
  onClose,
  onStatusUpdate,
}: InvoiceDetailDrawerProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (!invoice) return null;

  const isDuplicate = !!invoice.duplicateOfId || invoice.flags?.includes("DUPLICATE_SUSPECTED");
  const originalInvoice = invoice.duplicateOf;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await onStatusUpdate(
        invoice.id,
        "APPROVED",
        "Approved for payment draw by Project Engineer",
        "Mussaddiq Mahmood (Project Engineer)"
      );
    } catch (err) {
      alert("Failed to approve invoice: " + String(err));
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReject = async (reason: string, actor: string) => {
    await onStatusUpdate(invoice.id, "REJECTED", reason, actor);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col p-0">
          {/* Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3.5 sm:py-4 bg-zinc-50 dark:bg-zinc-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-amber-500 border border-zinc-300 dark:border-zinc-700">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-900 dark:text-white">
                    {invoice.invoiceNumber}
                  </SheetTitle>
                  <StatusBadge status={invoice.status} size="sm" />
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[220px] sm:max-w-sm">
                  {invoice.vendorName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Bar */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-100/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Status:
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {invoice.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Reject Button */}
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={invoice.status === "REJECTED" || isApproving}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              {/* Approve Button */}
              <button
                onClick={handleApprove}
                disabled={invoice.status === "APPROVED" || isApproving}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-950/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApproving ? "Approving..." : "Approve"}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
            {/* DUPLICATE COMPARISON DIFF (If Duplicate) */}
            {isDuplicate && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Duplicate Conflict Detected
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                    Confidence: 100%
                  </span>
                </div>

                <p className="text-xs text-amber-900/80 dark:text-amber-200/90 leading-relaxed font-sans">
                  {invoice.notes ||
                    "This invoice matches existing ledger records for the same contractor, amount, and itemization."}
                </p>

                {/* Side-by-side Diff Table */}
                <div className="overflow-hidden rounded-lg border border-amber-500/30 bg-white dark:bg-zinc-950/80">
                  <div className="grid grid-cols-3 text-[10px] sm:text-[11px] font-mono border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-zinc-500 dark:text-zinc-400">
                    <span>Field</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold truncate">This Invoice</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold truncate">
                      {originalInvoice ? "Original" : "Ref ID"}
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px] sm:text-xs font-mono">
                    <div className="grid grid-cols-3 px-2.5 sm:px-3 py-1.5 sm:py-2 items-center">
                      <span className="text-zinc-500">Invoice #</span>
                      <span className="text-amber-600 dark:text-amber-300 font-bold truncate">{invoice.invoiceNumber}</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">
                        {originalInvoice?.invoiceNumber || invoice.duplicateOfId?.slice(0, 8) || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 px-2.5 sm:px-3 py-1.5 sm:py-2 items-center">
                      <span className="text-zinc-500">Amount</span>
                      <span className="text-amber-600 dark:text-amber-300 font-bold tabular-nums">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {originalInvoice ? formatCurrency(originalInvoice.totalAmount) : formatCurrency(invoice.totalAmount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 px-2.5 sm:px-3 py-1.5 sm:py-2 items-center">
                      <span className="text-zinc-500">Vendor</span>
                      <span className="text-zinc-800 dark:text-zinc-200 truncate">{invoice.vendorName}</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">
                        {originalInvoice?.vendorName || invoice.vendorName}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 px-2.5 sm:px-3 py-1.5 sm:py-2 items-center">
                      <span className="text-zinc-500">Issue Date</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{formatDate(invoice.issueDate)}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {originalInvoice ? formatDate(originalInvoice.issueDate) : "Prior"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor & General Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500">Vendor Name</span>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-200 mt-0.5">{invoice.vendorName}</p>
                {invoice.vendorAddress && (
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{invoice.vendorAddress}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500">Tax Registration</span>
                <p className="text-xs font-mono text-zinc-800 dark:text-zinc-300 mt-0.5">
                  {invoice.vendorTaxId || "Not Registered"}
                </p>
                <div className="mt-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span>Currency: </span>
                  <span className="text-zinc-900 dark:text-zinc-200 font-bold">{invoice.currency}</span>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2.5 sm:pt-3">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500">Issue Date</span>
                <p className="text-xs font-mono text-zinc-800 dark:text-zinc-300 mt-0.5">{formatDate(invoice.issueDate)}</p>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2.5 sm:pt-3">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500">Due Date</span>
                <p className="text-xs font-mono text-zinc-800 dark:text-zinc-300 mt-0.5">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                Itemized Line Items ({invoice.items?.length || 0})
              </h3>

              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 pl-3 sm:pl-4 pr-2 text-left">Description</th>
                        <th className="px-2 py-2.5 text-right">Qty</th>
                        <th className="px-2 py-2.5 text-right">Unit Price</th>
                        <th className="py-2.5 pl-2 pr-3 sm:pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="py-2.5 pl-3 sm:pl-4 pr-2 text-zinc-800 dark:text-zinc-200 font-sans text-xs">
                              {item.description}
                            </td>
                            <td className="px-2 py-2.5 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                              {parseFloat(item.quantity).toFixed(2)}
                            </td>
                            <td className="px-2 py-2.5 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-2.5 pl-2 pr-3 sm:pr-4 text-right text-zinc-900 dark:text-zinc-100 font-bold tabular-nums">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-zinc-500">
                            No itemized lines recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total Footer */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 p-3.5 sm:p-4 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="tabular-nums text-zinc-800 dark:text-zinc-300">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Tax:</span>
                    <span className="tabular-nums text-zinc-800 dark:text-zinc-300">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    <span className="text-amber-600 dark:text-amber-400">Total Amount:</span>
                    <span className="text-amber-600 dark:text-amber-400 tabular-nums">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2.5 sm:space-y-3 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                  Audit History Timeline
                </h3>
              </div>

              <div className="relative pl-6 space-y-3 sm:space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                {invoice.statusHistory && invoice.statusHistory.length > 0 ? (
                  invoice.statusHistory.map((item, index) => (
                    <div key={item.id || index} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-zinc-950" />

                      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            {item.fromStatus ? (
                              <>
                                <span className="text-zinc-500 dark:text-zinc-400">{item.fromStatus}</span>
                                <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                              </>
                            ) : null}
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.toStatus}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="font-mono">Actor: </span>
                          <span className="text-zinc-800 dark:text-zinc-300 font-medium">{item.actor}</span>
                        </div>

                        {item.note && (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans italic pt-1 border-t border-zinc-200 dark:border-zinc-800/60 mt-1">
                            &ldquo;{item.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">No previous audit records.</p>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rejection Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        invoiceNumber={invoice.invoiceNumber}
        vendorName={invoice.vendorName}
      />
    </>
  );
}
