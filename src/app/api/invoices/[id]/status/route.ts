import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, invoiceStatusHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { updateStatusSchema } from "@/types/invoice";

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ success: false, error: "Invalid invoice ID" }, { status: 400 });
    }
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }
    const parsed = updateStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }
    const { status, note, actor } = parsed.data;
    // Lock before reading the previous state so concurrent decisions have accurate history.
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(invoices).where(eq(invoices.id, id)).for("update");
      if (!current) return { error: "Invoice not found", code: 404 };
      if (current.status === status) return { error: `Invoice is already in ${status} status`, code: 400 };
      const [updated] = await tx.update(invoices).set({ status, updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
      await tx.insert(invoiceStatusHistory).values({
        invoiceId: id, fromStatus: current.status, toStatus: status, actor,
        note: note || "Approved for payment",
      });
      const items = await tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      const statusHistory = await tx.select().from(invoiceStatusHistory).where(eq(invoiceStatusHistory.invoiceId, id)).orderBy(desc(invoiceStatusHistory.createdAt));
      const [duplicateOf] = updated.duplicateOfId
        ? await tx.select().from(invoices).where(eq(invoices.id, updated.duplicateOfId))
        : [];
      return { data: { ...updated, items, statusHistory, duplicateOf: duplicateOf ?? null } };
    });
    if ("error" in result) return NextResponse.json({ success: false, error: result.error }, { status: result.code });
    return NextResponse.json({ success: true, message: "Invoice status updated", data: result.data });
  } catch (error) {
    console.error("Invoice status update failed:", error);
    return NextResponse.json({ success: false, error: "Failed to update invoice status" }, { status: 500 });
  }
}
