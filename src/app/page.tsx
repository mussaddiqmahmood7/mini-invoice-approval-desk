"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { KPIBar } from "@/components/KPIBar";
import { TabsNav } from "@/components/TabsNav";
import { FilterBar } from "@/components/FilterBar";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceDetailDrawer } from "@/components/InvoiceDetailDrawer";
import type { InvoiceWithRelations, KPIStats, TabType } from "@/types/invoice";
import { Sparkles, Database, ArrowUpRight } from "lucide-react";

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
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [stats, setStats] = useState<KPIStats>(INITIAL_STATS);
  const [vendors, setVendors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams();
      if (currentTab) params.set("tab", currentTab);
      if (search) params.set("search", search);
      if (selectedVendor && selectedVendor !== "ALL") params.set("vendor", selectedVendor);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setInvoices(json.data);
        if (json.stats) setStats(json.stats);
        if (json.vendors) setVendors(json.vendors);

        // Update selectedInvoice if it is currently open in drawer without causing re-renders
        setSelectedInvoice((prev) => {
          if (!prev) return null;
          const updated = json.data.find(
            (inv: InvoiceWithRelations) => inv.id === prev.id
          );
          return updated ? { ...prev, ...updated } : prev;
        });
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentTab, search, selectedVendor]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSelectInvoice = async (invoice: InvoiceWithRelations) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);

    // Fetch complete detail including duplicate relations if needed
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedInvoice(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch full invoice detail:", err);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    note?: string,
    actor?: string
  ) => {
    const res = await fetch(`/api/invoices/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note, actor }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update status");
    }

    setToastMessage(`Invoice successfully marked as ${status}`);
    setTimeout(() => setToastMessage(null), 4000);

    // Refresh data and update drawer view
    if (json.data) {
      setSelectedInvoice(json.data);
    }
    await fetchInvoices(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <Header
        onDataRefresh={() => fetchInvoices(true)}
        isRefreshing={isRefreshing}
        totalInvoices={stats.totalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top KPI Stats Bar */}
        <section aria-label="Key Performance Indicators">
          <KPIBar stats={stats} />
        </section>

        {/* Tabs and Invoice Ledger */}
        <div className="space-y-4 pt-2">
          {/* Tabs */}
          <TabsNav
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
            }}
            stats={stats}
          />

          {/* Search & Filter Toolbar */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            vendors={vendors}
            totalResults={invoices.length}
          />

          {/* Invoices List / Table */}
          <section aria-label="Invoice List">
            <InvoiceTable
              invoices={invoices}
              onSelectInvoice={handleSelectInvoice}
              selectedInvoiceId={selectedInvoice?.id}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <InvoiceDetailDrawer
        invoice={selectedInvoice}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs font-mono text-zinc-600">
        <p>SLEDGE: The Builders AI Office &bull; Mini Invoice Approval Desk &bull; Built by Mussaddiq Mahmood</p>
      </footer>
    </div>
  );
}
