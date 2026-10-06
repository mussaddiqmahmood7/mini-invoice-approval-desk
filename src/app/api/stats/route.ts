import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import type { KPIStats } from "@/types/invoice";

export async function GET() {
  try {
    const allInvoices = await db
      .select({
        status: invoices.status,
        totalAmount: invoices.totalAmount,
      })
      .from(invoices);

    const stats: KPIStats = {
      processingCount: 0,
      processingAmount: 0,
      needsReviewCount: 0,
      needsReviewAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
      totalCount: allInvoices.length,
      totalAmount: 0,
    };

    for (const inv of allInvoices) {
      const amount = parseFloat(inv.totalAmount || "0");
      stats.totalAmount += amount;

      if (inv.status === "PROCESSING") {
        stats.processingCount += 1;
        stats.processingAmount += amount;
      } else if (inv.status === "NEEDS_REVIEW") {
        stats.needsReviewCount += 1;
        stats.needsReviewAmount += amount;
      } else if (inv.status === "APPROVED") {
        stats.approvedCount += 1;
        stats.approvedAmount += amount;
      } else if (inv.status === "REJECTED") {
        stats.rejectedCount += 1;
        stats.rejectedAmount += amount;
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load stats";
    return NextResponse.json(
      {
        success: false,
        error: message,
        stats: {
          processingCount: 0,
          processingAmount: 0,
          needsReviewCount: 0,
          needsReviewAmount: 0,
          approvedCount: 0,
          approvedAmount: 0,
          rejectedCount: 0,
          rejectedAmount: 0,
          totalCount: 0,
          totalAmount: 0,
        },
      },
      { status: 500 }
    );
  }
}
