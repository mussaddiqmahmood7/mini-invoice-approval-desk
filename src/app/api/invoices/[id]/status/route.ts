import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceStatusHistory, type InvoiceStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateStatusSchema } from "@/types/invoice";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const rawBody = await request.json();

    // Validate request body
    const parseResult = updateStatusSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status: targetStatus, note, actor } = parseResult.data;

    // Verify invoice exists
    const currentInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
    });

    if (!currentInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const fromStatus = currentInvoice.status as InvoiceStatus;
    const toStatus = targetStatus as InvoiceStatus;

    // Reject transitions to the same status
    if (fromStatus === toStatus) {
      return NextResponse.json(
        {
          success: false,
          error: `Invoice is already in ${toStatus} status`,
        },
        { status: 400 }
      );
    }

    // Execute atomic update & history logging
    const updatedInvoice = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(invoices)
        .set({
          status: toStatus,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id))
        .returning();

      await tx.insert(invoiceStatusHistory).values({
        invoiceId: id,
        fromStatus,
        toStatus,
        actor: actor || "Mussaddiq Mahmood (Project Engineer)",
        note: note || (toStatus === "APPROVED" ? "Approved by Project Engineer" : "Rejected"),
      });

      return updated;
    });

    // Fetch refreshed invoice with full relations
    const fullInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        items: true,
        statusHistory: {
          orderBy: (history, { desc }) => [desc(history.createdAt)],
        },
        duplicateOf: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice status successfully updated from ${fromStatus} to ${toStatus}`,
      data: fullInvoice || updatedInvoice,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update invoice status";
    console.error("API PATCH /api/invoices/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
