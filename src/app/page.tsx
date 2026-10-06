"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { KPIBar } from "@/components/KPIBar";
import { TabsNav } from "@/components/TabsNav";
import { FilterBar } from "@/components/FilterBar";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceDetailDrawer } from "@/components/InvoiceDetailDrawer";
import type { InvoiceWithRelations, KPIStats, TabType } from "@/types/invoice";
import {
  useInvoicesQuery,
  useInvoiceDetailQuery,
  useUpdateInvoiceStatus,
  useSeedDatabase,
} from "@/hooks/useInvoices";

const INITIAL_STATS: KPIStats = {
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
};

export default function ApprovalDeskPage() {
  const [currentTab, setCurrentTab] = useState<TabType>("processing");
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("ALL");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TanStack Query for invoices ledger
  const { data: invoicesResponse, isLoading } = useInvoicesQuery(
    currentTab,
    search,
    selectedVendor
  );

  // TanStack Query for selected invoice detail
  const { data: detailResponse } = useInvoiceDetailQuery(selectedInvoiceId);

  // Mutations
  const updateStatusMutation = useUpdateInvoiceStatus();
  const seedMutation = useSeedDatabase();

  const invoices = invoicesResponse?.data || [];
  const stats = invoicesResponse?.stats || INITIAL_STATS;
  const vendors = invoicesResponse?.vendors || [];

  // Active invoice in drawer is either full detail or list item fallback
  const activeInvoice =
    detailResponse?.data ||
    invoices.find((inv) => inv.id === selectedInvoiceId) ||
    null;

  const handleSelectInvoice = (invoice: InvoiceWithRelations) => {
    setSelectedInvoiceId(invoice.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    note?: string,
    actor?: string
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status, note, actor });
      setToastMessage(`Invoice successfully updated to ${status}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      alert("Error updating invoice: " + message);
    }
  };

  const handleSeed = async () => {
    await seedMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-150">
      {/* Top Header */}
      <Header
        onSeed={handleSeed}
        isSeeding={seedMutation.isPending}
        totalInvoices={stats.totalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-3.5 sm:space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 ml-4 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top KPI Stats Bar */}
        <section aria-label="Key Performance Indicators" className="w-full">
          <KPIBar stats={stats} />
        </section>

        {/* Tabs and Invoice Ledger */}
        <div className="space-y-2.5 sm:space-y-4 pt-1 sm:pt-2 w-full">
          {/* Tabs */}
          <TabsNav
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
            }}
            stats={stats}
          />

          {/* Search & Filter Toolbar with Shadcn Select */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            vendors={vendors}
            totalResults={invoices.length}
          />

          {/* Invoices List / Table */}
          <section aria-label="Invoice List" className="w-full">
            <InvoiceTable
              invoices={invoices}
              onSelectInvoice={handleSelectInvoice}
              selectedInvoiceId={selectedInvoiceId}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Slide-over Detail Drawer with Radix/Shadcn Sheet */}
      <InvoiceDetailDrawer
        invoice={activeInvoice}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/80 py-3.5 sm:py-4 text-center text-[11px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-600 transition-colors px-3">
        <p>SLEDGE: The Builders AI Office &bull; Mini Invoice Approval Desk &bull; Built by Mussaddiq Mahmood</p>
      </footer>
    </div>
  );
}
