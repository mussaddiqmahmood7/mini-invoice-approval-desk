import { z } from "zod";
import type { Invoice, InvoiceItem, InvoiceStatusHistory, InvoiceStatus } from "@/db/schema";

export type { Invoice, InvoiceItem, InvoiceStatusHistory, InvoiceStatus };

export interface InvoiceWithRelations extends Invoice {
  items: InvoiceItem[];
  statusHistory: InvoiceStatusHistory[];
  duplicateOf?: (Invoice & { items?: InvoiceItem[] }) | null;
}

export interface KPIStats {
  currency?: string | null;
  processingCount: number;
  processingAmount: number | null;
  needsReviewCount: number;
  needsReviewAmount: number | null;
  approvedCount: number;
  approvedAmount: number | null;
  rejectedCount: number;
  rejectedAmount: number | null;
  totalCount: number;
  totalAmount: number | null;
}

export type TabType = "processing" | "needs_review" | "approved_rejected" | "all";

export const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(2000).optional(),
  actor: z.string().trim().min(1).max(100).default("Reviewer"),
}).superRefine((value, context) => {
  if (value.status === "REJECTED" && !value.note) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["note"], message: "A rejection reason is required" });
  }
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
