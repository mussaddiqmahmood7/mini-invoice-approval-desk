import type { KPIStats, InvoiceStatus } from "@/types/invoice";

export function calculateStats(rows: { status: InvoiceStatus; totalAmount: string; currency: string }[]): KPIStats {
  const currencies = new Set(rows.map((row) => row.currency));
  const mixed = currencies.size > 1;
  const amount = (status?: InvoiceStatus) => mixed ? null : rows
    .filter((row) => !status || row.status === status)
    .reduce((cents, row) => cents + Math.round(Number(row.totalAmount) * 100), 0) / 100;
  const count = (status: InvoiceStatus) => rows.filter((row) => row.status === status).length;
  return {
    currency: mixed ? null : (rows[0]?.currency ?? "USD"),
    processingCount: count("PROCESSING"), processingAmount: amount("PROCESSING"),
    needsReviewCount: count("NEEDS_REVIEW"), needsReviewAmount: amount("NEEDS_REVIEW"),
    approvedCount: count("APPROVED"), approvedAmount: amount("APPROVED"),
    rejectedCount: count("REJECTED"), rejectedAmount: amount("REJECTED"),
    totalCount: rows.length, totalAmount: amount(),
  };
}
