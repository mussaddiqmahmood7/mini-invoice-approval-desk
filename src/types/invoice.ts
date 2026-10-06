import { z } from "zod";
import type { Invoice, InvoiceItem, InvoiceStatusHistory, InvoiceStatus } from "@/db/schema";

export type { Invoice, InvoiceItem, InvoiceStatusHistory, InvoiceStatus };

export interface InvoiceWithRelations extends Invoice {
  items: InvoiceItem[];
  statusHistory: InvoiceStatusHistory[];
  duplicateOf?: (Invoice & { items?: InvoiceItem[] }) | null;
}

export interface KPIStats {
  processingCount: number;
  processingAmount: number;
  needsReviewCount: number;
  needsReviewAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  totalCount: number;
  totalAmount: number;
}

export type TabType = "processing" | "needs_review" | "approved_rejected" | "all";

export const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
  actor: z.string().default("Mussaddiq Mahmood (Project Engineer)"),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
