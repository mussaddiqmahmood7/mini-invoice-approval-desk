"use client";

import React, { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XCircle, AlertTriangle, X } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, actor: string) => Promise<void>;
  invoiceNumber: string;
  vendorName: string;
}

const PRESET_REASONS = [
  "Duplicate invoice submission already recorded in billing cycle",
  "Billing unit rates exceed master subcontractor agreement",
  "Missing signed superintendent field delivery tickets / logs",
  "Unapproved change order line item without signed CO#",
  "Math mismatch on line item quantity and subtotal extensions",
];

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  invoiceNumber,
  vendorName,
}: RejectModalProps) {
  const [note, setNote] = useState("");
  const [actor, setActor] = useState("Mussaddiq Mahmood (Project Engineer)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      alert("Please provide a rejection reason for the audit trail.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(note.trim(), actor.trim());
      onClose();
    } catch (err) {
      alert("Failed to reject invoice: " + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Higher z-index (z-[70]) backdrop over the slide-over Sheet (z-50) */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal Dialog Content (z-[71]) */}
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-2xl p-4 sm:p-6 text-zinc-900 dark:text-zinc-100 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none max-h-[92dvh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close rejection dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 pr-6">
              <DialogPrimitive.Title className="text-sm sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">
                Reject Invoice {invoiceNumber}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Contractor: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{vendorName}</span>
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="mb-3.5 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              This rejection will be permanently logged in the audit trail. Please specify the clear contractual or calculation reason.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-[10px] sm:text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_REASONS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setNote(preset)}
                    className="text-[10px] sm:text-[11px] font-sans px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-left transition-colors leading-tight"
                  >
                    {preset.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Note Textarea */}
            <div>
              <label className="block text-[10px] sm:text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Rejection Reason & Audit Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Unit rate on rebar exceeds subcontract master rate card clause 4.2..."
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-sans transition-colors"
              />
            </div>

            {/* Reviewing Engineer */}
            <div>
              <label className="block text-[10px] sm:text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Reviewing Engineer
              </label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-mono font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !note.trim()}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-mono font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30"
              >
                {isSubmitting ? "Logging..." : "Confirm & Reject"}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
