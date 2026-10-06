import { db } from "./index";
import { invoices, invoiceItems, invoiceStatusHistory } from "./schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  // Clear existing records cleanly
  await db.execute(sql`TRUNCATE TABLE invoice_status_history, invoice_items, invoices CASCADE;`);

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // 1. Apex Concrete (PROCESSING)
  const [apex] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-CON-1041",
      vendorName: "Apex Concrete & Masonry Supply",
      vendorAddress: "450 Industrial Parkway, Dallas, TX 75201",
      vendorTaxId: "TX-992014-C",
      issueDate: daysAgo(5),
      dueDate: daysAhead(25),
      currency: "USD",
      subtotal: "17000.00",
      taxAmount: "1450.00",
      totalAmount: "18450.00",
      status: "PROCESSING",
      flags: ["PENDING_THREE_WAY_MATCH"],
      notes: "Commercial slab pour for Building B foundation. Delivery tickets #412-#419 attached.",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: apex.id,
      description: "4000 PSI Ready-Mix Foundation Concrete (45 cu yds)",
      quantity: "45.00",
      unitPrice: "185.00",
      amount: "8325.00",
    },
    {
      invoiceId: apex.id,
      description: "Grade 60 #4 Rebar Bundles 20ft (35 bundles)",
      quantity: "35.00",
      unitPrice: "125.00",
      amount: "4375.00",
    },
    {
      invoiceId: apex.id,
      description: "Concrete Pumper Truck 38M Boom Service (8 hrs)",
      quantity: "8.00",
      unitPrice: "350.00",
      amount: "2800.00",
    },
    {
      invoiceId: apex.id,
      description: "Curing Compound & Vapor Barrier Sealant",
      quantity: "10.00",
      unitPrice: "150.00",
      amount: "1500.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values({
    invoiceId: apex.id,
    fromStatus: null,
    toStatus: "PROCESSING",
    actor: "Sledge AI Pipeline",
    note: "Automated OCR extraction completed with 99.4% confidence score.",
    createdAt: daysAgo(5),
  });

  // 2. Titan Structural Steel Corp (NEEDS_REVIEW - Original Invoice)
  const [titanOriginal] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-STL-2094",
      vendorName: "Titan Structural Steel Fabricators",
      vendorAddress: "1200 Foundry Way, Pittsburgh, PA 15201",
      vendorTaxId: "PA-449102-S",
      issueDate: daysAgo(12),
      dueDate: daysAhead(18),
      currency: "USD",
      subtotal: "39000.00",
      taxAmount: "3800.00",
      totalAmount: "42800.00",
      status: "NEEDS_REVIEW",
      flags: ["POTENTIAL_DUPLICATE_SOURCE"],
      notes: "Heavy wide-flange steel framing for levels 3 & 4. Mill test reports verified.",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: titanOriginal.id,
      description: "W14x90 ASTM A992 Wide Flange Steel Beams (24 tons)",
      quantity: "24.00",
      unitPrice: "1250.00",
      amount: "30000.00",
    },
    {
      invoiceId: titanOriginal.id,
      description: "Structural Shop Primer Coating & Ultrasonic Testing",
      quantity: "1.00",
      unitPrice: "4500.00",
      amount: "4500.00",
    },
    {
      invoiceId: titanOriginal.id,
      description: "Heavy Crane Offloading & Rigging Staging (10 hrs)",
      quantity: "10.00",
      unitPrice: "450.00",
      amount: "4500.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values([
    {
      invoiceId: titanOriginal.id,
      fromStatus: null,
      toStatus: "PROCESSING",
      actor: "Sledge AI Pipeline",
      note: "Ingested from vendor portal electronic submission.",
      createdAt: daysAgo(12),
    },
    {
      invoiceId: titanOriginal.id,
      fromStatus: "PROCESSING",
      toStatus: "NEEDS_REVIEW",
      actor: "Sledge Anomaly Guard",
      note: "Subsequent duplicate invoice detected in billing cycle. Review required.",
      createdAt: daysAgo(10),
    },
  ]);

  // 3. Titan Structural Steel Corp (NEEDS_REVIEW - Exact Duplicate flagged)
  const [titanDuplicate] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-STL-2094-DUP",
      vendorName: "Titan Structural Steel Fabricators",
      vendorAddress: "1200 Foundry Way, Pittsburgh, PA 15201",
      vendorTaxId: "PA-449102-S",
      issueDate: daysAgo(10),
      dueDate: daysAhead(20),
      currency: "USD",
      subtotal: "39000.00",
      taxAmount: "3800.00",
      totalAmount: "42800.00",
      status: "NEEDS_REVIEW",
      flags: ["DUPLICATE_SUSPECTED", "HOLD_PAYMENT"],
      duplicateOfId: titanOriginal.id,
      notes: "AUTOMATED ALERT: Exact duplicate match detected against INV-STL-2094. Same vendor, identical line items, and identical total ($42,800.00).",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: titanDuplicate.id,
      description: "W14x90 ASTM A992 Wide Flange Steel Beams (24 tons)",
      quantity: "24.00",
      unitPrice: "1250.00",
      amount: "30000.00",
    },
    {
      invoiceId: titanDuplicate.id,
      description: "Structural Shop Primer Coating & Ultrasonic Testing",
      quantity: "1.00",
      unitPrice: "4500.00",
      amount: "4500.00",
    },
    {
      invoiceId: titanDuplicate.id,
      description: "Heavy Crane Offloading & Rigging Staging (10 hrs)",
      quantity: "10.00",
      unitPrice: "450.00",
      amount: "4500.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values([
    {
      invoiceId: titanDuplicate.id,
      fromStatus: null,
      toStatus: "PROCESSING",
      actor: "Sledge AI Pipeline",
      note: "Ingested via accounts payable inbound email attachment.",
      createdAt: daysAgo(10),
    },
    {
      invoiceId: titanDuplicate.id,
      fromStatus: "PROCESSING",
      toStatus: "NEEDS_REVIEW",
      actor: "Sledge AI Duplicate Engine",
      note: "CRITICAL: 100% itemization, quantity, and dollar amount match with existing INV-STL-2094. Automated hold placed.",
      createdAt: daysAgo(10),
    },
  ]);

  // 4. VoltWorks Commercial Electrical (PROCESSING)
  const [voltworks] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-ELC-3105",
      vendorName: "VoltWorks Commercial Electrical Inc",
      vendorAddress: "800 Ampere Blvd, Phoenix, AZ 85034",
      vendorTaxId: "AZ-330192-E",
      issueDate: daysAgo(3),
      dueDate: daysAhead(27),
      currency: "USD",
      subtotal: "8660.00",
      taxAmount: "570.00",
      totalAmount: "9230.00",
      status: "PROCESSING",
      flags: ["PENDING_ELECTRICAL_INSPECTION"],
      notes: "Main service distribution panel and feeder runs for sub-level parking deck.",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: voltworks.id,
      description: "480V 3-Phase 800A Main Distribution Switchboard",
      quantity: "1.00",
      unitPrice: "6200.00",
      amount: "6200.00",
    },
    {
      invoiceId: voltworks.id,
      description: "EMT Conduit 2-Inch Thinwall Bundles (2000 LF)",
      quantity: "20.00",
      unitPrice: "85.00",
      amount: "1700.00",
    },
    {
      invoiceId: voltworks.id,
      description: "Master Electrician Conduit Pull & Termination (8 hrs)",
      quantity: "8.00",
      unitPrice: "95.00",
      amount: "760.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values({
    invoiceId: voltworks.id,
    fromStatus: null,
    toStatus: "PROCESSING",
    actor: "Sledge AI Pipeline",
    note: "OCR parsing completed. Subcontractor insurance certificate verified.",
    createdAt: daysAgo(3),
  });

  // 5. Bulldog Earthmoving (APPROVED)
  const [bulldog] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-EXC-4012",
      vendorName: "Bulldog Earthmoving & Excavation LLC",
      vendorAddress: "310 Quarry Road, Denver, CO 80216",
      vendorTaxId: "CO-771890-B",
      issueDate: daysAgo(15),
      dueDate: daysAhead(15),
      currency: "USD",
      subtotal: "13320.00",
      taxAmount: "800.00",
      totalAmount: "14120.00",
      status: "APPROVED",
      flags: ["PO_MATCHED", "DRAW_SCHEDULE_CLEARED"],
      notes: "Mass grading and stormwater detention basin excavation per civil plans C-102.",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: bulldog.id,
      description: "CAT 336 Hydraulic Excavator Mass Earthmoving (40 hrs)",
      quantity: "40.00",
      unitPrice: "210.00",
      amount: "8400.00",
    },
    {
      invoiceId: bulldog.id,
      description: "Offsite Clean Fill Hauling (30 tri-axle loads)",
      quantity: "30.00",
      unitPrice: "150.00",
      amount: "4500.00",
    },
    {
      invoiceId: bulldog.id,
      description: "Laser Grade Verification & Compaction Testing",
      quantity: "1.00",
      unitPrice: "420.00",
      amount: "420.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values([
    {
      invoiceId: bulldog.id,
      fromStatus: null,
      toStatus: "PROCESSING",
      actor: "Sledge AI Pipeline",
      note: "Initial intake from field tablet submission.",
      createdAt: daysAgo(15),
    },
    {
      invoiceId: bulldog.id,
      fromStatus: "PROCESSING",
      toStatus: "NEEDS_REVIEW",
      actor: "Sledge Threshold Engine",
      note: "Standard review for invoices exceeding $10,000 threshold.",
      createdAt: daysAgo(14),
    },
    {
      invoiceId: bulldog.id,
      fromStatus: "NEEDS_REVIEW",
      toStatus: "APPROVED",
      actor: "Mussaddiq Mahmood (Project Engineer)",
      note: "Soil compaction certificates and laser survey reports verified. Approved for immediate payment draw.",
      createdAt: daysAgo(13),
    },
  ]);

  // 6. Keystone Plumbing (REJECTED)
  const [keystone] = await db
    .insert(invoices)
    .values({
      invoiceNumber: "INV-PLM-5088",
      vendorName: "Keystone Commercial Plumbing",
      vendorAddress: "620 Pipeline St, Chicago, IL 60607",
      vendorTaxId: "IL-882310-P",
      issueDate: daysAgo(8),
      dueDate: daysAhead(22),
      currency: "USD",
      subtotal: "6300.00",
      taxAmount: "450.00",
      totalAmount: "6750.00",
      status: "REJECTED",
      flags: ["UNAUTHORIZED_OVERTIME_RATE"],
      notes: "Sanitary DWV rough-in piping for Ground Floor Core A & B.",
    })
    .returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: keystone.id,
      description: "Cast Iron DWV Sanitary Rough-In Piping 4-inch (300 LF)",
      quantity: "300.00",
      unitPrice: "15.50",
      amount: "4650.00",
    },
    {
      invoiceId: keystone.id,
      description: "Overtime Emergency Water Main Tie-In Premium (10 hrs)",
      quantity: "10.00",
      unitPrice: "165.00",
      amount: "1650.00",
    },
  ]);

  await db.insert(invoiceStatusHistory).values([
    {
      invoiceId: keystone.id,
      fromStatus: null,
      toStatus: "PROCESSING",
      actor: "Sledge AI Pipeline",
      note: "Inbound invoice parsed from subcontractor PDF.",
      createdAt: daysAgo(8),
    },
    {
      invoiceId: keystone.id,
      fromStatus: "PROCESSING",
      toStatus: "NEEDS_REVIEW",
      actor: "Sledge Rate Compliance",
      note: "Emergency overtime rate ($165/hr) exceeds master subcontractor rate card ($115/hr). Flagged.",
      createdAt: daysAgo(7),
    },
    {
      invoiceId: keystone.id,
      fromStatus: "NEEDS_REVIEW",
      toStatus: "REJECTED",
      actor: "Mussaddiq Mahmood (Project Engineer)",
      note: "Unauthorized overtime rate applied. Re-bill with pre-approved straight time or submit signed change order.",
      createdAt: daysAgo(6),
    },
  ]);

  return {
    totalInvoices: 6,
    breakdown: {
      processing: 2,
      needsReview: 2,
      approved: 1,
      rejected: 1,
    },
  };
}
