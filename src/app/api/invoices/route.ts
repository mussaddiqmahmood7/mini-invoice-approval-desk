import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, invoiceStatusHistory, type InvoiceStatus } from "@/db/schema";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { KPIStats, TabType } from "@/types/invoice";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = (searchParams.get("tab") as TabType) || "all";
    const search = searchParams.get("search")?.trim() || "";
    const vendor = searchParams.get("vendor")?.trim() || "";

    // Build conditions for list query
    const conditions = [];

    // Tab filtering
    if (tab === "processing") {
      conditions.push(eq(invoices.status, "PROCESSING"));
    } else if (tab === "needs_review") {
      conditions.push(eq(invoices.status, "NEEDS_REVIEW"));
    } else if (tab === "approved_rejected") {
      conditions.push(inArray(invoices.status, ["APPROVED", "REJECTED"]));
    }

    // Search query
    if (search) {
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, `%${search}%`),
          ilike(invoices.vendorName, `%${search}%`)
        )
      );
    }

    // Vendor query
    if (vendor && vendor !== "ALL") {
      conditions.push(eq(invoices.vendorName, vendor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch invoices with relations
    const invoiceList = await db.query.invoices.findMany({
      where: whereClause,
      with: {
        items: true,
        statusHistory: {
          orderBy: (history, { desc }) => [desc(history.createdAt)],
        },
        duplicateOf: true,
      },
      orderBy: (inv, { desc }) => [desc(inv.createdAt)],
    });

    // Compute KPI stats across ALL invoices in DB
    const allInvoices = await db
      .select({
        status: invoices.status,
        totalAmount: invoices.totalAmount,
        vendorName: invoices.vendorName,
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

    const vendorSet = new Set<string>();

    for (const inv of allInvoices) {
      const amount = parseFloat(inv.totalAmount || "0");
      stats.totalAmount += amount;
      vendorSet.add(inv.vendorName);

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
      data: invoiceList,
      stats,
      vendors: Array.from(vendorSet).sort(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch invoices";
    console.error("API GET /api/invoices error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
        data: [],
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
        vendors: [],
      },
      { status: 500 }
    );
  }
}
