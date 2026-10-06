"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InvoiceWithRelations, KPIStats, TabType } from "@/types/invoice";

interface InvoicesResponse {
  success: boolean;
  data: InvoiceWithRelations[];
  stats: KPIStats;
  vendors: string[];
  error?: string;
}

export function useInvoicesQuery(
  tab: TabType,
  search: string,
  vendor: string
) {
  return useQuery<InvoicesResponse>({
    queryKey: ["invoices", { tab, search, vendor }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tab) params.set("tab", tab);
      if (search) params.set("search", search);
      if (vendor && vendor !== "ALL") params.set("vendor", vendor);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load invoices");
      }
      return res.json();
    },
  });
}

export function useInvoiceDetailQuery(id: string | null | undefined) {
  return useQuery<{ success: boolean; data: InvoiceWithRelations; error?: string }>({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Failed to load invoice details");
      return res.json();
    },
    enabled: Boolean(id),
  });
}

interface UpdateStatusVariables {
  id: string;
  status: "APPROVED" | "REJECTED";
  note?: string;
  actor?: string;
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, note, actor }: UpdateStatusVariables) => {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, actor }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      return data.data as InvoiceWithRelations;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["invoices"] });

      // Snapshot previous data across active invoice queries
      const previousInvoicesQueries = queryClient.getQueriesData<InvoicesResponse>({
        queryKey: ["invoices"],
      });

      // Optimistically update every cached invoices query
      queryClient.setQueriesData<InvoicesResponse>(
        { queryKey: ["invoices"] },
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((inv) =>
              inv.id === id ? { ...inv, status } : inv
            ),
          };
        }
      );

      return { previousInvoicesQueries };
    },
    onError: (_err, _variables, context) => {
      // Rollback on failure
      if (context?.previousInvoicesQueries) {
        context.previousInvoicesQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch to guarantee sync with database
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useSeedDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to seed database");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
