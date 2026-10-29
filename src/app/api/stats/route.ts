import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { calculateStats } from "@/lib/stats";

export async function GET() {
  try {
    const rows = await db.select({ status: invoices.status, totalAmount: invoices.totalAmount, currency: invoices.currency }).from(invoices);
    return NextResponse.json({ success: true, stats: calculateStats(rows) });
  } catch (error) {
    console.error("Invoice stats failed:", error);
    return NextResponse.json({ success: false, error: "Failed to load invoice statistics" }, { status: 500 });
  }
}
