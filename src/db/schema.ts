import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  jsonb,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const INVOICE_STATUSES = [
  "PROCESSING",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  vendorAddress: text("vendor_address"),
  vendorTaxId: varchar("vendor_tax_id", { length: 50 }),
  issueDate: timestamp("issue_date", { mode: "date" }).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 30 }).$type<InvoiceStatus>().default("PROCESSING").notNull(),
  flags: jsonb("flags").$type<string[]>().default([]).notNull(),
  duplicateOfId: uuid("duplicate_of_id").references((): AnyPgColumn => invoices.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const invoiceStatusHistory = pgTable("invoice_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  fromStatus: varchar("from_status", { length: 30 }).$type<InvoiceStatus | null>(),
  toStatus: varchar("to_status", { length: 30 }).$type<InvoiceStatus>().notNull(),
  actor: varchar("actor", { length: 100 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  items: many(invoiceItems),
  statusHistory: many(invoiceStatusHistory),
  duplicateOf: one(invoices, {
    fields: [invoices.duplicateOfId],
    references: [invoices.id],
    relationName: "invoice_duplicates",
  }),
  duplicates: many(invoices, {
    relationName: "invoice_duplicates",
  }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceStatusHistoryRelations = relations(
  invoiceStatusHistory,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [invoiceStatusHistory.invoiceId],
      references: [invoices.id],
    }),
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type InvoiceStatusHistory = typeof invoiceStatusHistory.$inferSelect;
export type NewInvoiceStatusHistory = typeof invoiceStatusHistory.$inferInsert;
