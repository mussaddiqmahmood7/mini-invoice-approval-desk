import { db } from "./index";
import { invoices, invoiceItems, invoiceStatusHistory, type InvoiceStatus } from "./schema";
import { sql } from "drizzle-orm";

// Fictional examples covering ordinary purchases, services, and a suspected duplicate.
const samples: {
  number: string; vendor: string; status: InvoiceStatus; daysAgo: number;
  description: string; quantity: number; unitPrice: number; flag?: string; note: string;
}[] = [
  { number: "INV-1001", vendor: "Northstar Office Supply", status: "PROCESSING", daysAgo: 2,
    description: "Office supplies bundle", quantity: 5, unitPrice: 85, note: "Awaiting review of delivery receipt." },
  { number: "INV-1002", vendor: "Brightside Design Studio", status: "NEEDS_REVIEW", daysAgo: 5,
    description: "Product design services (hours)", quantity: 24, unitPrice: 125, flag: "REVIEW_REQUIRED", note: "Please confirm the delivered work before approval." },
  { number: "INV-1002-DUP", vendor: "Brightside Design Studio", status: "NEEDS_REVIEW", daysAgo: 4,
    description: "Product design services (hours)", quantity: 24, unitPrice: 125, flag: "DUPLICATE_SUSPECTED", note: "Suspected duplicate of INV-1002. Compare before making a decision." },
  { number: "INV-1003", vendor: "Cloudline Software", status: "PROCESSING", daysAgo: 1,
    description: "Monthly team software licenses", quantity: 12, unitPrice: 29, note: "Monthly subscription renewal awaiting review." },
  { number: "INV-1004", vendor: "Summit Logistics", status: "APPROVED", daysAgo: 8,
    description: "Regional delivery service", quantity: 3, unitPrice: 240, flag: "DELIVERY_CONFIRMED", note: "Delivery receipts verified. Approved for payment." },
  { number: "INV-1005", vendor: "Greenfield Maintenance", status: "REJECTED", daysAgo: 6,
    description: "Equipment maintenance (hours)", quantity: 6, unitPrice: 95, flag: "RATE_MISMATCH", note: "The hourly rate differs from the agreed quote. Please submit a corrected invoice." },
];

export async function seedDatabase({ reset = false } = {}) {
  return db.transaction(async (tx) => {
    const existing = await tx.select({ id: invoices.id }).from(invoices).limit(1);
    if (existing.length && !reset) throw new Error("Database already contains invoices. Use pnpm db:seed --reset only if you intend to replace all invoice data.");
    if (reset) await tx.execute(sql`TRUNCATE TABLE invoice_status_history, invoice_items, invoices CASCADE`);
    const now = Date.now();
    let originalId: string | undefined;
    for (const sample of samples) {
      const issueDate = new Date(now - sample.daysAgo * 86400000);
      const subtotal = sample.quantity * sample.unitPrice;
      const tax = subtotal * 0.1;
      const [invoice] = await tx.insert(invoices).values({
        invoiceNumber: sample.number, vendorName: sample.vendor, issueDate,
        dueDate: new Date(issueDate.getTime() + 30 * 86400000), currency: "USD",
        subtotal: subtotal.toFixed(2), taxAmount: tax.toFixed(2), totalAmount: (subtotal + tax).toFixed(2),
        status: sample.status, flags: sample.flag ? [sample.flag] : [], notes: sample.note,
        duplicateOfId: sample.flag === "DUPLICATE_SUSPECTED" ? originalId : null,
        createdAt: issueDate,
      }).returning();
      if (sample.number === "INV-1002") originalId = invoice.id;
      await tx.insert(invoiceItems).values({
        invoiceId: invoice.id, description: sample.description,
        quantity: sample.quantity.toFixed(2), unitPrice: sample.unitPrice.toFixed(2), amount: subtotal.toFixed(2),
      });
      await tx.insert(invoiceStatusHistory).values({
        invoiceId: invoice.id, fromStatus: null, toStatus: "PROCESSING", actor: "Demo import",
        note: "Fictional invoice imported for demonstration.", createdAt: issueDate,
      });
      if (sample.status !== "PROCESSING") await tx.insert(invoiceStatusHistory).values({
        invoiceId: invoice.id, fromStatus: "PROCESSING", toStatus: sample.status,
        actor: sample.status === "NEEDS_REVIEW" ? "Demo review queue" : "Demo reviewer",
        note: sample.note, createdAt: new Date(issueDate.getTime() + 3600000),
      });
    }
    return { totalInvoices: samples.length, breakdown: { processing: 2, needsReview: 2, approved: 1, rejected: 1 } };
  });
}
