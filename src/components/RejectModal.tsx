"use client";

import React, { useState } from "react";
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
  "Missing signed superintendent field delivery tickets / compaction logs",
  "Unapproved change order line item included without signed CO#",
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-6 text-zinc-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-mono text-zinc-100">
              Reject Invoice {invoiceNumber}
            </h3>
            <p className="text-xs text-zinc-400">
              Contractor: <span className="text-zinc-200 font-medium">{vendorName}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            This rejection will be permanently logged in the audit trail. Please specify the clear contractual or calculation reason.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setNote(preset)}
                  className="text-[11px] font-sans px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-left transition-colors"
                >
                  {preset.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Rejection Note Textarea */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Rejection Reason & Audit Note <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Unit rate on rebar exceeds subcontract master rate card clause 4.2..."
              required
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-sans"
            />
          </div>

          {/* Actor Name */}
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Reviewing Engineer
            </label>
            <input
              type="text"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/30"
            >
              {isSubmitting ? "Logging Rejection..." : "Confirm & Log Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
